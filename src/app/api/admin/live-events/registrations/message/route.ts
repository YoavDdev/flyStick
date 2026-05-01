export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { verifyAdminAccess } from "@/app/libs/adminAuth";
import { Resend } from "resend";

// POST - Send a message to all registrants of a specific event
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdminAccess(request);
    if (!authResult.isAuthenticated || !authResult.isAdmin) {
      return NextResponse.json({ error: "אין הרשאות מתאימות" }, { status: 401 });
    }

    const body = await request.json();
    const { eventId, title, content } = body;

    if (!eventId || !title || !content) {
      return NextResponse.json({ error: "חסרים שדות חובה" }, { status: 400 });
    }

    // Get all registrant userIds for this event
    const registrations = await prisma.liveEventRegistration.findMany({
      where: { eventId },
      select: { userId: true },
    });

    if (registrations.length === 0) {
      return NextResponse.json({ error: "אין נרשמים לאירוע זה" }, { status: 400 });
    }

    const targetUserIds = registrations.map((r: { userId: string }) => r.userId);

    // Create a targeted message visible only to these users
    await prisma.message.create({
      data: {
        title,
        content,
        targetUserIds,
        isActive: true,
      },
    });

    // Send email notifications to targeted users
    try {
      const users = await prisma.user.findMany({
        where: { id: { in: targetUserIds } },
        select: { email: true, name: true },
      });

      const resend = new Resend(process.env.RESEND_API_KEY);
      console.log(`📧 Sending targeted message emails to ${users.length} registrants`);

      const emailPromises = users.map(async (user: { email: string; name: string | null }) => {
        try {
          await resend.emails.send({
            from: 'Studio Boaz <info@mail.studioboazonline.com>',
            to: user.email,
            subject: `הודעה חדשה מבועז - ${title}`,
            html: buildNotificationEmail({ name: user.name, title, content }),
          });
          console.log(`✅ Email sent to ${user.email}`);
        } catch (emailErr) {
          console.error(`❌ Failed to send email to ${user.email}:`, emailErr);
        }
      });

      await Promise.allSettled(emailPromises);
    } catch (emailError) {
      console.error("❌ Error sending email notifications:", emailError);
      // Don't fail the whole request if emails fail
    }

    return NextResponse.json({
      success: true,
      count: targetUserIds.length,
    });
  } catch (error: any) {
    console.error("Error sending message to registrants:", error.message);
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}

function buildNotificationEmail({ name, title, content }: { name: string | null; title: string; content: string }) {
  const greeting = name ? `שלום ${name},` : 'שלום,';
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F7F3EB; margin: 0; padding: 20px; direction: rtl;">
      <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
        
        <div style="background: white; padding: 20px; text-align: center; border-bottom: 3px solid #D5C4B7;">
          <img src="https://studioboazonline.com/apple-touch-icon.png" alt="Studio Boaz Online" style="height: 60px; width: auto;" />
          <div style="margin-top: 8px;">
            <a href="https://studioboazonline.com" style="color: #2D3142; text-decoration: none; font-size: 14px; font-weight: 600;">www.studioboazonline.com</a>
          </div>
        </div>
        
        <div style="background: linear-gradient(135deg, #D5C4B7 0%, #B8A99C 100%); padding: 25px; text-align: center;">
          <div style="font-size: 32px; margin-bottom: 8px;">✉️</div>
          <h1 style="color: white; margin: 0; font-size: 20px; font-weight: bold;">הודעה חדשה מבועז</h1>
        </div>
        
        <div style="padding: 25px;">
          <p style="color: #2D3142; font-size: 16px; line-height: 1.6; margin-bottom: 15px;">${greeting}</p>
          
          <p style="color: #2D3142; font-size: 15px; line-height: 1.6; margin-bottom: 15px;">
            הודעה חדשה באתר הסטודיו:
          </p>
          
          <div style="background: #F7F3EB; border-right: 4px solid #D5C4B7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2D3142; margin: 0 0 8px 0; font-size: 16px;">${title}</h3>
            <p style="color: #3D3D3D; font-size: 14px; line-height: 1.7; margin: 0;">${content}</p>
          </div>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="https://studioboazonline.com/dashboard" 
               style="background: linear-gradient(135deg, #D5C4B7, #B8A99C); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
              לצפייה באיזור האישי
            </a>
          </div>
        </div>
        
        <div style="background: #2D3142; color: white; padding: 15px; text-align: center;">
          <p style="margin: 0; font-size: 13px; opacity: 0.8;">Studio Boaz Online - בועז נחייסי</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
