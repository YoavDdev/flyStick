import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/app/libs/prismadb";
import nodemailer from "nodemailer";

const HEBREW_DAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
const HEBREW_MONTHS = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];

function formatDateTime(date: Date) {
  const day = HEBREW_DAYS[date.getDay()];
  const dateNum = date.getDate();
  const month = HEBREW_MONTHS[date.getMonth()];
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `יום ${day}, ${dateNum} ${month} בשעה ${hours}:${minutes}`;
}

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

    // updateType: "time_change" | "cancelled" | "rescheduled"

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

    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Prepare email content based on update type
    let subject = "";
    let updateMessage = "";
    let updateIcon = "";
    let updateColor = "";

    switch (updateType) {
      case "time_change":
        subject = `⏰ שינוי שעה: ${event.title}`;
        updateIcon = "⏰";
        updateColor = "#B56B4A";
        updateMessage = `
          <p style="font-size: 16px; color: #2D3142; margin: 0 0 20px 0; line-height: 1.8;">
            <strong>שעת השיעור שונתה!</strong>
          </p>
          ${oldDateTime ? `
            <p style="font-size: 15px; color: #5D5D5D; margin: 0 0 10px 0;">
              <span style="text-decoration: line-through; color: #9D8E81;">שעה קודמת: ${formatDateTime(new Date(oldDateTime))}</span>
            </p>
          ` : ''}
          <p style="font-size: 16px; color: #B56B4A; margin: 0 0 20px 0; font-weight: bold;">
            ✅ שעה חדשה: ${formatDateTime(new Date(event.scheduledAt))}
          </p>
        `;
        break;

      case "cancelled":
        subject = `❌ ביטול שיעור: ${event.title}`;
        updateIcon = "❌";
        updateColor = "#DC2626";
        updateMessage = `
          <p style="font-size: 16px; color: #DC2626; margin: 0 0 20px 0; line-height: 1.8; font-weight: bold;">
            מצטערים! השיעור בוטל
          </p>
          <p style="font-size: 15px; color: #5D5D5D; margin: 0 0 20px 0; line-height: 1.8;">
            השיעור שהיה אמור להתקיים ב-${formatDateTime(new Date(event.scheduledAt))} בוטל.
            נעדכן אותך כשיהיה שיעור חדש במקומו.
          </p>
        `;
        break;

      case "rescheduled":
        subject = `📅 דחיית שיעור: ${event.title}`;
        updateIcon = "📅";
        updateColor = "#B56B4A";
        updateMessage = `
          <p style="font-size: 16px; color: #2D3142; margin: 0 0 20px 0; line-height: 1.8;">
            <strong>השיעור נדחה למועד אחר</strong>
          </p>
          ${oldDateTime ? `
            <p style="font-size: 15px; color: #5D5D5D; margin: 0 0 10px 0;">
              <span style="text-decoration: line-through; color: #9D8E81;">מועד קודם: ${formatDateTime(new Date(oldDateTime))}</span>
            </p>
          ` : ''}
          <p style="font-size: 16px; color: #B56B4A; margin: 0 0 20px 0; font-weight: bold;">
            ✅ מועד חדש: ${formatDateTime(new Date(event.scheduledAt))}
          </p>
        `;
        break;

      default:
        subject = `עדכון: ${event.title}`;
        updateIcon = "ℹ️";
        updateColor = "#B56B4A";
        updateMessage = `
          <p style="font-size: 16px; color: #2D3142; margin: 0 0 20px 0; line-height: 1.8;">
            יש עדכון לגבי השיעור
          </p>
        `;
    }

    // Send emails to all registered users
    const emailPromises = registrations.map((reg: any) =>
      transporter.sendMail({
        from: `"Studio Boaz Online" <${process.env.EMAIL_USER}>`,
        to: reg.user.email!,
        subject,
        html: `
          <!DOCTYPE html>
          <html dir="rtl" lang="he">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #F7F3EB 0%, #E8DFD0 100%); direction: rtl;">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 40px auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, ${updateColor} 0%, ${updateColor}dd 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: white; font-size: 28px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    ${updateIcon} עדכון לשיעור
                  </h1>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="font-size: 18px; color: #2D3142; margin: 0 0 20px 0; line-height: 1.6;">
                    שלום <strong>${reg.user.name || "חבר/ה יקר/ה"}</strong>,
                  </p>
                  
                  ${updateMessage}

                  <!-- Event Details Card -->
                  <div style="background: linear-gradient(135deg, #F7F3EB 0%, #E8DFD0 100%); border-radius: 15px; padding: 25px; margin-bottom: 30px; border-right: 4px solid ${updateColor};">
                    <h2 style="margin: 0 0 15px 0; color: #2D3142; font-size: 22px;">
                      📹 ${event.title}
                    </h2>
                    ${event.description ? `
                      <p style="margin: 0 0 15px 0; color: #5D5D5D; font-size: 15px; line-height: 1.6;">
                        ${event.description}
                      </p>
                    ` : ''}
                    ${updateType !== "cancelled" ? `
                      <p style="margin: 0; color: ${updateColor}; font-size: 16px; font-weight: bold;">
                        🗓️ ${formatDateTime(new Date(event.scheduledAt))}
                      </p>
                    ` : ''}
                  </div>

                  <!-- Action Button -->
                  ${updateType !== "cancelled" ? `
                    <div style="text-align: center; margin-bottom: 30px;">
                      <a href="${process.env.NEXTAUTH_URL}/live" style="display: inline-block; background: linear-gradient(135deg, ${updateColor} 0%, ${updateColor}dd 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 30px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(181, 107, 74, 0.3);">
                        לדף השידורים החיים
                      </a>
                    </div>
                  ` : ''}

                  <!-- Manage Preferences -->
                  <div style="background: #F0F8FF; border-radius: 15px; padding: 20px; margin-bottom: 20px;">
                    <p style="margin: 0 0 10px 0; color: #5D5D5D; font-size: 14px; line-height: 1.7;">
                      לא רוצה לקבל עדכונים על שיעור זה?
                    </p>
                    <a href="${process.env.NEXTAUTH_URL}/dashboard/live-notifications" style="color: ${updateColor}; text-decoration: none; font-weight: bold; font-size: 14px;">
                      נהל את העדפות העדכונים שלך ←
                    </a>
                  </div>

                  <p style="font-size: 15px; color: #5D5D5D; margin: 0; line-height: 1.7;">
                    תודה על ההבנה,<br>
                    <strong style="color: ${updateColor};">בועז והצוות</strong>
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background: #F7F3EB; padding: 30px; text-align: center; border-top: 1px solid #D5C4B7;">
                  <p style="margin: 0 0 10px 0; color: #9D8E81; font-size: 13px;">
                    Studio Boaz Online - הסטודיו המקוון שלך לפיתוח גוף ונפש
                  </p>
                  <p style="margin: 0; color: #B8A99C; font-size: 12px;">
                    <a href="${process.env.NEXTAUTH_URL}" style="color: ${updateColor}; text-decoration: none;">studioboaz.online</a>
                  </p>
                </td>
              </tr>

            </table>
          </body>
          </html>
        `,
      })
    );

    await Promise.all(emailPromises);

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
