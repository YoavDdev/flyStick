import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    // Get email from request body for admin verification
    const body = await request.json();
    const { adminEmail, subject, content, link, linkText } = body;

    if (!adminEmail) {
      return NextResponse.json(
        { error: 'נדרש אימייל מנהל לאימות' },
        { status: 400 }
      );
    }

    // Check admin status directly from database
    const user = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'משתמש לא נמצא' },
        { status: 404 }
      );
    }

    // Check if user is admin and not free/trial (based on subscriptionId only)
    const isAdmin = user.subscriptionId === "Admin";
    const isFreeOrTrial = user.subscriptionId === "free" || user.subscriptionId === "trial_30";
    
    if (!isAdmin || isFreeOrTrial) {
      return NextResponse.json(
        { error: 'נדרשת הרשאת מנהל' },
        { status: 403 }
      );
    }

    // Validate required fields
    if (!subject || !content) {
      return NextResponse.json(
        { error: 'נושא ותוכן הם שדות חובה' },
        { status: 400 }
      );
    }

    // Get all active subscribers
    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { isActive: true },
      select: { email: true, name: true, unsubscribeToken: true }
    });

    if (subscribers.length === 0) {
      return NextResponse.json(
        { error: 'אין מנויים פעילים לניוזלטר' },
        { status: 400 }
      );
    }

    // Send newsletter to all subscribers
    const emailPromises = subscribers.map(subscriber => 
      resend.emails.send({
        from: 'Studio Boaz <info@studioboazonline.com>',
        to: [subscriber.email],
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F7F3EB; direction: rtl;">
            <div style="background-color: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #2D3142; margin-bottom: 20px; text-align: center; direction: rtl;">${subject}</h2>
              
              ${subscriber.name ? `<p style="color: #3D3D3D; line-height: 1.6; margin-bottom: 20px; text-align: right;">שלום ${subscriber.name},</p>` : ''}
              
              <div style="color: #3D3D3D; line-height: 1.6; margin-bottom: 20px; text-align: right; white-space: pre-wrap;">${content}</div>
              
              ${link && linkText ? `
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${link}" style="background-color: #D5C4B7; color: #2D3142; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                    ${linkText}
                  </a>
                </div>
              ` : ''}
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #D5C4B7;">
                <p style="color: #B8A99C; font-size: 14px;">
                  בברכה,<br>Studio Boaz
                </p>
                <p style="color: #B8A99C; font-size: 12px; margin-top: 15px;">
                  <a href="https://studioboazonline.com/newsletter/unsubscribe?token=${subscriber.unsubscribeToken}" style="color: #B8A99C; text-decoration: underline;">
                    להסרה מרשימת הדפוסות
                  </a>
                </p>
              </div>
            </div>
          </div>
        `,
      })
    );

    // Wait for all emails to be sent
    const results = await Promise.allSettled(emailPromises);
    
    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;

    console.log(`Newsletter sent: ${successful} successful, ${failed} failed`);

    return NextResponse.json(
      { 
        message: `הניוזלטר נשלח בהצלחה ל-${successful} מנויים`,
        stats: { successful, failed, total: subscribers.length }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Newsletter sending error:', error);
    return NextResponse.json(
      { error: 'שגיאה בשליחת הניוזלטר. אנא נסה שוב מאוחר יותר.' },
      { status: 500 }
    );
  }
}

// Get newsletter statistics
export async function GET() {
  try {
    const totalSubscribers = await prisma.newsletterSubscriber.count();
    const activeSubscribers = await prisma.newsletterSubscriber.count({
      where: { isActive: true }
    });
    const unsubscribed = await prisma.newsletterSubscriber.count({
      where: { isActive: false }
    });

    // Get subscription sources
    const sources = await prisma.newsletterSubscriber.groupBy({
      by: ['source'],
      where: { isActive: true },
      _count: { source: true }
    });

    return NextResponse.json({
      totalSubscribers,
      activeSubscribers,
      unsubscribed,
      sources: sources.map(s => ({ source: s.source || 'unknown', count: s._count.source }))
    });

  } catch (error) {
    console.error('Newsletter stats error:', error);
    return NextResponse.json(
      { error: 'שגיאה בטעינת נתוני הניוזלטר' },
      { status: 500 }
    );
  }
}
