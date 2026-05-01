export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions as authOptionsImport } from "../../auth/[...nextauth]/route.jsx";
import prisma from "@/app/libs/prismadb";
import { Resend } from "resend";

const authOptions = authOptionsImport as any;

const ALLOWED_TEST_EMAIL = "yoavddev@gmail.com";

export async function POST(request: NextRequest) {
  try {
    // Verify admin
    const session = await getServerSession(authOptions) as any;
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.subscriptionId !== "Admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { test, email } = body;

    // Safety: only allow sending to test email
    if (email !== ALLOWED_TEST_EMAIL) {
      return NextResponse.json({ error: "בדיקה מותרת רק למייל הבדיקה" }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: "RESEND_API_KEY לא מוגדר" }, { status: 500 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const timestamp = new Date().toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" });

    if (test === "direct") {
      // Test 1: Simple direct email
      const { data, error } = await resend.emails.send({
        from: "Studio Boaz <info@mail.studioboazonline.com>",
        to: email,
        subject: `🧪 בדיקת אימייל ישיר - ${timestamp}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background-color: #F7F3EB; direction: rtl;">
            <div style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <h2 style="color: #2D3142; text-align: center;">🧪 בדיקת אימייל ישיר</h2>
              <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <p style="color: #2e7d32; font-size: 18px; font-weight: bold; margin: 0;">✅ האימייל הגיע בהצלחה!</p>
              </div>
              <p style="color: #3D3D3D; text-align: right;">Resend API עובד תקין.</p>
              <p style="color: #999; font-size: 12px; text-align: right;">נשלח ב: ${timestamp}</p>
            </div>
          </div>
        `,
      });

      if (error) {
        console.error("❌ Direct email test failed:", error);
        return NextResponse.json({ error: `Resend error: ${JSON.stringify(error)}` }, { status: 500 });
      }

      console.log("✅ Direct email test sent:", data);
      return NextResponse.json({ success: true, type: "direct", resendId: data?.id });
    }

    if (test === "message") {
      // Test 2: Simulates "send message to all users" flow - create message + send email
      const message = await prisma.message.create({
        data: {
          title: "🧪 בדיקת הודעת מערכת",
          content: `זוהי הודעת בדיקה שנשלחה ב-${timestamp}. אם ההודעה נקראת, המערכת עובדת!`,
          targetUserIds: [user.id], // Only target the admin user
          isActive: true,
        },
      });

      const { data, error } = await resend.emails.send({
        from: "Studio Boaz <info@mail.studioboazonline.com>",
        to: email,
        subject: `🧪 בדיקת הודעת מערכת - ${timestamp}`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background-color: #F7F3EB; direction: rtl;">
            <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
              <div style="background: white; padding: 20px; text-align: center; border-bottom: 3px solid #D5C4B7;">
                <img src="https://studioboazonline.com/apple-touch-icon.png" alt="Studio Boaz" style="height: 60px; width: auto;" />
                <div style="margin-top: 8px;">
                  <a href="https://studioboazonline.com" style="color: #2D3142; text-decoration: none; font-size: 14px; font-weight: 600;">www.studioboazonline.com</a>
                </div>
              </div>
              <div style="background: linear-gradient(135deg, #D5C4B7, #B8A99C); padding: 25px; text-align: center;">
                <div style="font-size: 32px; margin-bottom: 8px;">✉️</div>
                <h1 style="color: white; margin: 0; font-size: 20px; font-weight: bold;">הודעה חדשה מבועז</h1>
              </div>
              <div style="padding: 25px;">
                <p style="color: #2D3142; font-size: 16px;">שלום ${user.name || ""},</p>
                <p style="color: #2D3142; font-size: 15px;">הודעה חדשה באתר הסטודיו:</p>
                <div style="background: #F7F3EB; border-right: 4px solid #D5C4B7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #2D3142; margin: 0 0 8px 0;">🧪 בדיקת הודעת מערכת</h3>
                  <p style="color: #3D3D3D; font-size: 14px; margin: 0;">זוהי הודעת בדיקה. אם ההודעה נקראת - המערכת עובדת מצוין!</p>
                </div>
                <div style="text-align: center; margin: 25px 0;">
                  <a href="https://studioboazonline.com/dashboard" style="background: linear-gradient(135deg, #D5C4B7, #B8A99C); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block;">
                    לצפייה באיזור האישי
                  </a>
                </div>
                <div style="background: #fff3cd; padding: 10px; border-radius: 6px; margin-top: 15px;">
                  <p style="color: #856404; font-size: 12px; margin: 0; text-align: center;">🧪 זוהי הודעת בדיקה בלבד - נשלח ב: ${timestamp}</p>
                </div>
              </div>
              <div style="background: #2D3142; color: white; padding: 15px; text-align: center;">
                <p style="margin: 0; font-size: 13px; opacity: 0.8;">Studio Boaz Online - בועז נחייסי</p>
              </div>
            </div>
          </div>
        `,
      });

      if (error) {
        console.error("❌ Message email test failed:", error);
        return NextResponse.json({ error: `Resend error: ${JSON.stringify(error)}` }, { status: 500 });
      }

      console.log("✅ Message email test sent:", data);
      return NextResponse.json({ success: true, type: "message", messageId: message.id, resendId: data?.id });
    }

    if (test === "newsletter") {
      // Test 3: Newsletter-style email
      const { data, error } = await resend.emails.send({
        from: "Studio Boaz <info@mail.studioboazonline.com>",
        to: email,
        subject: `🧪 בדיקת ניוזלטר - ${timestamp}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F7F3EB; direction: rtl;">
            <div style="background-color: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #2D3142; margin-bottom: 20px; text-align: center;">🧪 בדיקת ניוזלטר</h2>
              
              <p style="color: #3D3D3D; line-height: 1.8; text-align: right;">שלום ${user.name || ""},</p>
              
              <div style="color: #3D3D3D; line-height: 1.6; text-align: right; white-space: pre-wrap;">זוהי הודעת בדיקה של מערכת הניוזלטר.
              
אם האימייל הזה הגיע - הניוזלטר עובד כמו שצריך! 🎉</div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://studioboazonline.com" style="background-color: #D5C4B7; color: #2D3142; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                  לאתר הסטודיו
                </a>
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #D5C4B7;">
                <p style="color: #B8A99C; font-size: 14px;">
                  בברכה,<br>Studio Boaz
                </p>
                <div style="background: #fff3cd; padding: 8px; border-radius: 6px; margin-top: 10px;">
                  <p style="color: #856404; font-size: 11px; margin: 0;">🧪 בדיקה בלבד - ${timestamp}</p>
                </div>
              </div>
            </div>
          </div>
        `,
      });

      if (error) {
        console.error("❌ Newsletter email test failed:", error);
        return NextResponse.json({ error: `Resend error: ${JSON.stringify(error)}` }, { status: 500 });
      }

      console.log("✅ Newsletter email test sent:", data);
      return NextResponse.json({ success: true, type: "newsletter", resendId: data?.id });
    }

    return NextResponse.json({ error: "סוג בדיקה לא תקין" }, { status: 400 });
  } catch (error: any) {
    console.error("❌ Email test error:", error);
    return NextResponse.json({ error: error.message || "שגיאת שרת" }, { status: 500 });
  }
}
