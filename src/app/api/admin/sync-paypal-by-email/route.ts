export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import axios from "axios";
import { verifyAdminAccess } from "@/app/libs/adminAuth";

// Increase the API route timeout to 60 seconds
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const authResult = await verifyAdminAccess(request);
    
    if (!authResult.isAuthenticated || !authResult.isAdmin) {
      return NextResponse.json(
        { error: authResult.error || "אין הרשאות מנהל" },
        { status: 401 }
      );
    }

    // Get PayPal credentials
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: "PayPal credentials not configured" },
        { status: 500 }
      );
    }

    const auth = {
      username: clientId,
      password: clientSecret,
    };

    console.log('🔍 Starting email-based PayPal sync...');

    // Step 1: Fetch list of all subscription IDs from PayPal
    let allSubscriptionIds: string[] = [];
    let nextPage = 1;
    const PAGE_SIZE = 20;
    
    try {
      while (nextPage) {
        console.log(`📡 Fetching PayPal subscription IDs page ${nextPage}...`);
        
        const response = await axios.get(
          `https://api.paypal.com/v1/billing/subscriptions`,
          { 
            auth,
            params: {
              page: nextPage,
              page_size: PAGE_SIZE,
            },
            timeout: 15000
          }
        );

        const subscriptions = response.data.subscriptions || [];
        const ids = subscriptions.map((sub: any) => sub.id).filter((id: string) => id);
        allSubscriptionIds.push(...ids);
        
        console.log(`✅ Found ${ids.length} subscription IDs on page ${nextPage}`);
        
        const links = response.data.links || [];
        const nextLink = links.find((link: any) => link.rel === 'next');
        
        if (nextLink) {
          nextPage++;
        } else {
          nextPage = 0;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error: any) {
      console.error('❌ Error fetching PayPal subscription list:', error.message);
      return NextResponse.json(
        { error: `שגיאה בקבלת רשימת מנויים מ-PayPal: ${error.message}` },
        { status: 500 }
      );
    }

    console.log(`📊 Total subscription IDs found: ${allSubscriptionIds.length}`);

    // Step 2: Fetch full details (including email) for each subscription
    let allPayPalSubscriptions: any[] = [];
    let fetchedCount = 0;
    
    console.log('📥 Fetching full details for each subscription (this may take a few minutes)...');
    
    for (const subscriptionId of allSubscriptionIds) {
      try {
        const response = await axios.get(
          `https://api.paypal.com/v1/billing/subscriptions/${subscriptionId}`,
          { 
            auth,
            timeout: 10000
          }
        );

        allPayPalSubscriptions.push(response.data);
        fetchedCount++;
        
        if (fetchedCount % 10 === 0) {
          console.log(`✅ Fetched ${fetchedCount}/${allSubscriptionIds.length} subscription details...`);
        }
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error: any) {
        console.error(`⚠️ Error fetching details for subscription ${subscriptionId}: ${error.message}`);
      }
    }

    console.log(`📊 Successfully fetched ${allPayPalSubscriptions.length} PayPal subscriptions with full details`);

    // Get all users from database
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        subscriptionId: true,
        paypalStatus: true,
        paypalId: true,
      }
    });

    console.log(`📊 Total users in database: ${allUsers.length}`);

    // Match PayPal subscriptions to users by email
    let matchedCount = 0;
    let updatedCount = 0;
    let alreadyLinkedCount = 0;
    let notFoundCount = 0;
    const errors: string[] = [];

    for (const subscription of allPayPalSubscriptions) {
      try {
        const subscriberEmail = subscription.subscriber?.email_address;
        const subscriptionId = subscription.id;
        const status = subscription.status;

        if (!subscriberEmail) {
          console.log(`⚠️ Subscription ${subscriptionId} has no email, skipping...`);
          continue;
        }

        // Find user by email
        const user = allUsers.find((u: typeof allUsers[0]) => u.email?.toLowerCase() === subscriberEmail.toLowerCase());

        if (!user) {
          notFoundCount++;
          console.log(`❌ No user found for PayPal email: ${subscriberEmail}`);
          continue;
        }

        matchedCount++;

        // Check if user already has this subscription linked
        if (user.subscriptionId === subscriptionId) {
          alreadyLinkedCount++;
          console.log(`✓ User ${user.email} already linked to subscription ${subscriptionId}`);
          
          // Always update the status and other fields
          const cancellationDate = (status === 'CANCELLED' || status === 'EXPIRED') 
            ? subscription.status_update_time || subscription.billing_info?.last_payment?.time 
            : null;

          await prisma.user.update({
            where: { id: user.id },
            data: {
              paypalStatus: status,
              paypalId: subscriptionId,
              paypalCancellationDate: cancellationDate ? new Date(cancellationDate) : null,
              paypalLastSyncAt: new Date()
            }
          });
          console.log(`✅ Updated status for ${user.email}: ${status}`);
          continue;
        }

        // Update user with PayPal subscription
        const cancellationDate = (status === 'CANCELLED' || status === 'EXPIRED') 
          ? subscription.status_update_time || subscription.billing_info?.last_payment?.time 
          : null;

        await prisma.user.update({
          where: { id: user.id },
          data: {
            subscriptionId: subscriptionId,
            paypalId: subscriptionId,
            paypalStatus: status,
            paypalCancellationDate: cancellationDate ? new Date(cancellationDate) : null,
            paypalLastSyncAt: new Date(),
            // Set subscription start date if not already set
            ...((!user.subscriptionId || !user.subscriptionId.startsWith('I-')) && {
              subscriptionStartDate: subscription.start_time ? new Date(subscription.start_time) : new Date()
            })
          }
        });

        updatedCount++;
        console.log(`✅ Updated user ${user.email} with subscription ${subscriptionId} (${status})`);

      } catch (error: any) {
        const errorMsg = `Failed to process subscription ${subscription.id}: ${error.message}`;
        console.error(`❌ ${errorMsg}`);
        errors.push(errorMsg);
      }
    }

    // Find active subscriptions that are not in database
    const activeNotFound: any[] = [];
    for (const subscription of allPayPalSubscriptions) {
      const subscriberEmail = subscription.subscriber?.email_address;
      const status = subscription.status;
      
      if (status === 'ACTIVE' && subscriberEmail) {
        const user = allUsers.find((u: typeof allUsers[0]) => u.email?.toLowerCase() === subscriberEmail.toLowerCase());
        if (!user) {
          activeNotFound.push({
            email: subscriberEmail,
            subscriptionId: subscription.id,
            status: status,
            startDate: subscription.start_time
          });
        }
      }
    }

    const result = {
      success: true,
      message: `סנכרון מנויים PayPal הושלם בהצלחה`,
      stats: {
        totalPayPalSubscriptions: allPayPalSubscriptions.length,
        totalUsers: allUsers.length,
        matched: matchedCount,
        updated: updatedCount,
        alreadyLinked: alreadyLinkedCount,
        notFound: notFoundCount,
        activeNotFound: activeNotFound.length,
        errors: errors.length
      },
      activeNotFoundList: activeNotFound,
      errors: errors.slice(0, 10) // Limit error messages
    };

    console.log('📊 Sync results:', result);
    console.log('🔍 Active subscriptions not in database:', activeNotFound);

    return NextResponse.json(result);
    
  } catch (error) {
    console.error("[PAYPAL_EMAIL_SYNC_ERROR]", error);
    return NextResponse.json(
      { error: "שגיאת שרת פנימית בסנכרון PayPal" },
      { status: 500 }
    );
  }
}
