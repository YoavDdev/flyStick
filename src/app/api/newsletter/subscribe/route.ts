import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import crypto from 'crypto';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

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
      const emailResult = await resend.emails.send({
        from: 'Studio Boaz <info@studioboazonline.com>',
        to: [email],
        subject: 'ברוכים הבאים למסע הפנימי שלנו - Studio Boaz',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F7F3EB; direction: rtl;">
          <div style="background-color: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #2D3142; margin-bottom: 20px; text-align: center; direction: rtl;">ברוכים הבאים למסע הפנימי</h2>
            
            <p style="color: #3D3D3D; line-height: 1.8; margin-bottom: 25px; text-align: right;">
              ${name ? `${name} יקר/ה,` : 'יישות מים יקרה,'}
            </p>
            
            <p style="color: #3D3D3D; line-height: 1.8; margin-bottom: 25px; text-align: right;">
              שמח שהגעת לסטודיו המקוון שלי ואני מקווה שהוא יגרום לך לעונג ובריאות גופניים. כיישות מים אני פונה אליך בחיבוק גדול ומזמין אותך למסע של גילוי עצמי דרך תנועה.
            </p>
            
            <p style="color: #3D3D3D; line-height: 1.8; margin-bottom: 25px; text-align: right;">
              דרכי בעולם התנועה החלה בגיל 38 כשהייתי חסר נסיון תרגולי וכמובן, חסר גמישות ומודעות סומאטית. התשוקה לחקור ולדעת הובילה אותי לדרך שלא ידעתי בתחילתה לאן היא תוביל אותי וכמה תובנות היא תעניק לי.
            </p>
            
            <p style="color: #3D3D3D; line-height: 1.8; margin-bottom: 25px; text-align: right;">
              אני מאמין באהבת הגוף וטיפוח הנפש. לתנועה יש כח עצום בהבראה - היא מקדמת איזון בין הגוף לנפש הפועלת בתוכו, מעודדת גילוי עצמי וגורמת לתפיסות המציאות להיות עשירות, מגוונות ומרווחות ללא מתח וסטרס.
            </p>
            
            <p style="color: #3D3D3D; line-height: 1.8; margin-bottom: 25px; text-align: right;">
              דרך התנועה אנו גוברים על אתגרי החיים ואם נלמד לטפח את הזרימה שלה בגוף, כמו שמים זורמים, נשוט ביתר קלות בנהר חיינו.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://studioboazonline.com/dashboard" style="background-color: #D5C4B7; color: #2D3142; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                התחל את המסע
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
      { message: 'ברוך הבא למסע שלנו המשותף! כמו שמים זורמים, כך גם התובנות שלנו יזרמו אליך. בדוק את האימייל שלך לקבלת הודעת הברכה.' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'שגיאה ברישום לניוזלטר. אנא נסה שוב מאוחר יותר.' },
      { status: 500 }
    );
  }
}
