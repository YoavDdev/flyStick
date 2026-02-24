export const dynamic = 'force-dynamic';
// reset-password.js

import prisma from "../../libs/prismadb";
import { v4 as uuidv4 } from "uuid";
import { NextResponse } from "next/server";
import { Resend } from 'resend';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email || !email.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Retrieve user based on the provided email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      // Don't reveal if user exists or not (security best practice)
      return NextResponse.json({ 
        success: true, 
        message: "If this email exists, a password reset link has been sent" 
      }, { status: 200 });
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

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY is not configured');
      return NextResponse.json({ 
        error: "Email service is not configured. Please contact support." 
      }, { status: 503 });
    }

    // Initialize Resend
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Send password reset email using Resend
    console.log('🔄 Sending password reset email to:', user.email);
    
    const { data, error } = await resend.emails.send({
      from: 'Studio Boaz <info@mail.studioboazonline.com>',
      to: user.email,
      subject: 'איפוס סיסמה - Studio Boaz',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F7F3EB; direction: rtl;">
          <div style="background-color: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #2D3142; margin-bottom: 20px; text-align: center; direction: rtl;">איפוס סיסמה</h2>
            
            <p style="color: #3D3D3D; line-height: 1.6; margin-bottom: 20px; text-align: right;">שלום ${user.name || ''},</p>
            
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
      // Don't expose internal errors to user
      return NextResponse.json({ 
        error: "Failed to send reset email. Please try again or contact support." 
      }, { status: 500 });
    }
    
    console.log('✅ Password reset email sent successfully:', data);

    return NextResponse.json({ success: true, message: "Password reset initiated" }, { status: 200 });
  } catch (error) {
    console.error("❌ Error initiating password reset:", error);
    // Log the full error but return generic message to user
    return NextResponse.json({ 
      error: "An error occurred. Please try again later." 
    }, { status: 500 });
  }
}

