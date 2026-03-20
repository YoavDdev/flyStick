export const dynamic = 'force-dynamic';
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import axios from "axios";

const prisma = new PrismaClient();

// Helper: Cancel an old PayPal subscription via API
async function cancelOldPayPalSubscription(oldSubscriptionId) {
  try {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error("⚠️ PayPal credentials missing, cannot cancel old subscription");
      return;
    }

    const auth = { username: clientId, password: clientSecret };

    // First check if the old subscription is still active
    const statusResponse = await axios.get(
      `https://api.paypal.com/v1/billing/subscriptions/${oldSubscriptionId}`,
      { auth, timeout: 10000 }
    );

    const currentStatus = statusResponse.data.status;
    if (currentStatus !== "ACTIVE" && currentStatus !== "APPROVED") {
      console.log(`ℹ️ Old subscription ${oldSubscriptionId} is already ${currentStatus}, no need to cancel`);
      return;
    }

    // Cancel the old subscription on PayPal
    await axios.post(
      `https://api.paypal.com/v1/billing/subscriptions/${oldSubscriptionId}/cancel`,
      { reason: "User created a new subscription - cancelling duplicate" },
      { auth, timeout: 10000 }
    );

    console.log(`✅ Successfully cancelled old PayPal subscription: ${oldSubscriptionId}`);
  } catch (error) {
    console.error(`⚠️ Failed to cancel old PayPal subscription ${oldSubscriptionId}:`, error.message);
    // Don't throw - we still want to save the new subscription
  }
}

export async function POST(request) {
  const body = await request.json();
  const { orderId: orderId, email } = body;

  try {
    // 🔍 Check if user already has an active PayPal subscription
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
      select: { subscriptionId: true, name: true },
    });

    if (existingUser?.subscriptionId?.startsWith("I-") && existingUser.subscriptionId !== orderId) {
      console.log(`⚠️ User ${email} already has subscription ${existingUser.subscriptionId}, new: ${orderId}. Cancelling old one.`);
      await cancelOldPayPalSubscription(existingUser.subscriptionId);
    }

    const user = await prisma.user.update({
      where: {
        email: email,
      },
      data: {
        subscriptionId: {
          set: orderId,
        },
      },
    });
    console.log(user);

    // 🎉 Send subscription confirmation email
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: 'Studio Boaz Online <info@mail.studioboazonline.com>',
        to: [email],
        subject: 'זהו. יש לך מנוי והכל פתוח לפניך!',
        html: `
          <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; max-width: 600px; margin: 0 auto; background: #F7F3EB; padding: 20px; border-radius: 12px;">
            <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #2D3142; margin-top: 0; font-size: 22px; text-align: center;">זהו. יש לך מנוי והכל פתוח לפניך!</h2>
              
              <p style="color: #3D3D3D; line-height: 1.8; font-size: 16px; margin-bottom: 20px;">
                מחכים לכם שיעורים בכל הרמות, הרצאות תוכן, סדנאות והשתלמויות ומלא שמחה בלב.
              </p>
              
              <p style="color: #3D3D3D; line-height: 1.8; font-size: 16px; margin-bottom: 20px;">
                אני יודע כי הגוף שלכם יודה לכם על הבחירה וההחלטה להצטרף לקהילת מנויי הסטודיו.
              </p>
              
              <p style="color: #3D3D3D; line-height: 1.8; font-size: 16px; margin-bottom: 20px;">
                אני גאה בכם שבחרתם בדרך שלי ואין לי ספק שתרגישו בפנים עמוק מחיאות כפיים על התובנות שתרכשו וילכו איתכם לאורך החיים. כי זה כל מה שמעניין אותי, בועז, הקיום של עצמנו.
              </p>
              
              <p style="color: #3D3D3D; line-height: 1.8; font-size: 16px; margin-bottom: 20px;">
                אז בלי יותר מדי מילים, כנסו למדריך השימוש באתר שנמצא בשדה התחתון של כל דף ואם יש לכם שאלות, יצרתי עבורכם דרכים שונות.
              </p>
              
              <p style="color: #3D3D3D; line-height: 1.8; font-size: 16px; margin-bottom: 25px;">
                צאו לדרך, מסע מרהיב וקסום.
              </p>
              
              <div style="text-align: center; margin: 25px 0;">
                <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard" 
                   style="background: #D5C4B7; color: #2D3142; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                  היכנס לסטודיו שלך
                </a>
              </div>
              
              <p style="color: #B8A99C; font-size: 16px; text-align: center; margin-top: 30px;">
                תודה רבה,<br>
                <strong style="color: #D9713C;">בועז.</strong>
              </p>
            </div>
          </div>
        `
      });

      console.log("🎉 Subscription confirmation email sent successfully to:", email);
    } catch (emailError) {
      console.error("❌ Error sending subscription confirmation email:", emailError);
      // Don't fail the subscription if email fails, just log the error
    }

    // 📧 Send admin notification email
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: 'Studio Boaz Online <info@mail.studioboazonline.com>',
        to: ['yoavddev@gmail.com', 'zzaaoobb@gmail.com'],
        subject: `🎉 מנוי חדש נרשם - ${user.name || 'משתמש חדש'}`,
        html: `
          <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; max-width: 600px; margin: 0 auto; background: #F7F3EB; padding: 20px; border-radius: 12px;">
            <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #2D3142; margin-top: 0; font-size: 22px; text-align: center;">🎉 מנוי חדש נרשם לסטודיו!</h2>
              
              <div style="background: #F7F3EB; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #D9713C; margin-top: 0; font-size: 18px;">פרטי המנוי החדש:</h3>
                
                <p style="color: #3D3D3D; line-height: 1.6; font-size: 16px; margin: 10px 0;">
                  <strong>שם:</strong> ${user.name || 'לא צוין'}
                </p>
                
                <p style="color: #3D3D3D; line-height: 1.6; font-size: 16px; margin: 10px 0;">
                  <strong>אימייל:</strong> ${email}
                </p>
                
                <p style="color: #3D3D3D; line-height: 1.6; font-size: 16px; margin: 10px 0;">
                  <strong>מזהה מנוי:</strong> ${orderId}
                </p>
                
                <p style="color: #3D3D3D; line-height: 1.6; font-size: 16px; margin: 10px 0;">
                  <strong>תאריך הרשמה:</strong> ${new Date().toLocaleDateString('he-IL', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              
              <p style="color: #3D3D3D; line-height: 1.8; font-size: 16px; margin-bottom: 20px;">
                המשתמש קיבל אימייל אישור והוא יכול כעת לגשת לכל התכנים בסטודיו.
              </p>
              
              <div style="text-align: center; margin: 25px 0;">
                <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin" 
                   style="background: #D5C4B7; color: #2D3142; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                  כניסה לפאנל ניהול
                </a>
              </div>
              
              <p style="color: #B8A99C; font-size: 14px; text-align: center; margin-top: 30px;">
                הודעה אוטומטית ממערכת Studio Boaz Online
              </p>
            </div>
          </div>
        `
      });

      console.log("📧 Admin notification email sent successfully for new subscription:", email);
    } catch (adminEmailError) {
      console.error("❌ Error sending admin notification email:", adminEmailError);
      // Don't fail the subscription if admin email fails, just log the error
    }
    return new NextResponse({
      status: 200,
      body: {
        success: true,
        message: "Order ID saved successfully!",
        user: user,
      },
    });
  } catch (error) {
    console.error("Error canceling subscription:", error);
    console.error(error.stack); // Log the stack trace for detailed information
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
