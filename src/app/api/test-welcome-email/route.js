export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, name } = body;

    console.log("🧪 Testing welcome email for:", email, name);
    console.log("🔑 RESEND_API_KEY exists:", !!process.env.RESEND_API_KEY);
    console.log("🔑 RESEND_API_KEY length:", process.env.RESEND_API_KEY?.length || 0);

    // Test Resend import
    const { Resend } = await import('resend');
    console.log("✅ Resend imported successfully");

    const resend = new Resend(process.env.RESEND_API_KEY);
    console.log("✅ Resend instance created");

    const result = await resend.emails.send({
      from: 'Studio Boaz Online <info@mail.studioboazonline.com>',
      to: [email],
      subject: '🧪 Test Welcome Email - סטודיו בועז אונליין',
      html: `
        <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; max-width: 600px; margin: 0 auto; background: #F7F3EB; padding: 20px; border-radius: 12px;">
          <div style="background: #D5C4B7; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
            <h1 style="color: #2D3142; margin: 0; font-size: 24px;">🧪 Test Email</h1>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #2D3142; margin-top: 0;">שלום ${name || 'משתמש'}! 👋</h2>
            
            <p style="color: #3D3D3D; line-height: 1.6; font-size: 16px;">
              זהו אימייל בדיקה לוודא שמערכת האימיילים עובדת כמו שצריך.
            </p>
            
            <p style="color: #B8A99C; font-size: 14px; text-align: center; margin-top: 30px;">
              צוות סטודיו בועז אונליין
            </p>
          </div>
        </div>
      `
    });

    console.log("✅ Email sent successfully:", result);

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      emailId: result.data?.id,
      result: result
    });

  } catch (error) {
    console.error("❌ Test email error:", error);
    console.error("❌ Error details:", {
      message: error.message,
      name: error.name,
      stack: error.stack
    });

    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.toString()
    }, { status: 500 });
  }
}
