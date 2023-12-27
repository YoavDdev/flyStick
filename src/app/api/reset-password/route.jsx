// reset-password.js

import bcrypt from "bcrypt";
import prisma from "../../libs/prismadb";
import { v4 as uuidv4 } from "uuid";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body;

    // Retrieve user based on the provided email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Generate a unique token using uuid
    const token = uuidv4();

    // Save the token, user ID, and expiration timestamp in the database
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 3600000), // Token expires in 1 hour
      },
    });

    // Send a confirmation email with the reset link
    // const transporter = nodemailer.createTransport({
    //   service: "gmail",
    //   auth: {
    //     user: process.env.EMAIL_USER,
    //     pass: process.env.EMAIL_PASSWORD,
    //   },
    // });

    const transporter = nodemailer.createTransport({
      host: "mail.privateemail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    const mailOptions = {
      from: '"Support" <' + process.env.EMAIL_USER + ">",
      to: user.email,
      subject: "Password Reset",
      html: `
        <p>Hello,</p>
        <p>We received a request to reset your password. Click the link below to reset your password:</p>
        <p>
          <a href="https://www.studioboazonline.com/reset-password?token=${token}" target="_blank" rel="noopener noreferrer">
            Reset Password
          </a>
        </p>
        <p>This link is valid for the next 1 hour. If you didn't request a password reset, please ignore this email.</p>
        <p>Thank you,</p>
        <p>Boaz Nahaisi's Online Studio</p>
      `,
    };
    await transporter.sendMail(mailOptions);

    return new NextResponse({ message: "Password reset initiated" });
  } catch (error) {
    console.error("Error initiating password reset:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { token, password } = body;

    // Validate token, check expiration, etc. (Add your validation logic here)
    const resetInfo = await prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetInfo || resetInfo.expiresAt < new Date()) {
      return new NextResponse("Invalid or expired token", { status: 400 });
    }

    // Update user's password
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: resetInfo.userId },
      data: { hashedPassword },
    });

    // Delete the used reset token
    await prisma.passwordReset.delete({ where: { token } });

    return new NextResponse({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error completing password reset:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
