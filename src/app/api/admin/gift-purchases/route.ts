export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/app/libs/prismadb";
import { Resend } from 'resend';

// GET - Get all gift purchases (both pending and completed)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any) as any;
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "נדרשת התחברות" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email.toLowerCase().trim() }
    });

    if (user?.subscriptionId !== "Admin") {
      return NextResponse.json(
        { error: "אין הרשאת גישה" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    // Get pending gifts
    const pendingGiftsQuery = search
      ? {
          where: {
            OR: [
              { recipientEmail: { contains: search, mode: 'insensitive' as const } },
              { recipientName: { contains: search, mode: 'insensitive' as const } },
              { senderEmail: { contains: search, mode: 'insensitive' as const } },
              { senderName: { contains: search, mode: 'insensitive' as const } }
            ]
          },
          include: {
            series: {
              select: { title: true }
            }
          },
          orderBy: { createdAt: 'desc' as const }
        }
      : {
          include: {
            series: {
              select: { title: true }
            }
          },
          orderBy: { createdAt: 'desc' as const }
        };

    const pendingGifts = await prisma.pendingGift.findMany(pendingGiftsQuery as any);

    // Get completed gift purchases
    const completedGiftsQuery = search
      ? {
          where: {
            isGift: true,
            OR: [
              { giftSenderEmail: { contains: search, mode: 'insensitive' as const } },
              { giftSenderName: { contains: search, mode: 'insensitive' as const } },
              { giftRecipientName: { contains: search, mode: 'insensitive' as const } }
            ]
          },
          include: {
            series: {
              select: { title: true }
            },
            user: {
              select: { email: true, name: true }
            }
          },
          orderBy: { createdAt: 'desc' as const }
        }
      : {
          where: { isGift: true },
          include: {
            series: {
              select: { title: true }
            },
            user: {
              select: { email: true, name: true }
            }
          },
          orderBy: { createdAt: 'desc' as const }
        };

    const completedGifts = await prisma.purchase.findMany(completedGiftsQuery as any);

    return NextResponse.json({
      pendingGifts,
      completedGifts
    });

  } catch (error) {
    console.error("Error fetching gift purchases:", error);
    return NextResponse.json(
      { error: "שגיאה בטעינת נתונים" },
      { status: 500 }
    );
  }
}

// POST - Resend gift email
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any) as any;
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "נדרשת התחברות" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email.toLowerCase().trim() }
    });

    if (user?.subscriptionId !== "Admin") {
      return NextResponse.json(
        { error: "אין הרשאת גישה" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { giftId, type } = body; // type: 'pending' or 'completed'

    if (!giftId || !type) {
      return NextResponse.json(
        { error: "חסרים פרטים" },
        { status: 400 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const baseUrl = process.env.NEXTAUTH_URL || 'https://studioboazonline.com';

    if (type === 'pending') {
      // Resend for pending gift
      const pendingGift = await prisma.pendingGift.findUnique({
        where: { id: giftId },
        include: { series: true }
      });

      if (!pendingGift) {
        return NextResponse.json(
          { error: "מתנה לא נמצאה" },
          { status: 404 }
        );
      }

      const recipientSubject = `🎁 קיבלת מתנה מ-${pendingGift.senderName}! - ${pendingGift.series.title}`;
      const recipientHtml = buildRecipientEmail({
        senderName: pendingGift.senderName,
        recipientName: pendingGift.recipientName || "",
        seriesTitle: pendingGift.series.title,
        giftMessage: pendingGift.giftMessage || "",
        isRegistered: false,
        baseUrl
      });

      await resend.emails.send({
        from: 'Studio Boaz <info@mail.studioboazonline.com>',
        to: [pendingGift.recipientEmail],
        subject: recipientSubject,
        html: recipientHtml
      });

      return NextResponse.json({ message: "המייל נשלח מחדש בהצלחה" });

    } else if (type === 'completed') {
      // Resend for completed gift
      const purchase = await prisma.purchase.findUnique({
        where: { id: giftId },
        include: { 
          series: true,
          user: true
        }
      });

      if (!purchase || !purchase.isGift) {
        return NextResponse.json(
          { error: "רכישה לא נמצאה" },
          { status: 404 }
        );
      }

      const recipientSubject = `🎁 קיבלת מתנה מ-${purchase.giftSenderName}! - ${purchase.series.title}`;
      const recipientHtml = buildRecipientEmail({
        senderName: purchase.giftSenderName || "חבר/ה",
        recipientName: purchase.giftRecipientName || "",
        seriesTitle: purchase.series.title,
        giftMessage: purchase.giftMessage || "",
        isRegistered: true,
        baseUrl
      });

      await resend.emails.send({
        from: 'Studio Boaz <info@mail.studioboazonline.com>',
        to: [purchase.user.email],
        subject: recipientSubject,
        html: recipientHtml
      });

      return NextResponse.json({ message: "המייל נשלח מחדש בהצלחה" });
    }

    return NextResponse.json(
      { error: "סוג לא תקין" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Error resending gift email:", error);
    return NextResponse.json(
      { error: "שגיאה בשליחת המייל" },
      { status: 500 }
    );
  }
}

// Email template function (copied from gift-purchase/route.ts)
function buildRecipientEmail({ senderName, recipientName, seriesTitle, giftMessage, isRegistered, baseUrl }: {
  senderName: string; recipientName: string; seriesTitle: string; giftMessage: string; isRegistered: boolean; baseUrl: string;
}) {
  const greeting = recipientName ? `היי ${recipientName},` : 'שלום,';
  const actionButton = isRegistered
    ? `<a href="${baseUrl}/series" style="display: inline-block; background: linear-gradient(135deg, #D5C4B7, #B8A99C); color: white; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 17px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">צפייה בקורס עכשיו</a>`
    : `<a href="${baseUrl}/series/register" style="display: inline-block; background: linear-gradient(135deg, #D5C4B7, #B8A99C); color: white; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 17px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">להרשמה וצפייה בקורס</a>`;
  const accessNote = isRegistered
    ? 'הקורס כבר מחכה באתר בתפריט "קורסים".'
    : 'כדי לצפות בקורס, יש תחילה להירשם באתר וליצור חשבון ללא עלות. הקורס מחכה באתר בתפריט "קורסים".';

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
