export const dynamic = 'force-dynamic';
import bcrypt from "bcrypt";
import prisma from "../../libs/prismadb";
import { NextResponse } from "next/server";

export async function POST(request) {
  const body = await request.json();
  const { name, email, password, subscribeToNewsletter, userType, registrationSource, turnstileToken } = body;

  if (!name || !email || !password) {
    return new NextResponse("Missing Fields", { status: 400 });
  }

  // Normalize email to lowercase to prevent duplicate accounts
  const normalizedEmail = email.toLowerCase().trim();

  // Verify Turnstile token
  if (!turnstileToken) {
    return new NextResponse(JSON.stringify({ error: "Security verification required" }), { 
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const turnstileResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: turnstileToken,
      }),
    });

    const turnstileData = await turnstileResponse.json();

    if (!turnstileData.success) {
      console.error('❌ Turnstile verification failed:', turnstileData);
      return new NextResponse(JSON.stringify({ error: "Security verification failed. Please try again." }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (turnstileError) {
    console.error('❌ Error verifying Turnstile:', turnstileError);
    return new NextResponse(JSON.stringify({ error: "Security verification error. Please try again." }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  // Check for existing user with case-insensitive email comparison
  const exist = await prisma.user.findFirst({
    where: {
      email: {
        equals: normalizedEmail,
        mode: 'insensitive'
      }
    },
  });

  if (exist) {
    return new NextResponse(JSON.stringify({ error: "Email already exists" }), { 
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email: normalizedEmail,
      hashedPassword,
      userType: userType || "subscription",
      registrationSource: registrationSource || "main_app",
    },
  });

  // � Check for pending gifts and claim them automatically
  try {
    const pendingGifts = await prisma.pendingGift.findMany({
      where: {
        recipientEmail: normalizedEmail,
        status: "PENDING"
      },
      include: { series: true }
    });

    for (const gift of pendingGifts) {
      try {
        // Create a real purchase for the new user
        await prisma.purchase.create({
          data: {
            userId: user.id,
            seriesId: gift.seriesId,
            paypalOrderId: gift.paypalOrderId,
            paypalPayerId: gift.paypalPayerId,
            amount: gift.amount,
            currency: gift.currency,
            status: "COMPLETED",
            isGift: true,
            giftSenderEmail: gift.senderEmail,
            giftSenderName: gift.senderName,
            giftRecipientName: gift.recipientName || name,
            giftMessage: gift.giftMessage,
            giftClaimedAt: new Date()
          }
        });

        // Mark the pending gift as claimed
        await prisma.pendingGift.update({
          where: { id: gift.id },
          data: {
            status: "CLAIMED",
            claimedAt: new Date(),
            claimedByUserId: user.id
          }
        });

        console.log(`🎁 Pending gift claimed: ${gift.series.title} for ${normalizedEmail}`);
      } catch (giftClaimError) {
        console.error(`❌ Error claiming gift ${gift.id}:`, giftClaimError);
      }
    }

    if (pendingGifts.length > 0) {
      console.log(`🎁 ${pendingGifts.length} gift(s) claimed for new user: ${normalizedEmail}`);
    }
  } catch (giftError) {
    console.error("❌ Error checking pending gifts:", giftError);
    // Don't fail registration if gift claiming fails
  }

  // �🎉 ALWAYS send welcome email to ALL new users
  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: 'Studio Boaz Online <info@mail.studioboazonline.com>',
      to: [normalizedEmail],
      subject: 'ברוך הבא לסטודיו',
      html: `
        <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; max-width: 500px; margin: 0 auto; background: #F7F3EB; padding: 20px; border-radius: 12px;">
          <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #2D3142; margin-top: 0; font-size: 20px;">שלום ${name}</h2>
            
            <p style="color: #3D3D3D; line-height: 1.7; font-size: 16px; margin-bottom: 20px;">
              תודה שנרשמת לסטודיו שלי. גם ההתרגשות נרשמת, בשבילך!
            </p>
            
            <p style="color: #3D3D3D; line-height: 1.7; font-size: 16px; margin-bottom: 20px;">
              אמנם יצרתם חשבון ראשוני (וודאו שגם נרשמתם לניוזלטר) והוא ישמר באתר אך כדי להגיע לתכנים העשירים ולהכשרות הרבות, עלייך להרשם כמנוי שיפתח לך את שלל האוצרות והידע שמחכה לך בסטודיו וללא הגבלה.
            </p>
            
            <p style="color: #3D3D3D; line-height: 1.7; font-size: 16px; margin-bottom: 20px;">
              אני מאמיןן שדרך תנועה אנו גוברים על אתגרי החיים ואם נלמד לטפח את הזרימה בגוף, נשוט ביתר קלות בנהר חיינו.
            </p>
            
            <p style="color: #3D3D3D; line-height: 1.7; font-size: 16px; margin-bottom: 25px;">
              חיבוק גדול ומסע משובח, בועז.
            </p>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login" 
                 style="background: #D5C4B7; color: #2D3142; padding: 12px 20px; text-decoration: none; border-radius: 8px; font-weight: medium; display: inline-block;">
                היכנס לחשבון שלך
              </a>
            </div>
            
            <p style="color: #B8A99C; font-size: 14px; text-align: center; margin-top: 25px;">
              בחיבוק גדול,<br>
              <strong style="color: #D9713C;">בועז.</strong>
            </p>
          </div>
        </div>
      `
    });

    console.log("🎉 Welcome email sent successfully to:", normalizedEmail);
  } catch (welcomeError) {
    console.error("❌ Error sending welcome email:", welcomeError);
    // Don't fail registration if welcome email fails
  }

  // Newsletter Subscription Logic (separate from welcome email)
  if (subscribeToNewsletter) {
    try {
      const newsletterResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          email: normalizedEmail,
          name,
          source: 'registration'
        })
      });

      if (newsletterResponse.ok) {
        console.log("✅ User subscribed to newsletter");
      } else {
        const errorData = await newsletterResponse.json();
        console.error("❌ Newsletter subscription error:", errorData.error);
      }
    } catch (newsletterError) {
      console.error("❌ Error subscribing user to newsletter:", newsletterError);
    }
  }

  await prisma.folder.create({
    data: {
      userId: user.id,
      name: "favorites",
      urls: [],
    },
  });

  return NextResponse.json({ success: true, user });
}
