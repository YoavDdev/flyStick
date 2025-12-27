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
    strategy: /** @type {"jwt"} */ ("jwt"),
  },
  debug: false,
  events: {
    signIn: async ({ user, account }) => {
      try {
        console.log(`User signed in: ${user.id}`);

        // Check if this is a new user (created recently) - simplified query
        const userData = await prisma.user.findUnique({
          where: { id: user.id },
          select: { 
            id: true, 
            email: true, 
            createdAt: true,
            hasSeenWelcomeMessage: true
          }
        }).catch(err => {
          console.error("Error fetching user data:", err);
          return null;
        });

        // Note: hasSeenWelcomeMessage flag will be set to true when user dismisses the welcome popup
        // This ensures the popup shows for new users on their first dashboard visit
        if (userData && !userData.hasSeenWelcomeMessage) {
          console.log(`🎯 New user detected, welcome popup will be shown: ${user.email}`);
        }

        // Create "favorites" folder if not exists
        try {
          const isFolderExist = await prisma.folder.findFirst({
            where: { userId: user.id, name: "favorites" },
          });

          if (!isFolderExist) {
            await prisma.folder.create({
              data: { userId: user.id, name: "favorites", urls: [] },
            });
          }
        } catch (folderError) {
          console.error("Error creating favorites folder:", folderError);
          // Don't block login if folder creation fails
        }

        // Subscribe Google sign-in users to newsletter (non-blocking)
        if (account?.provider === "google") {
          // Run newsletter subscription in background without blocking login
          setTimeout(async () => {
            try {
              const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL 
                ? `https://${process.env.VERCEL_URL}` 
                : 'http://localhost:3000';
              
              const newsletterResponse = await fetch(`${baseUrl}/api/newsletter/subscribe`, {
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
                const errorData = await newsletterResponse.json().catch(() => ({}));
                console.error("❌ Newsletter subscription error:", errorData.error || "Unknown error");
              }
            } catch (error) {
              console.error("❌ Newsletter subscription error:", error);
            }
          }, 100); // Run after 100ms to not block login
        }
      } catch (error) {
        console.error("❌ SignIn event error:", error);
        // Don't throw error - allow login to proceed even if event handler fails
      }
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
