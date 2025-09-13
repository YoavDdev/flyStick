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
      const adminEmails = ['yoavddev@gmail.com', 'zzaaoobb@gmail.com'];
      
      const emailSubject = `🎬 רכישת סדרה חדשה - ${purchase.series.title}`;
      const emailHtml = `
        <!DOCTYPE html>
        <html dir="rtl" lang="he">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>רכישת סדרה חדשה</title>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F7F3EB; margin: 0; padding: 20px; direction: rtl;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #D5C4B7 0%, #B8A99C 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                🎬 רכישת סדרה חדשה!
              </h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
                Studio Boaz Online
              </p>
            </div>
            
            <!-- Content -->
            <div style="padding: 30px;">
              <div style="background: #E8F5E8; border: 2px solid #4CAF50; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                <h2 style="color: #2E7D32; margin: 0 0 15px 0; font-size: 22px;">
                  פרטי הרכישה
                </h2>
                <div style="color: #1B5E20; font-size: 16px; line-height: 1.6;">
                  <p><strong>סדרה:</strong> ${purchase.series.title}</p>
                  <p><strong>סכום:</strong> ₪${purchase.amount} ${purchase.currency}</p>
                  <p><strong>מזהה PayPal:</strong> ${purchase.paypalOrderId}</p>
                  <p><strong>תאריך רכישה:</strong> ${new Date(purchase.purchaseDate).toLocaleDateString('he-IL', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>
              </div>
              
              <div style="background: #F5F5F5; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                <h3 style="color: #2D3142; margin: 0 0 15px 0; font-size: 18px;">
                  👤 פרטי הלקוח
                </h3>
                <div style="color: #5D5D5D; font-size: 15px; line-height: 1.6;">
                  <p><strong>שם:</strong> ${purchase.user.name || 'לא צוין'}</p>
                  <p><strong>אימייל:</strong> ${purchase.user.email}</p>
                  <p><strong>תאריך הרשמה:</strong> ${new Date(purchase.user.createdAt).toLocaleDateString('he-IL', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</p>
                </div>
              </div>
              
              <!-- Action Buttons -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="http://localhost:3000/admin" 
                   style="display: inline-block; background: #B56B4A; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 0 10px;">
                  🔧 פאנל ניהול
                </a>
                <a href="http://localhost:3000/dashboard" 
                   style="display: inline-block; background: #8E9A7C; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 0 10px;">
                  📊 דשבורד סטודיו
                </a>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #2D3142; color: white; padding: 20px; text-align: center;">
              <p style="margin: 0; font-size: 14px; opacity: 0.8;">
                Studio Boaz Online - מערכת ניהול אוטומטית
              </p>
              <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.6;">
                ${new Date().toLocaleDateString('he-IL', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Send emails to both admin addresses
      for (const adminEmail of adminEmails) {
        try {
          const emailResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/send-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: adminEmail,
              subject: emailSubject,
              html: emailHtml,
            }),
          });

          if (!emailResponse.ok) {
            console.error(`Failed to send admin notification to ${adminEmail}`);
          } else {
            console.log(`✅ Series purchase notification sent to ${adminEmail}`);
          }
        } catch (emailError) {
          console.error(`Error sending email to ${adminEmail}:`, emailError);
        }
      }
    } catch (notificationError) {
      console.error('Error sending admin notifications:', notificationError);
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
