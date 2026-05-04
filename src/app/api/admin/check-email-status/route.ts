import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/app/libs/prismadb";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Verify admin
    const user = await prisma.user.findUnique({
      where: { email: session?.user?.email || "" },
    });

    if (!user || user.subscriptionId !== "Admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check Resend API key
    const hasResendKey = !!process.env.RESEND_API_KEY;
    const resendKeyLength = process.env.RESEND_API_KEY?.length || 0;
    const resendKeyPrefix = process.env.RESEND_API_KEY?.substring(0, 5) || "N/A";

    // Check if Resend is working
    let resendStatus = "Unknown";
    let resendError = null;

    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      // Try to send a test email to admin
      const { data, error } = await resend.emails.send({
        from: 'Studio Boaz <info@mail.studioboazonline.com>',
        to: [session?.user?.email || 'yoavddev@gmail.com'],
        subject: '🧪 בדיקת מערכת מיילים - Test Email System',
        html: `
          <div style="font-family: Arial, sans-serif; direction: rtl; padding: 20px;">
            <h2>✅ מערכת המיילים עובדת!</h2>
            <p>זהו מייל בדיקה אוטומטי מהמערכת.</p>
            <p><strong>זמן:</strong> ${new Date().toLocaleString('he-IL')}</p>
            <p><strong>API Key:</strong> ${resendKeyPrefix}...</p>
          </div>
        `,
      });

      if (error) {
        resendStatus = "Failed";
        resendError = error;
      } else {
        resendStatus = "Working";
      }
    } catch (err: any) {
      resendStatus = "Error";
      resendError = err.message;
    }

    return NextResponse.json({
      success: true,
      emailSystem: {
        hasResendKey,
        resendKeyLength,
        resendKeyPrefix,
        resendStatus,
        resendError,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        nextAuthUrl: process.env.NEXTAUTH_URL,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error checking email status:", error);
    return NextResponse.json(
      { error: "Failed to check email status", details: error.message },
      { status: 500 }
    );
  }
}
