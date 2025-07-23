import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
// Import and cast authOptions to any to avoid type errors
import { authOptions as authOptionsImport } from "../../auth/[...nextauth]/route.jsx";
import prisma from "../../../libs/prismadb";
import { Resend } from 'resend';

// Cast to avoid TypeScript errors with session.strategy
const authOptions = authOptionsImport as any;

// Define session type to avoid TypeScript errors
interface SessionUser {
  user?: {
    email?: string;
  };
}

// Define newsletter subscriber type
interface NewsletterSubscriber {
  email: string;
  name: string | null;
  unsubscribeToken: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as SessionUser;

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.subscriptionId !== "Admin") {
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

    // Create the message
    const message = await prisma.message.create({
      data: {
        title,
        content,
        link: link || null,
        linkText: linkText || null,
      },
    });

    // Send email notifications to all newsletter subscribers
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      // Get all active newsletter subscribers
      const subscribers = await prisma.newsletterSubscriber.findMany({
        where: { isActive: true },
        select: { email: true, name: true, unsubscribeToken: true }
      }) as NewsletterSubscriber[];
      
      console.log(`📧 Sending message notifications to ${subscribers.length} subscribers`);
      
      // Send notification emails to all subscribers
      const emailPromises = subscribers.map(async (subscriber: NewsletterSubscriber) => {
        try {
          const { data, error } = await resend.emails.send({
            from: 'info@studioboazonline.com',
            to: subscriber.email,
            subject: 'הודעה חדשה - Studio Boaz',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F7F3EB; direction: rtl;">
                <div style="background-color: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <h2 style="color: #2D3142; margin-bottom: 20px; text-align: center; direction: rtl;">הודעה חדשה</h2>
                  
                  ${subscriber.name ? `<p style="color: #3D3D3D; line-height: 1.8; margin-bottom: 25px; text-align: right;">${subscriber.name}, יקר/ה</p>` : '<p style="color: #3D3D3D; line-height: 1.8; margin-bottom: 25px; text-align: right;">יקר/ה</p>'}
                  
                  <p style="color: #3D3D3D; line-height: 1.8; margin-bottom: 25px; text-align: right;">
                    מחכה לך הודעה מבועז באתר הסטודיו באזור האישי.
                  </p>
                  
                  <p style="color: #3D3D3D; line-height: 1.8; margin-bottom: 25px; text-align: right;">
                    ההודעה החדשה: <strong style="color: #2D3142;">${title}</strong>
                  </p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="https://studioboazonline.com/dashboard" 
                       style="background-color: #D5C4B7; color: #2D3142; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                      איזור האישי
                    </a>
                  </div>
                  

                  
                  <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #D5C4B7;">
                    <p style="color: #B8A99C; font-size: 14px;">
                      בברכה,<br>בועז - Studio Boaz
                    </p>
                    <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #E5E5E5;">
                      <a href="https://studioboazonline.com/newsletter/unsubscribe?token=${subscriber.unsubscribeToken}" 
                         style="color: #B8A99C; font-size: 12px; text-decoration: underline;">
                        להסרה מרשימת הדפוסות
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            `,
          });
          
          if (error) {
            console.error(`❌ Failed to send notification to ${subscriber.email}:`, error);
          } else {
            console.log(`✅ Notification sent to ${subscriber.email}`);
          }
        } catch (emailError) {
          console.error(`❌ Error sending notification to ${subscriber.email}:`, emailError);
        }
      });
      
      // Wait for all emails to be sent (with error handling)
      await Promise.allSettled(emailPromises);
      
      console.log(`✅ Message notifications sent to subscribers`);
    } catch (emailError) {
      console.error('❌ Error sending email notifications:', emailError);
      // Don't fail the whole request if emails fail
    }

    return NextResponse.json({
      success: true,
      message: "Message sent successfully to all users and email notifications sent",
      messageId: message.id,
    });
  } catch (error) {
    console.error("Error sending admin message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
