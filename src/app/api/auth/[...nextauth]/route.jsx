import NextAuth from "next-auth/next";
import prisma from "../../../libs/prismadb";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcrypt";
import axios from "axios";

const authOption = {
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

      // Create "favorites" folder if not exists
      const isFolderExist = await prisma.folder.findFirst({
        where: { userId: user.id, name: "favorites" },
      });

      if (!isFolderExist) {
        await prisma.folder.create({
          data: { userId: user.id, name: "favorites", urls: [] },
        });
      }

      // Subscribe Google sign-in users to ConvertKit newsletter
      if (account.provider === "google") {
        try {
          await axios.post(
            `https://api.convertkit.com/v3/forms/${process.env.CONVERTKIT_FORM_ID}/subscribe`,
            {
              api_key: process.env.CONVERTKIT_API_KEY,
              email: user.email,
            },
            { headers: { "Content-Type": "application/json; charset=utf-8" } }
          );
          console.log("✅ User subscribed to ConvertKit newsletter");
        } catch (error) {
          console.error("❌ ConvertKit subscription error:", error);
        }
      }
    },
  },
};

const handler = NextAuth(authOption);
export { handler as GET, handler as POST };
