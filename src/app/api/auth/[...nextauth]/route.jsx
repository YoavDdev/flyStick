import NextAuth from "next-auth/next";
import prisma from "../../../libs/prismadb";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcrypt";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),

    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "Email" },
        password: { label: "Password", type: "password" },
        username: { label: "Username", type: "text", placeholder: "Name" },
      },
      async authorize(credentials) {
        if (!credentials.email || !credentials.password) {
          throw new Error("Please enter an email and password");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user?.hashedPassword) {
          throw new Error("No user found");
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!passwordMatch) {
          throw new Error("Incorrect password");
        }

        return user;
      },
    }),
  ],
  secret: process.env.SECRET,
  session: {
    strategy: "jwt",
  },
  debug: false,
  events: {
    signIn: async ({ user, account }) => {
      console.log(`User signed in: ${user.id}`);

      // Check if this is a new user (created recently)
      const userData = await prisma.user.findUnique({
        where: { id: user.id },
        select: { 
          id: true, 
          email: true, 
          createdAt: true,
          messageReads: {
            where: {
              message: {
                title: "Welcome to Studio Boaz Online! 🌟"
              }
            }
          }
        }
      });

      // Check if user is new (created within last 24 hours) and hasn't received welcome message
      const isNewUser = userData && 
        new Date() - new Date(userData.createdAt) < 24 * 60 * 60 * 1000 && 
        userData.messageReads.length === 0;

      // Send welcome message for new users
      if (isNewUser) {
        try {
          await prisma.message.create({
            data: {
              title: "ברוכים הבאים לסטודיו שלי!",
              content: `זהו, אתם מנויים ואני מאד שמח בשבילכם כי הסטודיו הוא סיכום הדרך הייחודית שבניתי מהחוויה האישית שלי ומשלל עצום של תובנות שקיבלתי וממשיכות להגיע וארזתי הכל לשיטות חדשניות הנגישות לכל אדם הרוצה להכיר את גופו ותודעתו.\n\nהצעד הזה מסמן התחלה של מסע- תנועתי, גופני, אישי, רגשי ותודעתי. מסע שבו תלמדו להכיר את הגוף לעומק, לפתח מודעות סומאטית תחושתית, לנשום בתלת מימד ולנוע מתוך הקשבה. כל זאת בשפה פשוטה ונגישה שנוצרה מעבודת השטח לאורך השנים כשאני פוגש מאות אנשים בשבוע.\n\nאני מאמין שכל אדם- בכל גיל ובכל שלב- יכול לגלות את העוצמה, הריפוי והחיוניות שטמונים בגופו ורוחו.\n\nהסטודיו הזה הוא פרוייקט חיים והוא משלב אינספור רעיונות ותובנות שיעזרו לכם לצלול למרחבים בהם ביקרתי. הסטודיו מציע לכם מסלולים שונים של הכשרה, שיעורים במבנים שונים, טכניקות רבות ועוד.\n\nקחו את הזמן. אל תמהרו. תתחילו בקטן ותמשיכו. תהיו בהקשבה. זה לא מרתון. הגוף הוא חליפה גלקטית שמביעה את הלך רוחנו ולכן כל תנועה תביא סיפור ששווה לראות ולהרגיש.\n\nזה כמו ריקוד, סימכו על הגוף ותנו לו גם להוביל, בלב פתוח וכוונה מדויקת.\n\nאני מאחל לכם לא פחות מהתאהבות.\n\nלא בי אלא בהיותכם, בקיומכם ושתתרגשו כל יום מחווית החיים דרך הסטודיו המופלא הזה שכולו אהבה וריפוי. ממש כמו הגוף.\n\nאני מאחל לכם התחלה נעימה, שהות מסקרנת ופליאה, הרבה פליאה פנימית.\n\nשימו לב כי בתחתית האתר תמצאו את המדריך השימושי לאתר בו תוכלו לקבל הסברים כיצד להשתמש באתר ולהבין כיצד הוא בנוי.\n\nשלכם, בועז.`,
              link: "https://www.studioboazonline.com/explore",
              linkText: "התחילו את המסע שלכם כאן",
              isActive: true
            }
          });
          console.log(`✅ Welcome message sent to new user: ${user.email}`);
        } catch (error) {
          console.error(`❌ Error sending welcome message to ${user.email}:`, error);
        }
      }

      // Create "favorites" folder if not exists
      const isFolderExist = await prisma.folder.findFirst({
        where: { userId: user.id, name: "favorites" },
      });

      if (!isFolderExist) {
        await prisma.folder.create({
          data: { userId: user.id, name: "favorites", urls: [] },
        });
      }

      // Subscribe Google sign-in users to newsletter
      if (account.provider === "google") {
        try {
          const newsletterResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/newsletter/subscribe`, {
            method: 'POST',
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              source: 'google_auth'
            })
          });

          if (newsletterResponse.ok) {
            console.log("✅ User subscribed to newsletter");
          } else {
            const errorData = await newsletterResponse.json();
            console.error("❌ Newsletter subscription error:", errorData.error);
          }
        } catch (error) {
          console.error("❌ Newsletter subscription error:", error);
        }
      }
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
