export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions as authOptionsImport } from "../../auth/[...nextauth]/route.jsx";
import prisma from "../../../libs/prismadb";
import { Resend } from 'resend';

const authOptions = authOptionsImport as any;

interface SessionUser {
  user?: {
    email?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as SessionUser;

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!adminUser || adminUser.subscriptionId !== "Admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { title, content, link, linkText } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    // 1. Create the system message (visible in envelope to ALL registered users)
    const message = await prisma.message.create({
      data: {
        title,
        content,
        link: link || null,
        linkText: linkText || null,
      },
    });

    // 2. Send email only to registered Users who are ALSO newsletter subscribers
    let emailsSent = 0;
    let emailsFailed = 0;

    try {
      const resend = new Resend(process.env.RESEND_API_KEY);

      // Get all registered users' emails
      const allUsers = await prisma.user.findMany({
        select: { email: true, name: true },
      });
      const userEmailSet = new Set(allUsers.map((u: { email: string }) => u.email.toLowerCase()));

      // Get active newsletter subscribers
      const subscribers = await prisma.newsletterSubscriber.findMany({
        where: { isActive: true },
        select: { email: true, name: true, unsubscribeToken: true },
      });

      // Only email users who are BOTH registered AND subscribed to newsletter
      const eligibleRecipients = subscribers.filter(
        (sub: { email: string }) => userEmailSet.has(sub.email.toLowerCase())
      );

      console.log(`📧 System message created. Sending email to ${eligibleRecipients.length} users (registered + newsletter). Total registered: ${allUsers.length}, Total newsletter: ${subscribers.length}`);

      const emailPromises = eligibleRecipients.map(async (recipient: { email: string; name: string | null; unsubscribeToken: string }) => {
        try {
          const { error } = await resend.emails.send({
            from: 'Studio Boaz <info@mail.studioboazonline.com>',
            to: recipient.email,
            subject: `הודעה חדשה מבועז - ${title}`,
            html: buildMessageNotificationEmail({
              name: recipient.name,
              title,
              content,
              link: link || null,
              linkText: linkText || null,
              unsubscribeToken: recipient.unsubscribeToken,
            }),
          });

          if (error) {
            console.error(`❌ Failed to send to ${recipient.email}:`, error);
            emailsFailed++;
          } else {
            console.log(`✅ Email sent to ${recipient.email}`);
            emailsSent++;
          }
        } catch (emailErr) {
          console.error(`❌ Error sending to ${recipient.email}:`, emailErr);
          emailsFailed++;
        }
      });

      await Promise.allSettled(emailPromises);
      console.log(`✅ Done: ${emailsSent} sent, ${emailsFailed} failed`);
    } catch (emailError) {
      console.error('❌ Error in email sending flow:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: `ההודעה נשלחה בהצלחה! הודעת מערכת לכל המשתמשים + ${emailsSent} אימיילים נשלחו`,
      messageId: message.id,
      emailsSent,
      emailsFailed,
    });
  } catch (error) {
    console.error("Error sending admin message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function buildMessageNotificationEmail({
  name,
  title,
  content,
  link,
  linkText,
  unsubscribeToken,
}: {
  name: string | null;
  title: string;
  content: string;
  link: string | null;
  linkText: string | null;
  unsubscribeToken: string;
}) {
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
            מחכה לך הודעה חדשה באתר הסטודיו:
          </p>
          
          <div style="background: #F7F3EB; border-right: 4px solid #D5C4B7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2D3142; margin: 0 0 8px 0; font-size: 16px;">${title}</h3>
            <p style="color: #3D3D3D; font-size: 14px; line-height: 1.7; margin: 0;">${content}</p>
          </div>

          ${link ? `
          <div style="text-align: center; margin: 20px 0 10px 0;">
            <a href="${link}" style="background: #2D3142; color: white; padding: 10px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
              ${linkText || 'לחץ כאן'}
            </a>
          </div>
          ` : ''}
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="https://studioboazonline.com/dashboard" 
               style="background: linear-gradient(135deg, #D5C4B7, #B8A99C); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
              לצפייה באיזור האישי
            </a>
          </div>
        </div>
        
        <div style="background: #2D3142; color: white; padding: 15px; text-align: center;">
          <p style="margin: 0 0 8px 0; font-size: 13px; opacity: 0.8;">Studio Boaz Online - בועז נחייסי</p>
          <a href="https://studioboazonline.com/newsletter/unsubscribe?token=${unsubscribeToken}" 
             style="color: rgba(255,255,255,0.5); font-size: 11px; text-decoration: underline;">
            להסרה מרשימת התפוצה
          </a>
        </div>
      </div>
    </body>
    </html>
  `;
}
