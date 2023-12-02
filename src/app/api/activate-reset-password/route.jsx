// activate-reset-password/route.jsx

import bcrypt from "bcrypt";
import prisma from "../../libs/prismadb";
import { NextResponse } from "next/server";

export async function handler(request) {
  if (request.method === "PATCH") {
    try {
      const body = await request.json();
      const { token, password } = body;

      // Validate token, check expiration, etc. (Add your validation logic here)
      const resetInfo = await prisma.passwordReset.findFirst({
        where: {
          token,
        },
        include: {
          user: true,
        },
      });

      if (!resetInfo || resetInfo.expiresAt < new Date()) {
        return new NextResponse("Invalid or expired token", { status: 400 });
      }

      // Update user's password
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: {
          id: resetInfo.userId,
        },
        data: { hashedPassword },
      });

      // Delete the used reset token
      await prisma.passwordReset.delete({
        where: {
          id: resetInfo.id, // Assuming resetInfo has the id field
          token: resetInfo.token,
        },
      });

      return new NextResponse({ message: "Password reset successful" });
    } catch (error) {
      console.error("Error completing password reset:", error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  } else {
    return new NextResponse("Method Not Allowed", { status: 405 });
  }
}

export { handler as PATCH, handler as POST };
