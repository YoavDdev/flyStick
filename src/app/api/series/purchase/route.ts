import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/app/libs/prismadb";

// POST - Process series purchase after PayPal payment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any) as any;
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      seriesId,
      paypalOrderId,
      paypalPayerId,
      amount,
      currency = "ILS"
    } = body;

    // Validate required fields
    if (!seriesId || !paypalOrderId || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user already has an active subscription (subscribers get free access)
    if (user.subscriptionId && user.subscriptionId !== "free" && user.subscriptionId !== "trial") {
      return NextResponse.json(
        { error: "Active subscribers have free access to all series" },
        { status: 400 }
      );
    }

    // Verify the series exists and is active
    const series = await prisma.videoSeries.findUnique({
      where: { id: seriesId }
    });

    if (!series || !series.isActive) {
      return NextResponse.json(
        { error: "Series not found or not available" },
        { status: 404 }
      );
    }

    // Check if user already purchased this series
    const existingPurchase = await prisma.purchase.findUnique({
      where: {
        userId_seriesId: {
          userId: user.id,
          seriesId: seriesId
        }
      }
    });

    if (existingPurchase) {
      return NextResponse.json(
        { error: "Series already purchased" },
        { status: 400 }
      );
    }

    // Create the purchase record
    const purchase = await prisma.purchase.create({
      data: {
        userId: user.id,
        seriesId: seriesId,
        paypalOrderId,
        paypalPayerId,
        amount: parseFloat(amount),
        currency,
        status: "COMPLETED"
      },
      include: {
        series: true,
        user: {
          select: {
            name: true,
            email: true,
            createdAt: true
          }
        }
      }
    });

    // Send admin notification email about the series purchase
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: 'Studio Boaz Online <info@studioboazonline.com>',
        to: ['yoavddev@gmail.com', 'zzaaoobb@gmail.com'],
        subject: `🎬 רכישת סדרה חדשה - ${purchase.series.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; max-width: 600px; margin: 0 auto; background: #F7F3EB; padding: 20px; border-radius: 12px;">
            <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #2D3142; margin-top: 0; font-size: 22px; text-align: center;">🎬 רכישת סדרה חדשה!</h2>
              
              <div style="background: #E8F5E8; border: 2px solid #4CAF50; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #2E7D32; margin-top: 0; font-size: 18px;">פרטי הרכישה:</h3>
                
                <p style="color: #1B5E20; line-height: 1.6; font-size: 16px; margin: 10px 0;">
                  <strong>סדרה:</strong> ${purchase.series.title}
                </p>
                
                <p style="color: #1B5E20; line-height: 1.6; font-size: 16px; margin: 10px 0;">
                  <strong>סכום:</strong> ₪${purchase.amount} ${purchase.currency}
                </p>
                
                <p style="color: #1B5E20; line-height: 1.6; font-size: 16px; margin: 10px 0;">
                  <strong>מזהה PayPal:</strong> ${purchase.paypalOrderId}
                </p>
                
                <p style="color: #1B5E20; line-height: 1.6; font-size: 16px; margin: 10px 0;">
                  <strong>תאריך רכישה:</strong> ${new Date(purchase.purchaseDate).toLocaleDateString('he-IL', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              
              <div style="background: #F7F3EB; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #D9713C; margin-top: 0; font-size: 18px;">👤 פרטי הלקוח:</h3>
                
                <p style="color: #3D3D3D; line-height: 1.6; font-size: 16px; margin: 10px 0;">
                  <strong>שם:</strong> ${purchase.user.name || 'לא צוין'}
                </p>
                
                <p style="color: #3D3D3D; line-height: 1.6; font-size: 16px; margin: 10px 0;">
                  <strong>אימייל:</strong> ${purchase.user.email}
                </p>
                
                <p style="color: #3D3D3D; line-height: 1.6; font-size: 16px; margin: 10px 0;">
                  <strong>תאריך הרשמה:</strong> ${new Date(purchase.user.createdAt).toLocaleDateString('he-IL', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              
              <p style="color: #3D3D3D; line-height: 1.8; font-size: 16px; margin-bottom: 20px;">
                הלקוח רכש את הסדרה בהצלחה ויכול כעת לגשת לכל הסרטונים בסדרה.
              </p>
              
              <div style="text-align: center; margin: 25px 0;">
                <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin" 
                   style="background: #D5C4B7; color: #2D3142; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin: 0 10px;">
                  🔧 פאנל ניהול
                </a>
                <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard" 
                   style="background: #B8A99C; color: #2D3142; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin: 0 10px;">
                  📊 דשבורד סטודיו
                </a>
              </div>
              
              <p style="color: #B8A99C; font-size: 14px; text-align: center; margin-top: 30px;">
                הודעה אוטומטית ממערכת Studio Boaz Online
              </p>
            </div>
          </div>
        `
      });

      console.log("🎬 Series purchase notification email sent successfully to admins");
    } catch (notificationError) {
      console.error('❌ Error sending series purchase notification:', notificationError);
      // Don't fail the purchase if email fails
    }

    return NextResponse.json({
      message: "Purchase completed successfully",
      purchase: {
        id: purchase.id,
        seriesTitle: purchase.series.title,
        amount: purchase.amount,
        currency: purchase.currency,
        purchaseDate: purchase.purchaseDate
      }
    });

  } catch (error) {
    console.error("Error processing purchase:", error);
    return NextResponse.json(
      { error: "Failed to process purchase" },
      { status: 500 }
    );
  }
}

// GET - Get user's purchases
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any) as any;
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const purchases = await prisma.purchase.findMany({
      where: { userId: user.id },
      include: {
        series: {
          select: {
            id: true,
            title: true,
            description: true,
            thumbnailUrl: true,
            videoCount: true,
            vimeoFolderId: true,
            vimeoFolderName: true
          }
        }
      },
      orderBy: { purchaseDate: 'desc' }
    });

    return NextResponse.json(purchases);

  } catch (error) {
    console.error("Error fetching purchases:", error);
    return NextResponse.json(
      { error: "Failed to fetch purchases" },
      { status: 500 }
    );
  }
}
