import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/app/libs/prismadb";
import { Resend } from 'resend';
import { formatDateTimeIsrael } from "@/app/utils/dateUtils";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Verify admin
    const user = await prisma.user.findUnique({
      where: { email: session?.user?.email || "" },
    });

    if (!user || user.subscriptionId !== "Admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId, updateType, oldDateTime, newDateTime } = await req.json();

    if (!eventId || !updateType) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Get event details
    const event = await prisma.liveEvent.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Get all registrations that want email updates
    const registrations = await prisma.liveEventRegistration.findMany({
      where: {
        eventId,
        wantsEmailUpdates: true,
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    if (registrations.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: "No users want email updates for this event" 
      });
    }

    // Initialize Resend
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Prepare email content based on update type
    let subject = "";
    let updateMessage = "";

    switch (updateType) {
      case "time_change":
        subject = `⏰ שינוי שעה: ${event.title}`;
        updateMessage = `
          <p style="font-size: 16px; color: #2D3142; margin: 0 0 20px 0;">
            <strong>שעת השיעור שונתה!</strong>
          </p>
          ${oldDateTime ? `
            <p style="font-size: 15px; color: #9D8E81; margin: 0 0 10px 0; text-decoration: line-through;">
              שעה קודמת: ${formatDateTimeIsrael(oldDateTime)}
            </p>
          ` : ''}
          <p style="font-size: 16px; color: #B56B4A; margin: 0 0 20px 0; font-weight: bold;">
            ✅ שעה חדשה: ${formatDateTimeIsrael(event.scheduledAt)}
          </p>
        `;
        break;

      case "cancelled":
        subject = `❌ ביטול שיעור: ${event.title}`;
        updateMessage = `
          <p style="font-size: 16px; color: #DC2626; margin: 0 0 20px 0; font-weight: bold;">
            מצטערים! השיעור בוטל
          </p>
          <p style="font-size: 15px; color: #5D5D5D; margin: 0 0 20px 0;">
            השיעור שהיה אמור להתקיים ב-${formatDateTimeIsrael(event.scheduledAt)} בוטל.
            נעדכן אותך כשיהיה שיעור חדש במקומו.
          </p>
        `;
        break;

      case "rescheduled":
        subject = `📅 דחיית שיעור: ${event.title}`;
        updateMessage = `
          <p style="font-size: 16px; color: #2D3142; margin: 0 0 20px 0;">
            <strong>השיעור נדחה למועד אחר</strong>
          </p>
          ${oldDateTime ? `
            <p style="font-size: 15px; color: #9D8E81; margin: 0 0 10px 0; text-decoration: line-through;">
              מועד קודם: ${formatDateTimeIsrael(oldDateTime)}
            </p>
          ` : ''}
          <p style="font-size: 16px; color: #B56B4A; margin: 0 0 20px 0; font-weight: bold;">
            ✅ מועד חדש: ${formatDateTimeIsrael(event.scheduledAt)}
          </p>
        `;
        break;

      case "completed":
        subject = `🎬 ההשלמה זמינה: ${event.title}`;
        updateMessage = `
          <p style="font-size: 16px; color: #2D3142; margin: 0 0 20px 0; font-weight: bold;">
            ההקלטה של השיעור זמינה לצפייה!
          </p>
          <p style="font-size: 15px; color: #5D5D5D; margin: 0 0 20px 0;">
            השיעור שהיה אמור להתקיים ב-${formatDateTimeIsrael(event.scheduledAt)} הושלם והוקלטה גרסת ההשלמה שלו.
          </p>
          <p style="font-size: 15px; color: #B56B4A; margin: 0 0 20px 0; font-weight: bold;">
            ✅ ניתן כעת לצפות בהקלטה דרך לוח השידורים!
          </p>
        `;
        break;

      default:
        subject = `עדכון: ${event.title}`;
        updateMessage = `<p>יש עדכון לגבי השיעור</p>`;
    }

    // Send emails to all registered users
    const emailPromises = registrations.map(async (reg: any) => {
      const { error } = await resend.emails.send({
        from: 'Studio Boaz <info@mail.studioboazonline.com>',
        to: reg.user.email!,
        subject,
        html: `
          <!DOCTYPE html>
          <html dir="rtl" lang="he">
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background: #F7F3EB; direction: rtl;">
            <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 20px; padding: 40px; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
              <h1 style="color: #2D3142; margin-bottom: 20px;">עדכון לשיעור</h1>
              <p style="font-size: 16px; color: #2D3142;">שלום <strong>${reg.user.name || "חבר/ה יקר/ה"}</strong>,</p>
              ${updateMessage}
              <div style="background: #F7F3EB; border-radius: 15px; padding: 20px; margin: 20px 0;">
                <h2 style="color: #2D3142; margin: 0 0 10px 0;">📹 ${event.title}</h2>
                ${event.description ? `<p style="color: #5D5D5D;">${event.description}</p>` : ''}
              </div>
              ${updateType !== "cancelled" ? `
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.NEXTAUTH_URL}/live" style="display: inline-block; background: #B56B4A; color: white; text-decoration: none; padding: 15px 40px; border-radius: 30px; font-weight: bold;">
                    לדף השידורים החיים
                  </a>
                </div>
              ` : ''}
              <p style="font-size: 14px; color: #9D8E81; margin-top: 30px;">
                <a href="${process.env.NEXTAUTH_URL}/dashboard/live-notifications" style="color: #B56B4A;">ניהול העדפות העדכונים</a>
              </p>
              <p style="color: #5D5D5D; margin-top: 20px;">תודה,<br><strong style="color: #B56B4A;">בועז והצוות</strong></p>
            </div>
          </body>
          </html>
        `,
      });

      if (error) {
        console.error(`❌ Failed to send to ${reg.user.email}:`, error);
      } else {
        console.log(`✅ Update email sent to ${reg.user.email}`);
      }
    });

    await Promise.all(emailPromises);

    // Create system message for all users when completion is available
    if (updateType === "completed") {
      try {
        await prisma.message.create({
          data: {
            title: `🎬 הקלטה זמינה: ${event.title}`,
            content: `השיעור "${event.title}" שהיה אמור להתקיים ב-${formatDateTimeIsrael(event.scheduledAt)} הושלם — ניתן כעת לצפות בהקלטה!`,
            link: "/live",
            linkText: "לצפייה בהקלטה",
            isActive: true,
          },
        });
      } catch (msgErr: any) {
        console.error("Error creating completion message (non-blocking):", msgErr.message);
      }
    }

    return NextResponse.json({ 
      success: true, 
      emailsSent: registrations.length 
    });
  } catch (error) {
    console.error("Error sending update notifications:", error);
    return NextResponse.json(
      { error: "Failed to send notifications" },
      { status: 500 }
    );
  }
}
