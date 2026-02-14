export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import { SUBSCRIPTION_PRICES, MONTHLY_SUMMARY_CONFIG } from '../../../config/subscription-pricing';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Get current date info for the report
    const now = new Date();
    const currentMonth = now.toLocaleDateString('he-IL', { 
      year: 'numeric', 
      month: 'long' 
    });
    
    // Calculate date range for this month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    // Get all active subscribers (paying customers)
    const activeSubscribers = await prisma.user.findMany({
      where: {
        OR: [
          {
            // PayPal subscribers with ACTIVE status
            subscriptionId: { startsWith: "I-" },
            paypalStatus: "ACTIVE"
          },
          {
            // Admin users (for completeness)
            subscriptionId: "Admin"
          }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        subscriptionId: true,
        paypalStatus: true,
        paypalId: true,
        subscriptionStartDate: true,
        createdAt: true,
        paypalCancellationDate: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get new subscribers this month
    const newSubscribersThisMonth = await prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              { subscriptionId: { startsWith: "I-" } },
              { subscriptionId: "Admin" }
            ]
          },
          {
            OR: [
              {
                subscriptionStartDate: {
                  gte: startOfMonth,
                  lte: endOfMonth
                }
              },
              {
                createdAt: {
                  gte: startOfMonth,
                  lte: endOfMonth
                }
              }
            ]
          }
        ]
      },
      select: {
        name: true,
        email: true,
        subscriptionId: true,
        paypalStatus: true,
        createdAt: true,
        subscriptionStartDate: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate revenue statistics
    const paypalActiveCount = activeSubscribers.filter(user => 
      user.subscriptionId?.startsWith("I-") && user.paypalStatus === "ACTIVE"
    ).length;
    
    const adminCount = activeSubscribers.filter(user => 
      user.subscriptionId === "Admin"
    ).length;

    // Calculate monthly revenue (only from paying subscribers)
    const monthlyRevenue = paypalActiveCount * SUBSCRIPTION_PRICES.MONTHLY_PAYPAL;
    
    // Calculate annual projection
    const annualProjection = monthlyRevenue * 12;

    // Prepare subscriber data for the table
    const subscriberTableData = activeSubscribers.map(user => ({
      name: user.name || 'לא צוין',
      email: user.email || '',
      subscriptionType: user.subscriptionId === "Admin" ? "מנהל" : 
                       user.subscriptionId?.startsWith("I-") ? "PayPal חודשי" : "אחר",
      status: user.subscriptionId === "Admin" ? "פעיל" :
              user.paypalStatus === "ACTIVE" ? "פעיל" :
              user.paypalStatus === "CANCELLED" ? "מבוטל" : "לא ידוע",
      monthlyRevenue: user.subscriptionId?.startsWith("I-") && user.paypalStatus === "ACTIVE" ? 
                     SUBSCRIPTION_PRICES.MONTHLY_PAYPAL : 0,
      joinDate: user.subscriptionStartDate || user.createdAt,
      subscriptionId: user.subscriptionId
    }));

    // Generate HTML email content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; max-width: 800px; margin: 0 auto; background: #F7F3EB; padding: 20px; border-radius: 12px;">
        <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #2D3142; margin-top: 0; font-size: 28px; text-align: center; border-bottom: 3px solid #D5C4B7; padding-bottom: 15px;">
            📊 דוח מנויים חודשי - ${currentMonth}
          </h1>
          
          <!-- Summary Statistics -->
          <div style="background: #F7F3EB; padding: 25px; border-radius: 8px; margin: 25px 0;">
            <h2 style="color: #D9713C; margin-top: 0; font-size: 22px; text-align: center;">📈 סיכום כללי</h2>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 20px;">
              <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; border: 2px solid #D5C4B7;">
                <h3 style="color: #2D3142; margin: 0; font-size: 24px;">${paypalActiveCount}</h3>
                <p style="color: #B8A99C; margin: 5px 0 0 0; font-weight: bold;">מנויים פעילים (משלמים)</p>
              </div>
              
              <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; border: 2px solid #D5C4B7;">
                <h3 style="color: #2D3142; margin: 0; font-size: 24px;">${newSubscribersThisMonth.length}</h3>
                <p style="color: #B8A99C; margin: 5px 0 0 0; font-weight: bold;">מנויים חדשים החודש</p>
              </div>
              
              <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; border: 2px solid #D9713C;">
                <h3 style="color: #D9713C; margin: 0; font-size: 24px;">₪${monthlyRevenue.toLocaleString()}</h3>
                <p style="color: #B8A99C; margin: 5px 0 0 0; font-weight: bold;">הכנסה חודשית</p>
              </div>
              
              <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; border: 2px solid #2D3142;">
                <h3 style="color: #2D3142; margin: 0; font-size: 24px;">₪${annualProjection.toLocaleString()}</h3>
                <p style="color: #B8A99C; margin: 5px 0 0 0; font-weight: bold;">תחזית שנתית</p>
              </div>
            </div>
          </div>

          <!-- New Subscribers This Month -->
          ${newSubscribersThisMonth.length > 0 ? `
          <div style="margin: 30px 0;">
            <h2 style="color: #D9713C; font-size: 20px; border-bottom: 2px solid #D5C4B7; padding-bottom: 10px;">
              🎉 מנויים חדשים החודש (${newSubscribersThisMonth.length})
            </h2>
            <div style="background: #F7F3EB; padding: 15px; border-radius: 8px; margin-top: 15px;">
              ${newSubscribersThisMonth.map(user => `
                <div style="background: white; padding: 15px; margin: 10px 0; border-radius: 6px; border-right: 4px solid #D9713C;">
                  <strong style="color: #2D3142;">${user.name || 'לא צוין'}</strong> - ${user.email}<br>
                  <small style="color: #B8A99C;">תאריך הצטרפות: ${new Date(user.createdAt).toLocaleDateString('he-IL')}</small>
                </div>
              `).join('')}
            </div>
          </div>
          ` : ''}

          <!-- All Active Subscribers Table -->
          <div style="margin: 30px 0;">
            <h2 style="color: #D9713C; font-size: 20px; border-bottom: 2px solid #D5C4B7; padding-bottom: 10px;">
              👥 כל המנויים הפעילים (${activeSubscribers.length})
            </h2>
            
            <div style="overflow-x: auto; margin-top: 15px;">
              <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <thead>
                  <tr style="background: #D5C4B7; color: #2D3142;">
                    <th style="padding: 15px; text-align: right; font-weight: bold;">שם</th>
                    <th style="padding: 15px; text-align: right; font-weight: bold;">אימייל</th>
                    <th style="padding: 15px; text-align: center; font-weight: bold;">סוג מנוי</th>
                    <th style="padding: 15px; text-align: center; font-weight: bold;">סטטוס</th>
                    <th style="padding: 15px; text-align: center; font-weight: bold;">הכנסה חודשית</th>
                    <th style="padding: 15px; text-align: center; font-weight: bold;">תאריך הצטרפות</th>
                  </tr>
                </thead>
                <tbody>
                  ${subscriberTableData.map((user, index) => `
                    <tr style="border-bottom: 1px solid #F0E9DF; ${index % 2 === 0 ? 'background: #F9F9F9;' : 'background: white;'}">
                      <td style="padding: 12px; color: #2D3142; font-weight: bold;">${user.name}</td>
                      <td style="padding: 12px; color: #3D3D3D;">${user.email}</td>
                      <td style="padding: 12px; text-align: center; color: #B8A99C;">${user.subscriptionType}</td>
                      <td style="padding: 12px; text-align: center;">
                        <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; 
                                     ${user.status === 'פעיל' ? 'background: #d4edda; color: #155724;' : 'background: #f8d7da; color: #721c24;'}">
                          ${user.status}
                        </span>
                      </td>
                      <td style="padding: 12px; text-align: center; color: #D9713C; font-weight: bold;">
                        ${user.monthlyRevenue > 0 ? `₪${user.monthlyRevenue}` : '-'}
                      </td>
                      <td style="padding: 12px; text-align: center; color: #B8A99C; font-size: 14px;">
                        ${new Date(user.joinDate).toLocaleDateString('he-IL')}
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Revenue Summary -->
          <div style="background: #2D3142; color: white; padding: 25px; border-radius: 8px; margin: 30px 0; text-align: center;">
            <h2 style="margin-top: 0; font-size: 22px;">💰 סיכום הכנסות</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 20px;">
              <div>
                <h3 style="margin: 0; font-size: 28px; color: #D5C4B7;">₪${monthlyRevenue.toLocaleString()}</h3>
                <p style="margin: 5px 0 0 0; opacity: 0.8;">הכנסה חודשית נוכחית</p>
              </div>
              <div>
                <h3 style="margin: 0; font-size: 28px; color: #D9713C;">₪${annualProjection.toLocaleString()}</h3>
                <p style="margin: 5px 0 0 0; opacity: 0.8;">תחזית הכנסה שנתית</p>
              </div>
            </div>
            <p style="margin-top: 20px; opacity: 0.7; font-size: 14px;">
              * חישוב מבוסס על ${paypalActiveCount} מנויים פעילים × ₪${SUBSCRIPTION_PRICES.MONTHLY_PAYPAL} לחודש
            </p>
          </div>

          <!-- Action Buttons -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin" 
               style="background: #D5C4B7; color: #2D3142; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin: 0 10px;">
              כניסה לפאנל ניהול
            </a>
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard" 
               style="background: #B8A99C; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin: 0 10px;">
              צפייה בסטודיו
            </a>
          </div>

          <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #D5C4B7;">
            <p style="color: #B8A99C; font-size: 14px; margin: 0;">
              דוח אוטומטי חודשי ממערכת Studio Boaz Online<br>
              נוצר ב-${now.toLocaleDateString('he-IL', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      </div>
    `;

    // Send the email
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: 'Studio Boaz Online <info@studioboazonline.com>',
      to: MONTHLY_SUMMARY_CONFIG.RECIPIENTS,
      subject: MONTHLY_SUMMARY_CONFIG.SUBJECT_TEMPLATE(currentMonth, paypalActiveCount, monthlyRevenue),
      html: emailContent
    });

    if (error) {
      console.error('❌ Error sending monthly summary email:', error);
      return NextResponse.json(
        { error: 'שגיאה בשליחת דוח חודשי' },
        { status: 500 }
      );
    }

    console.log('📊 Monthly summary email sent successfully');
    
    return NextResponse.json({
      success: true,
      message: 'דוח חודשי נשלח בהצלחה',
      data: {
        totalActiveSubscribers: activeSubscribers.length,
        payingSubscribers: paypalActiveCount,
        newSubscribersThisMonth: newSubscribersThisMonth.length,
        monthlyRevenue,
        annualProjection,
        reportMonth: currentMonth
      }
    });

  } catch (error) {
    console.error('Error generating monthly summary:', error);
    return NextResponse.json(
      { error: 'שגיאת שרת פנימית' },
      { status: 500 }
    );
  }
}
