export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/app/libs/prismadb";
import { Resend } from 'resend';

// POST - Process gift series purchase after PayPal payment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any) as any;
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "נדרשת התחברות כדי לרכוש מתנה" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      seriesId,
      paypalOrderId,
      paypalPayerId,
      amount,
      currency = "ILS",
      recipientEmail,
      recipientName,
      giftMessage
    } = body;

    // Validate required fields
    if (!seriesId || !paypalOrderId || !amount || !recipientEmail) {
      return NextResponse.json(
        { error: "חסרים שדות חובה" },
        { status: 400 }
      );
    }

    // Normalize emails
    const senderEmail = session.user.email.toLowerCase().trim();
    const normalizedRecipientEmail = recipientEmail.toLowerCase().trim();

    // Block sending gift to yourself
    if (senderEmail === normalizedRecipientEmail) {
      return NextResponse.json(
        { error: "לא ניתן לשלוח מתנה לעצמו. ניתן לרכוש את הסדרה ישירות." },
        { status: 400 }
      );
    }

    // Verify the series exists and is active
    const series = await prisma.videoSeries.findUnique({
      where: { id: seriesId }
    });

    if (!series || !series.isActive) {
      return NextResponse.json(
        { error: "הסדרה לא נמצאה או לא זמינה" },
        { status: 404 }
      );
    }

    // Find the sender (buyer)
    const sender = await prisma.user.findUnique({
      where: { email: senderEmail }
    });

    if (!sender) {
      return NextResponse.json(
        { error: "משתמש לא נמצא" },
        { status: 404 }
      );
    }

    const senderName = sender.name || session.user.name || "משתמש";

    // Check if the recipient already has an account
    const recipient = await prisma.user.findUnique({
      where: { email: normalizedRecipientEmail },
      include: {
        purchases: {
          where: { seriesId, status: "COMPLETED" },
          select: { id: true }
        }
      }
    });

    let resultType: 'direct' | 'pending';

    if (recipient) {
      // Recipient EXISTS - check if they already have this series
      if (recipient.purchases.length > 0) {
        return NextResponse.json(
          { error: "למקבל המתנה כבר יש גישה לסדרה זו" },
          { status: 400 }
        );
      }

      // Check if recipient has an active subscription (already has access to everything)
      const hasActiveSubscription = !!(
        recipient.subscriptionId === "Admin" ||
        recipient.subscriptionId === "free" ||
        recipient.subscriptionId === "trial_30" ||
        (recipient.subscriptionId && recipient.subscriptionId.startsWith("I-") && recipient.paypalStatus === "ACTIVE")
      );

      if (hasActiveSubscription) {
        return NextResponse.json(
          { error: "למקבל המתנה יש מנוי פעיל ויש לו גישה לכל הסדרות" },
          { status: 400 }
        );
      }

      // Create Purchase directly for the recipient
      await prisma.purchase.create({
        data: {
          userId: recipient.id,
          seriesId,
          paypalOrderId,
          paypalPayerId,
          amount: parseFloat(amount.toString()),
          currency,
          status: "COMPLETED",
          isGift: true,
          giftSenderEmail: senderEmail,
          giftSenderName: senderName,
          giftRecipientName: recipientName || recipient.name || null,
          giftMessage: giftMessage || null,
          giftClaimedAt: new Date() // Claimed immediately since user exists
        }
      });

      resultType = 'direct';
    } else {
      // Recipient DOES NOT EXIST - check for existing pending gift
      const existingPendingGift = await prisma.pendingGift.findFirst({
        where: {
          recipientEmail: normalizedRecipientEmail,
          seriesId,
          status: "PENDING"
        }
      });

      if (existingPendingGift) {
        return NextResponse.json(
          { error: "כבר נשלחה מתנה לסדרה זו לאימייל הזה. המתנה ממתינה למימוש." },
          { status: 400 }
        );
      }

      // Create PendingGift
      await prisma.pendingGift.create({
        data: {
          seriesId,
          recipientEmail: normalizedRecipientEmail,
          recipientName: recipientName || null,
          senderEmail,
          senderName,
          giftMessage: giftMessage || null,
          paypalOrderId,
          paypalPayerId,
          amount: parseFloat(amount.toString()),
          currency,
          status: "PENDING"
        }
      });

      resultType = 'pending';
    }

    // --- Send Emails ---
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const baseUrl = process.env.NEXTAUTH_URL || 'https://studioboazonline.com';

      // 1. Email to RECIPIENT
      const recipientSubject = `🎁 קיבלת מתנה מ-${senderName}! - ${series.title}`;
      const recipientHtml = buildRecipientEmail({
        senderName,
        recipientName: recipientName || "",
        seriesTitle: series.title,
        giftMessage: giftMessage || "",
        isRegistered: resultType === 'direct',
        baseUrl
      });

      await resend.emails.send({
        from: 'Studio Boaz <info@mail.studioboazonline.com>',
        to: [normalizedRecipientEmail],
        subject: recipientSubject,
        html: recipientHtml
      });

      // 2. Email to SENDER (confirmation)
      const senderSubject = `✅ המתנה נשלחה בהצלחה! - ${series.title}`;
      const senderHtml = buildSenderConfirmationEmail({
        senderName,
        recipientEmail: normalizedRecipientEmail,
        recipientName: recipientName || normalizedRecipientEmail,
        seriesTitle: series.title,
        amount: parseFloat(amount.toString()),
        isRegistered: resultType === 'direct'
      });

      await resend.emails.send({
        from: 'Studio Boaz <info@mail.studioboazonline.com>',
        to: [senderEmail],
        subject: senderSubject,
        html: senderHtml
      });

      // 3. Email to ADMIN
      const adminEmails = ['yoavddev@gmail.com', 'zzaaoobb@gmail.com'];
      const adminSubject = `🎁 רכישת מתנה חדשה - ${series.title}`;
      const adminHtml = buildAdminNotificationEmail({
        senderName,
        senderEmail,
        recipientEmail: normalizedRecipientEmail,
        recipientName: recipientName || "",
        seriesTitle: series.title,
        amount: parseFloat(amount.toString()),
        paypalOrderId,
        resultType,
        giftMessage: giftMessage || ""
      });

      for (const adminEmail of adminEmails) {
        await resend.emails.send({
          from: 'Studio Boaz <info@mail.studioboazonline.com>',
          to: [adminEmail],
          subject: adminSubject,
          html: adminHtml
        });
      }
    } catch (emailError) {
      console.error('Error sending gift emails:', emailError);
      // Don't fail the purchase if emails fail
    }

    return NextResponse.json({
      message: resultType === 'direct' 
        ? "המתנה נשלחה בהצלחה! למקבל/ת יש כבר גישה לסדרה."
        : "המתנה נשלחה בהצלחה! המקבל/ת יקבל/תקבל אימייל עם הוראות.",
      resultType,
      recipientEmail: normalizedRecipientEmail,
      seriesTitle: series.title
    });

  } catch (error) {
    console.error("Error processing gift purchase:", error);
    return NextResponse.json(
      { error: "שגיאה בעיבוד רכישת המתנה" },
      { status: 500 }
    );
  }
}

// --- Email Templates ---

function buildRecipientEmail({ senderName, recipientName, seriesTitle, giftMessage, isRegistered, baseUrl }: {
  senderName: string; recipientName: string; seriesTitle: string; giftMessage: string; isRegistered: boolean; baseUrl: string;
}) {
  const greeting = recipientName ? `היי ${recipientName},` : 'שלום,';
  const actionButton = isRegistered
    ? `<a href="${baseUrl}/series" style="display: inline-block; background: linear-gradient(135deg, #D5C4B7, #B8A99C); color: white; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 17px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">צפייה בקורס עכשיו</a>`
    : `<a href="${baseUrl}/series/register" style="display: inline-block; background: linear-gradient(135deg, #D5C4B7, #B8A99C); color: white; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 17px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">להרשמה וצפייה בקורס</a>`;
  const accessNote = isRegistered
    ? 'הקורס מחכה באתר בתפריט "קורסים".'
    : 'לצפייה בקורס, יש להירשם באתר וליצור חשבון ללא עלות. הקורס מחכה באתר בתפריט "קורסים".';

  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F7F3EB; margin: 0; padding: 20px; direction: rtl;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
        
        <!-- Header with Logo and Website -->
        <div style="background: white; padding: 25px 20px; text-align: center; border-bottom: 3px solid #D5C4B7;">
          <div style="margin-bottom: 15px;">
            <img src="https://studioboazonline.com/apple-touch-icon.png" alt="Studio Boaz Online" style="height: 80px; width: auto; display: inline-block;" />
          </div>
          <div style="margin-top: 12px;">
            <a href="https://studioboazonline.com" style="color: #2D3142; text-decoration: none; font-size: 16px; font-weight: 600; display: block; margin-bottom: 6px;">www.studioboazonline.com</a>
            <p style="color: #B8A99C; font-size: 14px; margin: 0; font-weight: 500;">שיעורים, הרצאות וארועים</p>
          </div>
        </div>
        
        <div style="background: linear-gradient(135deg, #D5C4B7 0%, #B8A99C 100%); padding: 40px; text-align: center;">
          <div style="margin-bottom: 15px;">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block;">
              <path d="M20 12V21C20 21.2652 19.8946 21.5196 19.7071 21.7071C19.5196 21.8946 19.2652 22 19 22H5C4.73478 22 4.48043 21.8946 4.29289 21.7071C4.10536 21.5196 4 21.2652 4 21V12" fill="white"/>
              <path d="M22 7H2V12H22V7Z" fill="white"/>
              <rect x="11" y="7" width="2" height="15" fill="rgba(181, 168, 156, 0.5)"/>
              <path d="M12 7C12 7 10.5 2 7 2C5.89543 2 5 2.89543 5 4C5 5.10457 5.89543 6 7 6C8.5 6 10 6.5 12 7Z" fill="white"/>
              <path d="M12 7C12 7 13.5 2 17 2C18.1046 2 19 2.89543 19 4C19 5.10457 18.1046 6 17 6C15.5 6 14 6.5 12 7Z" fill="white"/>
            </svg>
          </div>
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.2); line-height: 1.4;">קיבלת מתנה מרגשת!</h1>
        </div>
        
        <div style="padding: 35px;">
          <p style="color: #2D3142; font-size: 18px; line-height: 1.6; margin-bottom: 10px;">${greeting}</p>
          
          <p style="color: #2D3142; font-size: 19px; font-weight: bold; line-height: 1.5; margin: 15px 0;">איזה כיף, כמה אוהבים אותך!<br/>קיבלת מתנה מרגשת במיוחד.</p>
          
          <p style="color: #2D3142; font-size: 16px; line-height: 1.8; margin: 20px 0;">
            <strong style="color: #B8A99C;">${senderName}</strong> רכש/ה במתנה קורס בנושא <strong>"${seriesTitle}"</strong> מהסטודיו המקיף, העמוק והמתקדם ביותר לתנועה גופנית ומנטלית של בועז נחייסי.
          </p>
          
          <p style="color: #5D5D5D; font-size: 15px; line-height: 1.7; margin: 20px 0;">
            זהו קורס אונליין המגלם בתוכו תובנות מעשיות לשיפור תפקודי, הבראה והבנה טובה יותר של הפלא בו אנו חיים.
          </p>
          
          ${giftMessage ? `
            <div style="background: linear-gradient(to left, #FFF3E0, #FFE8CC); border-right: 4px solid #D5C4B7; padding: 18px 22px; border-radius: 10px; margin: 25px 0;">
              <p style="color: #B8A99C; font-size: 14px; margin: 0 0 8px 0; font-weight: bold;">💌 הודעה אישית מ-${senderName}:</p>
              <p style="color: #2D3142; font-size: 16px; line-height: 1.7; margin: 0; font-style: italic;">"${giftMessage}"</p>
            </div>
          ` : ''}
          
          <div style="background: #F7F3EB; border: 2px solid #D5C4B7; border-radius: 12px; padding: 20px; margin: 25px 0;">
            <p style="color: #2D3142; font-size: 16px; line-height: 1.8; margin: 0;">
              ${accessNote}
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">${actionButton}</div>
        </div>
        
        <div style="background: #2D3142; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0; font-size: 14px; opacity: 0.8;">Studio Boaz Online - בועז נחייסי</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function buildSenderConfirmationEmail({ senderName, recipientEmail, recipientName, seriesTitle, amount, isRegistered }: {
  senderName: string; recipientEmail: string; recipientName: string; seriesTitle: string; amount: number; isRegistered: boolean;
}) {
  const statusMessage = isRegistered
    ? `ל-${recipientName} כבר יש חשבון, כך שהגישה לסדרה ניתנה מיד!`
    : `שלחנו אימייל ל-${recipientEmail} עם הוראות. ברגע שיירשם/תירשם, הסדרה תהיה זמינה אוטומטית.`;

  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F7F3EB; margin: 0; padding: 20px; direction: rtl;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
        
        <div style="background: linear-gradient(135deg, #4CAF50, #66BB6A); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">✅ המתנה נשלחה בהצלחה!</h1>
        </div>
        
        <div style="padding: 30px;">
          <p style="color: #2D3142; font-size: 16px; line-height: 1.8;">${senderName} יקר/ה,</p>
          <p style="color: #2D3142; font-size: 16px; line-height: 1.8;">
            המתנה נשלחה בהצלחה!
          </p>
          
          <div style="background: #F7F3EB; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>סדרה:</strong> ${seriesTitle}</p>
            <p style="margin: 5px 0;"><strong>נשלחה ל:</strong> ${recipientName} (${recipientEmail})</p>
            <p style="margin: 5px 0;"><strong>סכום:</strong> ₪${amount}</p>
          </div>
          
          <p style="color: #5D5D5D; font-size: 15px;">${statusMessage}</p>
          <p style="color: #5D5D5D; font-size: 15px;">תודה על המחשבה היפה! 🌟</p>
        </div>
        
        <div style="background: #2D3142; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0; font-size: 14px; opacity: 0.8;">Studio Boaz Online</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function buildAdminNotificationEmail({ senderName, senderEmail, recipientEmail, recipientName, seriesTitle, amount, paypalOrderId, resultType, giftMessage }: {
  senderName: string; senderEmail: string; recipientEmail: string; recipientName: string; seriesTitle: string; amount: number; paypalOrderId: string; resultType: string; giftMessage: string;
}) {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F7F3EB; margin: 0; padding: 20px; direction: rtl;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
        
        <div style="background: linear-gradient(135deg, #D5C4B7, #B8A99C); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🎁 רכישת מתנה חדשה!</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Studio Boaz Online</p>
        </div>
        
        <div style="padding: 30px;">
          <div style="background: #E8F5E8; border: 2px solid #4CAF50; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #2E7D32; margin: 0 0 10px 0;">פרטי הרכישה</h3>
            <p><strong>סדרה:</strong> ${seriesTitle}</p>
            <p><strong>סכום:</strong> ₪${amount}</p>
            <p><strong>PayPal:</strong> ${paypalOrderId}</p>
            <p><strong>סטטוס:</strong> ${resultType === 'direct' ? '✅ גישה ניתנה ישירות' : '⏳ ממתינה להרשמת המקבל'}</p>
          </div>
          
          <div style="background: #F5F5F5; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #2D3142; margin: 0 0 10px 0;">👤 שולח</h3>
            <p><strong>שם:</strong> ${senderName}</p>
            <p><strong>אימייל:</strong> ${senderEmail}</p>
          </div>
          
          <div style="background: #F5F5F5; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #2D3142; margin: 0 0 10px 0;">🎁 מקבל</h3>
            <p><strong>שם:</strong> ${recipientName || 'לא צוין'}</p>
            <p><strong>אימייל:</strong> ${recipientEmail}</p>
          </div>
          
          ${giftMessage ? `
            <div style="background: #FFF3E0; border-radius: 8px; padding: 20px;">
              <h3 style="color: #E65100; margin: 0 0 10px 0;">💌 הודעה אישית</h3>
              <p style="font-style: italic;">"${giftMessage}"</p>
            </div>
          ` : ''}
        </div>
        
        <div style="background: #2D3142; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0; font-size: 14px; opacity: 0.8;">Studio Boaz Online - מערכת ניהול אוטומטית</p>
          <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.6;">${new Date().toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
