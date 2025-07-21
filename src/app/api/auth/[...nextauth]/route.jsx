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
              title: "ברוכים הבאים לסטודיו בועז! 🌟",
              content: `מנויים אהובים,\n\nאיזה כיף שהצטרפתם!\nהצעד הזה מסמן התחלה של מסע – תנועתי, רגשי, תודעתי. מסע שבו תלמדו להכיר את הגוף לעומק, לפתח מודעות סומאטית, לנשום אחרת, ולנוע מתוך הקשבה ולא מתוך מאמץ.\n\nאני מאמין שכל אדם – בכל גיל ובכל שלב – יכול לגלות את העוצמה, הריפוי והחיוניות שטמונים בגופו. וכאן, בסטודיו, אני מזמין אתכם לצלול פנימה. להרגיש. לחקור. להשתחרר.\n\nמה עכשיו?\nבחרו מסלול שמתאים לכם – יש שיעורים קצרים, ארוכים, נושאים ממוקדים, תרגולי נשימה, והרבה ידע מעשי\n\nקחו את הזמן – אל תמהרו. זה לא מרתון, זה ריקוד\n\nסמכו על הגוף – הוא יודע את הדרך\n\nאני כאן איתכם – בכל שיעור, בכל תנועה, עם הלב פתוח והכוונה מדויקת.\nמאחל לכם התחלה נעימה, מסקרנת ומחוברת.\n\nשלכם בתנועה,\nבועז נחייסי`,
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
