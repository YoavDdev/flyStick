/**
 * Script to grant Yuval access to the breathing course
 * Run with: npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/grant-yuval-breathing-course.ts
 */

import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

async function main() {
  console.log('🔍 Starting process to grant Yuval access to breathing course...\n');

  // 1. Find Yuval's user account
  const yuval = await prisma.user.findUnique({
    where: { email: 'yuvaltidhar@gmail.com' }
  });

  if (!yuval) {
    console.error('❌ Yuval not found in database');
    process.exit(1);
  }

  console.log('✅ Found Yuval:', {
    id: yuval.id,
    email: yuval.email,
    name: yuval.name
  });

  // 2. Find the breathing course (search by title containing "נשימה")
  const breathingSeries = await prisma.videoSeries.findFirst({
    where: {
      title: {
        contains: 'נשימה',
        mode: 'insensitive'
      },
      isActive: true
    }
  });

  if (!breathingSeries) {
    console.error('❌ Breathing course not found in database');
    console.log('Available series:');
    const allSeries = await prisma.videoSeries.findMany({
      select: { id: true, title: true, isActive: true }
    });
    allSeries.forEach(s => console.log(`  - ${s.title} (${s.id}) [Active: ${s.isActive}]`));
    process.exit(1);
  }

  console.log('\n✅ Found breathing course:', {
    id: breathingSeries.id,
    title: breathingSeries.title,
    price: breathingSeries.price
  });

  // 3. Check if Yuval already has this course
  const existingPurchase = await prisma.purchase.findFirst({
    where: {
      userId: yuval.id,
      seriesId: breathingSeries.id,
      status: 'COMPLETED'
    }
  });

  if (existingPurchase) {
    console.log('⚠️  Yuval already has access to this course!');
    console.log('Existing purchase:', existingPurchase);
    process.exit(0);
  }

  // 4. Create the purchase record
  console.log('\n📝 Creating purchase record...');
  
  const purchase = await prisma.purchase.create({
    data: {
      userId: yuval.id,
      seriesId: breathingSeries.id,
      paypalOrderId: '113988556U453662L', // Original transaction ID
      paypalPayerId: 'manual-compensation',
      amount: breathingSeries.price || 0,
      currency: 'ILS',
      status: 'COMPLETED',
      isGift: true,
      giftSenderEmail: 'support@studioboazonline.com',
      giftSenderName: 'Studio Boaz - פיצוי',
      giftRecipientName: yuval.name || 'יובל',
      giftMessage: 'קיבלת גישה לקורס זה כפיצוי על בעיה טכנית שהתרחשה ברכישת מתנה. אנו מתנצלים על אי הנוחות.',
      giftClaimedAt: new Date()
    }
  });

  console.log('✅ Purchase created successfully:', {
    id: purchase.id,
    createdAt: purchase.createdAt
  });

  // 5. Send email to Yuval
  console.log('\n📧 Sending email to Yuval...');
  
  const emailHtml = `
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F7F3EB; margin: 0; padding: 20px; direction: rtl;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
        
        <div style="background: white; padding: 25px 20px; text-align: center; border-bottom: 3px solid #D5C4B7;">
          <div style="margin-bottom: 15px;">
            <img src="https://studioboazonline.com/apple-touch-icon.png" alt="Studio Boaz Online" style="height: 80px; width: auto; display: inline-block;" />
          </div>
          <div style="margin-top: 12px;">
            <a href="https://studioboazonline.com" style="color: #2D3142; text-decoration: none; font-size: 16px; font-weight: 600; display: block; margin-bottom: 6px;">www.studioboazonline.com</a>
            <p style="color: #B8A99C; font-size: 14px; margin: 0; font-weight: 500;">שיעורים, הרצאות וארועים</p>
          </div>
        </div>
        
        <div style="background: linear-gradient(135deg, #D5C4B7 0%, #B8A99C 100%); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.2); line-height: 1.4;">שלום ${yuval.name || 'יובל'} 👋</h1>
        </div>
        
        <div style="padding: 35px;">
          <p style="color: #2D3142; font-size: 18px; line-height: 1.8; margin-bottom: 20px;">
            ראשית, אנחנו מתנצלים על התקלה הטכנית שהתרחשה בעת רכישת המתנה עבורך.
          </p>
          
          <div style="background: #FFF3E0; border-right: 4px solid #D5C4B7; padding: 18px 22px; border-radius: 10px; margin: 25px 0;">
            <p style="color: #2D3142; font-size: 16px; line-height: 1.7; margin: 0;">
              <strong>מה קרה?</strong><br/>
              נשלחה לך מתנה עבור סדרה שכבר יש לך גישה אליה. המערכת אמורה הייתה למנוע זאת, אבל לצערנו התרחשה טעות טכנית.
            </p>
          </div>

          <div style="background: linear-gradient(to left, #E8F5E9, #C8E6C9); border-right: 4px solid #4CAF50; padding: 18px 22px; border-radius: 10px; margin: 25px 0;">
            <p style="color: #2D3142; font-size: 16px; line-height: 1.7; margin: 0 0 12px 0;">
              <strong>✨ הפתרון:</strong><br/>
              כפיצוי, קיבלת גישה מלאה לסדרה:
            </p>
            <p style="color: #1B5E20; font-size: 20px; font-weight: bold; margin: 8px 0; text-align: center;">
              "${breathingSeries.title}"
            </p>
          </div>
          
          <p style="color: #2D3142; font-size: 16px; line-height: 1.8; margin: 20px 0;">
            הסדרה כבר זמינה לך באתר וניתן להתחיל לצפות בה מיד.
          </p>

          <p style="color: #2D3142; font-size: 16px; line-height: 1.8; margin: 20px 0;">
            <strong>תיקנו את הבעיה!</strong> מעכשיו, המערכת תמנע מקרים כאלה ותודיע מראש אם מקבל/ת מתנה כבר רכשו את הסדרה.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://studioboazonline.com/series" style="display: inline-block; background: linear-gradient(135deg, #D5C4B7, #B8A99C); color: white; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 17px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">צפייה בסדרה עכשיו</a>
          </div>

          <p style="color: #5D5D5D; font-size: 14px; line-height: 1.7; margin: 25px 0 0 0; text-align: center;">
            שוב מתנצלים על אי הנוחות ומקווים שתהני מהסדרה! 🙏
          </p>
        </div>
        
        <div style="background: #2D3142; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0; font-size: 14px; opacity: 0.8;">Studio Boaz Online - בועז נחייסי</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const emailResult = await resend.emails.send({
    from: 'Studio Boaz <info@mail.studioboazonline.com>',
    to: ['yuvaltidhar@gmail.com'],
    subject: `גישה לסדרה "${breathingSeries.title}" - פיצוי על תקלה טכנית`,
    html: emailHtml
  });

  console.log('✅ Email sent successfully:', emailResult);
  
  console.log('\n🎉 All done! Yuval now has access to the breathing course.');
  console.log('\n📊 Summary:');
  console.log(`   - User: ${yuval.email}`);
  console.log(`   - Series: ${breathingSeries.title}`);
  console.log(`   - Purchase ID: ${purchase.id}`);
  console.log(`   - Email sent: ✅`);
}

main()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
