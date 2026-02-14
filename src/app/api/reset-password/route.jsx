export const dynamic = 'force-dynamic';
// reset-password.js

import bcrypt from "bcrypt";
import prisma from "../../libs/prismadb";
import { v4 as uuidv4 } from "uuid";
import { NextResponse } from "next/server";
import { Resend } from 'resend';

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

    // Initialize Resend
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Send password reset email using Resend
    console.log('🔄 Sending password reset email to:', user.email);
    
    const { data, error } = await resend.emails.send({
      from: 'info@studioboazonline.com',
      to: user.email,
      subject: 'איפוס סיסמה - Studio Boaz',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F7F3EB; direction: rtl;">
          <div style="background-color: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #2D3142; margin-bottom: 20px; text-align: center; direction: rtl;">איפוס סיסמה</h2>
            
            <p style="color: #3D3D3D; line-height: 1.6; margin-bottom: 20px; text-align: right;">שלום,</p>
            
            <p style="color: #3D3D3D; line-height: 1.6; margin-bottom: 20px; text-align: right;">
              קיבלנו בקשה לאיפוס הסיסמה שלך. לחץ על הקישור למטה כדי לאפס את הסיסמה:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://www.studioboazonline.com/reset-password?token=${token}" 
                 style="background-color: #D5C4B7; color: #2D3142; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                איפוס סיסמה
              </a>
            </div>
            
            <p style="color: #3D3D3D; line-height: 1.6; margin-bottom: 20px; text-align: right;">
              הקישור תקף למשך שעה אחת. אם לא ביקשת איפוס סיסמה, אנא התעלם מהודעה זו.
            </p>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #D5C4B7;">
              <p style="color: #B8A99C; font-size: 14px;">
                בברכה,<br>Studio Boaz
              </p>
            </div>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('❌ Password reset email failed:', error);
      throw new Error('Failed to send password reset email');
    }
    
    console.log('✅ Password reset email sent successfully:', data);

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
