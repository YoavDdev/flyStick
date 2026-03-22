export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/app/libs/prismadb";

// POST - Check if a gift can be sent to recipient (before PayPal payment)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any) as any;
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { eligible: false, error: "נדרשת התחברות" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { seriesId, recipientEmail } = body;

    if (!seriesId || !recipientEmail) {
      return NextResponse.json(
        { eligible: false, error: "חסרים שדות חובה" },
        { status: 400 }
      );
    }

    // Normalize emails
    const senderEmail = session.user.email.toLowerCase().trim();
    const normalizedRecipientEmail = recipientEmail.toLowerCase().trim();

    // Block sending gift to yourself
    if (senderEmail === normalizedRecipientEmail) {
      return NextResponse.json({
        eligible: false,
        error: "לא ניתן לשלוח מתנה לעצמך. ניתן לרכוש את הסדרה ישירות."
      });
    }

    // Verify the series exists and is active
    const series = await prisma.videoSeries.findUnique({
      where: { id: seriesId }
    });

    if (!series || !series.isActive) {
      return NextResponse.json({
        eligible: false,
        error: "הסדרה לא נמצאה או לא זמינה"
      });
    }

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

    if (recipient) {
      // Recipient EXISTS - check if they already have this series
      if (recipient.purchases.length > 0) {
        return NextResponse.json({
          eligible: false,
          error: `למקבל המתנה כבר יש גישה לסדרה "${series.title}". אנא בחר/י סדרה אחרת.`
        });
      }

      // Check if recipient has an active subscription
      const hasActiveSubscription = !!(
        recipient.subscriptionId === "Admin" ||
        recipient.subscriptionId === "free" ||
        recipient.subscriptionId === "trial_30" ||
        (recipient.subscriptionId && recipient.subscriptionId.startsWith("I-") && recipient.paypalStatus === "ACTIVE")
      );

      if (hasActiveSubscription) {
        return NextResponse.json({
          eligible: false,
          error: "למקבל המתנה יש מנוי פעיל ויש לו גישה לכל הסדרות. אין צורך במתנה."
        });
      }
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
        return NextResponse.json({
          eligible: false,
          error: `כבר נשלחה מתנה עבור "${series.title}" לאימייל הזה. המתנה ממתינה למימוש.`
        });
      }
    }

    // All checks passed - eligible for gift
    return NextResponse.json({
      eligible: true,
      message: "ניתן לשלוח את המתנה"
    });

  } catch (error) {
    console.error("Error checking gift eligibility:", error);
    return NextResponse.json(
      { eligible: false, error: "שגיאה בבדיקת זכאות" },
      { status: 500 }
    );
  }
}
