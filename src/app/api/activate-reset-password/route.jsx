export const dynamic = 'force-dynamic';
// activate-reset-password/route.jsx

import bcrypt from "bcrypt";
import prisma from "../../libs/prismadb";
import { NextResponse } from "next/server";

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { token, password } = body;

    // Validate input
    if (!token || !token.trim()) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    // Find the reset token
    const resetInfo = await prisma.passwordReset.findUnique({
      where: {
        token: token.trim(),
      },
      include: {
        user: true,
      },
    });

    if (!resetInfo) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    // Check if token has expired
    if (resetInfo.expiresAt < new Date()) {
      // Delete expired token
      await prisma.passwordReset.delete({
        where: { token: resetInfo.token },
      });
      return NextResponse.json({ error: "Token has expired. Please request a new password reset." }, { status: 400 });
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
        token: resetInfo.token,
      },
    });

    console.log('✅ Password reset successful for user:', resetInfo.userId);
    return NextResponse.json({ success: true, message: "Password reset successful" }, { status: 200 });
  } catch (error) {
    console.error("❌ Error completing password reset:", error);
    return NextResponse.json({ 
      error: "An error occurred while resetting password. Please try again." 
    }, { status: 500 });
  }
}
