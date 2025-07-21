import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Unsubscribe request received:', request.url);
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    console.log('🎫 Token received:', token);

    if (!token) {
      console.log('❌ No token provided');
      return NextResponse.json(
        { error: 'קישור ביטול מנוי לא תקין' },
        { status: 400 }
      );
    }

    // Find subscriber by token
    console.log('🔍 Searching for subscriber with token...');
    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { unsubscribeToken: token }
    });
    console.log('📊 Subscriber found:', subscriber ? 'Yes' : 'No');
    if (subscriber) {
      console.log('📧 Subscriber email:', subscriber.email);
      console.log('✅ Is active:', subscriber.isActive);
    }

    if (!subscriber) {
      console.log('❌ Subscriber not found for token:', token);
      return NextResponse.json(
        { error: 'קישור ביטול מנוי לא נמצא או פג תוקף' },
        { status: 404 }
      );
    }

    if (!subscriber.isActive) {
      return NextResponse.json(
        { message: 'המנוי כבר בוטל בעבר' },
        { status: 200 }
      );
    }

    // Unsubscribe
    await prisma.newsletterSubscriber.update({
      where: { unsubscribeToken: token },
      data: {
        isActive: false,
        unsubscribedAt: new Date()
      }
    });

    // Return HTML page for better UX
    return new Response(`
      <!DOCTYPE html>
      <html dir="rtl" lang="he">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ביטול מנוי - Studio Boaz</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #F7F3EB;
            margin: 0;
            padding: 20px;
            direction: rtl;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            text-align: center;
          }
          h1 {
            color: #2D3142;
            margin-bottom: 20px;
          }
          p {
            color: #3D3D3D;
            line-height: 1.6;
            margin-bottom: 20px;
          }
          .btn {
            display: inline-block;
            background-color: #D5C4B7;
            color: #2D3142;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            margin-top: 20px;
          }
          .btn:hover {
            background-color: #B8A99C;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>המנוי בוטל בהצלחה</h1>
          <p>המנוי שלך לניוזלטר של Studio Boaz בוטל בהצלחה.</p>
          <p>אם תרצה להירשם שוב בעתיד, תמיד תוכל לעשות זאת דרך האתר שלנו.</p>
          <p>תודה שהיית חלק מהקהילה שלנו!</p>
          <a href="https://studioboazonline.com" class="btn">חזרה לאתר</a>
        </div>
      </body>
      </html>
    `, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });

  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    return NextResponse.json(
      { error: 'שגיאה בביטול המנוי. אנא נסה שוב מאוחר יותר.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'כתובת אימייל נדרשת' },
        { status: 400 }
      );
    }

    // Find and unsubscribe
    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email }
    });

    if (!subscriber) {
      return NextResponse.json(
        { error: 'כתובת האימייל לא נמצאה ברשימת המנויים' },
        { status: 404 }
      );
    }

    if (!subscriber.isActive) {
      return NextResponse.json(
        { message: 'המנוי כבר בוטל בעבר' },
        { status: 200 }
      );
    }

    await prisma.newsletterSubscriber.update({
      where: { email },
      data: {
        isActive: false,
        unsubscribedAt: new Date()
      }
    });

    return NextResponse.json(
      { message: 'המנוי בוטל בהצלחה' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    return NextResponse.json(
      { error: 'שגיאה בביטול המנוי. אנא נסה שוב מאוחר יותר.' },
      { status: 500 }
    );
  }
}
