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
          hasSeenWelcomeMessage: true,
          messageReads: {
            where: {
              OR: [
                {
                  message: {
                    title: "Welcome to Studio Boaz Online! 🌟"
                  }
                },
                {
                  message: {
                    title: "ברוכים הבאים לסטודיו שלי!"
                  }
                }
              ]
            }
          }
        }
      });

      // Check if user hasn't received welcome message yet (regardless of when they were created)
      // We check both the messageReads and the hasSeenWelcomeMessage flag
      const hasNotReceivedWelcomeMessage = userData && userData.messageReads.length === 0 && !userData.hasSeenWelcomeMessage;

      // Send welcome message only if they haven't received it before
      if (hasNotReceivedWelcomeMessage) {
        try {
          // Create the welcome message
          await prisma.message.create({
            data: {
              title: "ברוכים הבאים לסטודיו שלי!",
              content: `זהו, אתם מנויים ואני מאד שמח בשבילכם, כי הסטודיו הוא סיכום הדרך הייחודית שבניתי מהחוויה האישית שלי, ומשלל עצום של תובנות שקיבלתי וממשיכות להגיע. ארזתי הכל לשיטות חדשניות הנגישות לכל אדם הרוצה להכיר את גופו ותודעתו.

הצעד הזה מסמן התחלה של מסע - תנועתי, גופני, אישי, רגשי ותודעתי. מסע שבו תלמדו להכיר את הגוף לעומק, לפתח מודעות סומאטית תחושתית, לנשום בתלת מימד, ולנוע מתוך הקשבה. כל זאת בשפה פשוטה ונגישה שנוצרה מעבודת השטח לאורך השנים, כשאני פוגש מאות אנשים בשבוע.

אני מאמין שכל אדם - בכל גיל ובכל שלב - יכול לגלות את העוצמה, הריפוי, והחיוניות שטמונים בגופו ורוחו.

הסטודיו הזה הוא פרוייקט חיים, והוא משלב אינספור רעיונות ותובנות שיעזרו לכם לצלול למרחבים בהם ביקרתי. הסטודיו מציע לכם מסלולים שונים של הכשרה, שיעורים במבנים שונים, טכניקות רבות, ועוד.

קחו את הזמן. אל תמהרו. תתחילו בקטן ותמשיכו. תהיו בהקשבה. זה לא מרתון. הגוף הוא חליפה גלקטית שמביעה את הלך רוחנו, ולכן כל תנועה תביא סיפור ששווה לראות ולהרגיש.

זה כמו ריקוד, סימכו על הגוף ותנו לו גם להוביל, בלב פתוח וכוונה מדויקת.

אני מאחל לכם לא פחות מהתאהבות.

לא בי, אלא בהיותכם, בקיומכם, ושתתרגשו כל יום מחווית החיים דרך הסטודיו המופלא הזה שכולו אהבה וריפוי. ממש כמו הגוף.

אני מאחל לכם התחלה נעימה, שהות מסקרנת ופליאה, הרבה פליאה פנימית.

שימו לב כי בתחתית האתר תמצאו את המדריך השימושי לאתר, בו תוכלו לקבל הסברים כיצד להשתמש באתר ולהבין כיצד הוא בנוי.

שלכם,
בועז.`,
              link: "https://www.studioboazonline.com/explore",
              linkText: "התחילו את המסע שלכם כאן",
              isActive: true
            }
          });
          
          // Also set a flag on the user to indicate they've seen the welcome message
          // This ensures they won't see it again even if the message is deleted
          await prisma.user.update({
            where: { id: user.id },
            data: { hasSeenWelcomeMessage: true }
          });
          console.log(`✅ Welcome message sent to user: ${user.email}`);
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
