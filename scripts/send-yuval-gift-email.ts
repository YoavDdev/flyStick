/**
 * Script to send gift email to Yuval with custom message
 * Run with: npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/send-yuval-gift-email.ts
 */

import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

async function main() {
  console.log('📧 Sending gift email to Yuval...\n');

  // Find the breathing course
  const breathingSeries = await prisma.videoSeries.findFirst({
    where: {
      title: {
        contains: 'נשימה',
        mode: 'insensitive'
      }
    }
  });

  if (!breathingSeries) {
    console.error('❌ Breathing course not found');
    process.exit(1);
  }

  console.log('✅ Found series:', breathingSeries.title);

  const recipientEmail = 'yuvaltidhar@gmail.com';
  const recipientName = 'יובל תדהר';
  const giftMessage = 'יוב אחות אהובה מקוה לימים רגועים של נשימה ורווחה';
  const senderName = 'Studio Boaz';

  // Create the gift email HTML
  const emailHtml = `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F7F3EB; margin: 0; padding: 20px; direction: rtl;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
    
    <!-- Header with logo -->
    <div style="background: white; padding: 25px 20px; text-align: center; border-bottom: 3px solid #D5C4B7;">
      <div style="margin-bottom: 15px;">
        <img src="https://studioboazonline.com/apple-touch-icon.png" alt="Studio Boaz Online" style="height: 80px; width: auto; display: inline-block;" />
      </div>
      <div style="margin-top: 12px;">
        <a href="https://studioboazonline.com" style="color: #2D3142; text-decoration: none; font-size: 16px; font-weight: 600; display: block; margin-bottom: 6px;">www.studioboazonline.com</a>
        <p style="color: #B8A99C; font-size: 14px; margin: 0; font-weight: 500;">שיעורים, הרצאות וארועים</p>
      </div>
    </div>
    
    <!-- Gift Icon and Title -->
    <div style="background: linear-gradient(135deg, #D5C4B7 0%, #B8A99C 100%); padding: 40px; text-align: center;">
      <div style="margin-bottom: 20px;">
        <svg width="80" height="80" viewBox="0 0 64 64" style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));">
          <rect x="8" y="28" width="48" height="28" rx="2" fill="#2D3142" opacity="0.9"/>
          <rect x="4" y="20" width="56" height="12" rx="2" fill="#2D3142"/>
          <path d="M32 8 Q24 8 24 16 Q24 20 28 20 L32 20 L32 8 Z" fill="#2D3142" opacity="0.85"/>
          <path d="M32 8 Q40 8 40 16 Q40 20 36 20 L32 20 L32 8 Z" fill="#2D3142" opacity="0.85"/>
          <rect x="30" y="20" width="4" height="36" fill="#2D3142" opacity="0.7"/>
          <rect x="8" y="30" width="48" height="3" fill="white" opacity="0.2"/>
        </svg>
      </div>
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.2); line-height: 1.4;">🎁 קיבלת מתנה!</h1>
    </div>
    
    <!-- Message Content -->
    <div style="padding: 35px;">
      <p style="color: #2D3142; font-size: 18px; line-height: 1.8; margin-bottom: 20px;">
        שלום <strong>${recipientName}</strong> 👋
      </p>
      
      <p style="color: #2D3142; font-size: 16px; line-height: 1.8; margin-bottom: 25px;">
        ${senderName} שלח/ה לך מתנה מיוחדת - גישה מלאה לסדרה:
      </p>
      
      <div style="background: linear-gradient(to left, #FFF8E1, #FFECB3); border-right: 4px solid #D5C4B7; padding: 20px 25px; border-radius: 12px; margin: 25px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        <h2 style="color: #2D3142; margin: 0 0 10px 0; font-size: 24px; font-weight: bold;">${breathingSeries.title}</h2>
        <p style="color: #5D5D5D; margin: 0; font-size: 15px; line-height: 1.6;">${breathingSeries.description || 'סדרת שיעורים מקצועית מבית Studio Boaz'}</p>
      </div>
      
      ${giftMessage ? `
      <div style="background: #F0F4F8; border-right: 4px solid #B8A99C; padding: 18px 22px; border-radius: 10px; margin: 25px 0;">
        <p style="color: #5D5D5D; font-size: 13px; margin: 0 0 8px 0; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">💌 הודעה אישית</p>
        <p style="color: #2D3142; font-size: 16px; line-height: 1.7; margin: 0; font-style: italic;">"${giftMessage}"</p>
      </div>
      ` : ''}
      
      <div style="text-align: center; margin: 35px 0;">
        <a href="https://studioboazonline.com/series" style="display: inline-block; background: linear-gradient(135deg, #D5C4B7, #B8A99C); color: white; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 17px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: all 0.3s ease;">התחל/י לצפות עכשיו</a>
      </div>
      
      <div style="background: #E8F5E9; border-radius: 10px; padding: 18px; margin: 25px 0;">
        <p style="color: #2D3142; font-size: 14px; line-height: 1.7; margin: 0;">
          <strong>💡 איך זה עובד?</strong><br/>
          הסדרה כבר זמינה לצפייה באתר שלנו. פשוט התחבר/י עם המייל הזה והתחל/י ליהנות!
        </p>
      </div>
      
      <p style="color: #5D5D5D; font-size: 14px; line-height: 1.7; margin: 25px 0 0 0; text-align: center;">
        מקווים שתהנה מהסדרה! 🙏
      </p>
    </div>
    
    <!-- Footer -->
    <div style="background: #2D3142; color: white; padding: 20px; text-align: center;">
      <p style="margin: 0; font-size: 14px; opacity: 0.8;">Studio Boaz Online - בועז נחייסי</p>
      <p style="margin: 8px 0 0 0; font-size: 12px; opacity: 0.6;">
        <a href="https://studioboazonline.com" style="color: #D5C4B7; text-decoration: none;">www.studioboazonline.com</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

  console.log('\n📧 Sending email...');
  
  try {
    const emailResult = await resend.emails.send({
      from: 'Studio Boaz <info@mail.studioboazonline.com>',
      to: [recipientEmail],
      subject: `🎁 קיבלת מתנה: ${breathingSeries.title}`,
      html: emailHtml
    });

    console.log('✅ Email sent successfully!');
    console.log('Result:', emailResult);
    
    console.log('\n📊 Summary:');
    console.log(`   - To: ${recipientEmail}`);
    console.log(`   - Series: ${breathingSeries.title}`);
    console.log(`   - Message: "${giftMessage}"`);
    console.log(`   - Status: ✅ Sent`);
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
}

main()
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
