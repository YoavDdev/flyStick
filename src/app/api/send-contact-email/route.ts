import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, message } = await request.json();

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'שם, אימייל והודעה הם שדות חובה' },
        { status: 400 }
      );
    }

    // Send email to admin
    const { data, error } = await resend.emails.send({
      from: 'Studio Boaz <onboarding@resend.dev>',
      to: ['info@studioboazonline.com'],
      subject: `הודעה חדשה מאתר Studio Boaz - ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F7F3EB; direction: rtl;">
          <div style="background-color: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #2D3142; margin-bottom: 20px; text-align: center; direction: rtl;">הודעה חדשה מאתר Studio Boaz</h2>
            
            <div style="background-color: #F7F3EB; padding: 20px; border-radius: 10px; margin-bottom: 20px; direction: rtl;">
              <h3 style="color: #2D3142; margin-bottom: 15px; text-align: right;">פרטי השולח:</h3>
              <p style="margin: 8px 0; text-align: right;"><strong>שם:</strong> ${name}</p>
              <p style="margin: 8px 0; text-align: right;"><strong>אימייל:</strong> ${email}</p>
              ${phone ? `<p style="margin: 8px 0; text-align: right;"><strong>טלפון:</strong> ${phone}</p>` : ''}
            </div>
            
            <div style="background-color: #F7F3EB; padding: 20px; border-radius: 10px; direction: rtl;">
              <h3 style="color: #2D3142; margin-bottom: 15px; text-align: right;">ההודעה:</h3>
              <p style="line-height: 1.6; color: #3D3D3D; white-space: pre-wrap; text-align: right;">${message}</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #D5C4B7;">
              <p style="color: #B8A99C; font-size: 14px;">נשלח מאתר Studio Boaz Online</p>
            </div>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'שגיאה בשליחת האימייל. אנא נסו שוב מאוחר יותר.' },
        { status: 500 }
      );
    }

    // Send confirmation email to user
    await resend.emails.send({
      from: 'Studio Boaz <onboarding@resend.dev>',
      to: [email],
      subject: 'תודה על פנייתכם - Studio Boaz',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F7F3EB; direction: rtl;">
          <div style="background-color: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #2D3142; margin-bottom: 20px; text-align: center; direction: rtl;">תודה על פנייתך!</h2>
            
            <p style="color: #3D3D3D; line-height: 1.6; margin-bottom: 20px; text-align: right;">שלום ${name},</p>
            
            <p style="color: #3D3D3D; line-height: 1.6; margin-bottom: 20px; text-align: right;">
              תודה שפנית אלי, קיבלתי את ההודעה ואחזור אליך בהקדם האפשרי.
            </p>
            
            <div style="background-color: #F7F3EB; padding: 20px; border-radius: 10px; margin: 20px 0; direction: rtl;">
              <p style="color: #2D3142; margin: 0; text-align: right;"><strong>ההודעה שלך:</strong></p>
              <p style="color: #3D3D3D; margin: 10px 0 0 0; white-space: pre-wrap; text-align: right;">${message}</p>
            </div>
            
            <p style="color: #3D3D3D; line-height: 1.6; margin-bottom: 20px; text-align: right;">
              בינתיים, אתה מוזמן לעיין בשיעורים שלי ולהתחיל את המסע שלך לבריאות ורווחה.
            </p>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://studioboazonline.com/dashboard" style="background-color: #D5C4B7; color: #2D3142; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                כניסה לאתר
              </a>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #D5C4B7;">
              <p style="color: #B8A99C; font-size: 14px;">בברכה,<br>Studio Boaz</p>
            </div>
          </div>
        </div>
      `,
    });

    return NextResponse.json(
      { message: 'האימייל נשלח בהצלחה!' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Contact email error:', error);
    return NextResponse.json(
      { error: 'שגיאה בשליחת האימייל. אנא נסו שוב מאוחר יותר.' },
      { status: 500 }
    );
  }
}
