export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email, name, source = 'unknown' } = await request.json();

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'כתובת אימייל חוקית נדרשת' },
        { status: 400 }
      );
    }

    // Generate unsubscribe token
    const unsubscribeToken = crypto.randomBytes(32).toString('hex');

    // Check if already subscribed
    const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email }
    });

    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return NextResponse.json(
          { error: 'כתובת האימייל כבר רשומה לניוזלטר' },
          { status: 400 }
        );
      } else {
        // Reactivate subscription
        await prisma.newsletterSubscriber.update({
          where: { email },
          data: {
            isActive: true,
            name: name || existingSubscriber.name,
            source,
            subscribedAt: new Date(),
            unsubscribedAt: null,
            unsubscribeToken
          }
        });
      }
    } else {
      // Create new subscription
      await prisma.newsletterSubscriber.create({
        data: {
          email,
          name,
          source,
          unsubscribeToken
        }
      });
    }

    // Send welcome email
    try {
      console.log('🔄 Sending welcome email to:', email);
      const resend = new Resend(process.env.RESEND_API_KEY);
      const emailResult = await resend.emails.send({
        from: 'Studio Boaz <info@mail.studioboazonline.com>',
        to: [email],
        subject: 'ברוכים הבאים למסע הפנימי שלנו - Studio Boaz',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F7F3EB; direction: rtl;">
          <div style="background-color: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #2D3142; margin-bottom: 20px; text-align: center; direction: rtl;">ברוכים הבאים למסע הפנימי</h2>
            
            <p style="color: #3D3D3D; line-height: 1.8; margin-bottom: 25px; text-align: right;">
              שמח על ההצטרפות!
            </p>
            
            <p style="color: #3D3D3D; line-height: 1.8; margin-bottom: 25px; text-align: right;">
              מדי פעם יופצו תכנים מעוררי מחשבה, כלים פרקטיים לעבודה, המלצות על שיעורים וסדנאות ואף ארועים המתרחשים בכל הארץ. זו הזדמנות לפגוש את בועז ואת הקהילה היפה שנבנתה לאורך השנים, קהילת אנשי הלב.
            </p>
            
            <p style="color: #3D3D3D; line-height: 1.8; margin-bottom: 25px; text-align: right;">
              תמיד טוב להתחיל ממשהו וזה בהחלט צעד קטן שאני מקווה שיגדל ויוביל להשתתפות ותרגול של סודות הגוף והתודעה.
            </p>
            
            <p style="color: #3D3D3D; line-height: 1.8; margin-bottom: 25px; text-align: right;">
              תודה ויום נעים ומדויק.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://studioboazonline.com/dashboard" style="background-color: #D5C4B7; color: #2D3142; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                להתחיל את המסע
              </a>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #D5C4B7;">
              <p style="color: #B8A99C; font-size: 14px;">
                בברכה,<br>Studio Boaz
              </p>
              <p style="color: #B8A99C; font-size: 12px; margin-top: 15px;">
                <a href="https://studioboazonline.com/newsletter/unsubscribe?token=${unsubscribeToken}" style="color: #B8A99C; text-decoration: underline;">
                  להסרה מרשימת הדפוסות
                </a>
              </p>
            </div>
          </div>
        </div>
      `,
      });
      console.log('✅ Welcome email sent successfully:', emailResult);
    } catch (emailError) {
      console.error('❌ Failed to send welcome email:', emailError);
      // Don't fail the subscription if email fails, just log the error
    }

    return NextResponse.json(
      { message: 'ההרשמה הושלמה בהצלחה! כמו שמים זורמים, כך גם התובנות יזרמו. יש לבדוק את תיבת המייל לקבלת הודעת הברכה.' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'שגיאה ברישום לניוזלטר. יש לנסות שוב מאוחר יותר.' },
      { status: 500 }
    );
  }
}
