import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { Resend } from 'resend';

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
    const { eventId, registrationId } = await req.json();

    // Get event and registration details
    const registration = await prisma.liveEventRegistration.findUnique({
      where: { id: registrationId },
      include: {
        event: true,
        user: true,
      },
    });

    if (!registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    const { event, user } = registration;

    // Initialize Resend
    const resend = new Resend(process.env.RESEND_API_KEY);

    const eventDateTime = formatDateTime(new Date(event.scheduledAt));
    const updatePreferenceUrl = `${process.env.NEXTAUTH_URL}/dashboard/live-notifications?eventId=${event.id}`;

    // Build email HTML
    const emailHtml = `
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
            <td style="background: linear-gradient(135deg, #D5C4B7 0%, #B8A99C 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 28px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                ✅ נרשמת בהצלחה!
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="font-size: 18px; color: #2D3142; margin: 0 0 20px 0; line-height: 1.6;">
                שלום <strong>${user.name || "חבר/ה יקר/ה"}</strong>,
              </p>
              
              <p style="font-size: 16px; color: #5D5D5D; margin: 0 0 30px 0; line-height: 1.8;">
                נרשמת בהצלחה לשיעור החי שלנו! 🎉
              </p>

              <!-- Event Details Card -->
              <div style="background: linear-gradient(135deg, #F7F3EB 0%, #E8DFD0 100%); border-radius: 15px; padding: 25px; margin-bottom: 30px; border-right: 4px solid #B56B4A;">
                <h2 style="margin: 0 0 15px 0; color: #2D3142; font-size: 22px;">
                  ${event.title}
                </h2>
                ${event.description ? `
                  <p style="margin: 0 0 15px 0; color: #5D5D5D; font-size: 15px; line-height: 1.6;">
                    ${event.description}
                  </p>
                ` : ''}
                <p style="margin: 0; color: #B56B4A; font-size: 16px; font-weight: bold;">
                  ${eventDateTime}
                </p>
                <p style="margin: 10px 0 0 0; color: #5D5D5D; font-size: 14px;">
                  משך משוער: ${event.estimatedDuration} דקות
                </p>
              </div>

              <!-- Email Updates Section -->
              <div style="background: #FFF9F0; border: 2px dashed #D5C4B7; border-radius: 15px; padding: 25px; margin-bottom: 30px;">
                <h3 style="margin: 0 0 15px 0; color: #2D3142; font-size: 18px;">
                  רוצה לקבל עדכונים על השיעור?
                </h3>
                <p style="margin: 0 0 20px 0; color: #5D5D5D; font-size: 15px; line-height: 1.7;">
                  נשמח לעדכן אותך במייל אם יהיו שינויים בשיעור:
                </p>
                <ul style="margin: 0 0 20px 0; padding-right: 20px; color: #5D5D5D; font-size: 14px; line-height: 1.8;">
                  <li>שינוי שעה או תאריך</li>
                  <li>ביטול שיעור (חלילה!)</li>
                  <li>דחייה למועד אחר</li>
                  <li>עדכונים חשובים אחרים</li>
                </ul>
                <div style="text-align: center;">
                  <a href="${updatePreferenceUrl}" style="display: inline-block; background: linear-gradient(135deg, #B56B4A 0%, #9a5a3d 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 30px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(181, 107, 74, 0.3);">
                    כן, אני רוצה לקבל עדכונים 📧
                  </a>
                </div>
                <p style="margin: 15px 0 0 0; color: #9D8E81; font-size: 13px; text-align: center; line-height: 1.6;">
                  תוכל לשנות את ההעדפה בכל עת מהדשבורד שלך
                </p>
              </div>

              <!-- How to Join -->
              <div style="background: #F0F8FF; border-radius: 15px; padding: 25px; margin-bottom: 30px;">
                <h3 style="margin: 0 0 15px 0; color: #2D3142; font-size: 18px;">
                  איך להצטרף לשיעור?
                </h3>
                <ol style="margin: 0; padding-right: 20px; color: #5D5D5D; font-size: 15px; line-height: 1.8;">
                  <li>היכנס לאתר <strong>Studio Boaz Online</strong> בזמן השיעור</li>
                  <li>לך לעמוד <strong>שידורים חיים</strong></li>
                  <li>השיעור יופיע אוטומטית - פשוט תלחץ play!</li>
                </ol>
              </div>

              <p style="font-size: 15px; color: #5D5D5D; margin: 0; line-height: 1.7;">
                מצפה לראות אותך בשיעור!<br>
                <strong style="color: #B56B4A;">בועז</strong>
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
                <a href="${process.env.NEXTAUTH_URL}" style="color: #B56B4A; text-decoration: none;">studioboaz.online</a>
              </p>
            </td>
          </tr>

        </table>
      </body>
      </html>
    `;

    // Send email using Resend
    const { error } = await resend.emails.send({
      from: 'Studio Boaz <info@mail.studioboazonline.com>',
      to: user.email!,
      subject: `✅ נרשמת בהצלחה: ${event.title}`,
      html: emailHtml,
    });

    if (error) {
      console.error("❌ Resend error:", error);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    console.log("✅ Registration email sent successfully to:", user.email);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Error sending registration email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
