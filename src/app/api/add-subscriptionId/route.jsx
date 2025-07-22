import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request) {
  const body = await request.json();
  const { orderId: orderId, email } = body;

  try {
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
        from: 'Studio Boaz Online <info@studioboazonline.com>',
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
