import NextAuth from "next-auth/next";
import prisma from "../../../libs/prismadb";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";

import GoogleProvider from "next-auth/providers/google";

import bcrypt from "bcrypt";

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
        username: {
          label: "Username",
          type: "text",
          placeholder: "Name",
        },
      },
      async authorize(credentials) {
        //check to see is the email and passord is there
        if (!credentials.email || !credentials.password) {
          throw new Error("Please enter an email and password");
        }
        //check to see id the user exists
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });
        // if no user was found
        if (!user || !user?.hashedPassword) {
          throw new Error("No user found");
        }
        // check to see if the paswword matches
        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.hashedPassword,
        );
        //if password not match
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
  // process.env.NODE_ENV === "development"
  events: {
    signIn: async ({ user }) => {
      console.log(user.id);

      const isFolderExist = await prisma.folder.findFirst({
        where: {
          userId: user.id,
          name: "favorites",
        },
      });

      if (!isFolderExist) {
        await prisma.folder.create({
          data: {
            userId: user.id,
            name: "favorites",
            urls: [],
          },
        });
      }
    },

    async signOut(message) {
      /* on signout */
    },
  },
};

const handler = NextAuth(authOption);
export { handler as GET, handler as POST };
