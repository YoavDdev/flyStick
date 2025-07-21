import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import axios from "axios";

export async function POST(request: Request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "אין הרשאות מתאימות" },
        { status: 401 }
      );
    }

    // Extract the email from the token
    const email = authHeader.split(" ")[1];

    // Check if the user is an admin
    const adminUser = await prisma.user.findUnique({
      where: { email },
      select: { subscriptionId: true },
    });

    if (!adminUser || adminUser.subscriptionId !== "Admin") {
      return NextResponse.json(
        { error: "אין הרשאות מתאימות" },
        { status: 403 }
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

    // Get all users with PayPal subscriptions
    const paypalUsers = await prisma.user.findMany({
      where: {
        subscriptionId: {
          startsWith: "I-"
        }
      },
      select: {
        id: true,
        email: true,
        subscriptionId: true,
        paypalStatus: true,
        paypalLastSyncAt: true
      }
    });

    console.log(`Starting PayPal sync for ${paypalUsers.length} users`);

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Helper function to fetch PayPal subscription with retry logic
    const fetchPayPalSubscriptionWithRetry = async (subscriptionId: string, maxRetries = 2): Promise<any> => {
      let retries = 0;
      
      while (retries <= maxRetries) {
        try {
          const response = await axios.get(
            `https://api.paypal.com/v1/billing/subscriptions/${subscriptionId}`,
            { 
              auth,
              timeout: 10000 // 10 second timeout
            }
          );
          return response.data;
        } catch (error: any) {
          if (retries === maxRetries) {
            throw error;
          }
          
          // Retry on timeout, rate limit, or server errors
          if (error.code === 'ECONNABORTED' || error.message?.includes('timeout') || 
              error.response?.status === 429 || error.response?.status >= 500) {
            console.log(`Retry ${retries + 1} for subscription ${subscriptionId}`);
            retries++;
            await new Promise(resolve => setTimeout(resolve, 1000 * retries));
          } else {
            throw error;
          }
        }
      }
    };

    // Process users in smaller batches to avoid overwhelming PayPal API
    const BATCH_SIZE = 3;
    
    for (let i = 0; i < paypalUsers.length; i += BATCH_SIZE) {
      const batch = paypalUsers.slice(i, i + BATCH_SIZE);
      
      // Process batch in parallel
      await Promise.all(
        batch.map(async (user: typeof paypalUsers[0]) => {
          try {
            const subscriptionData = await fetchPayPalSubscriptionWithRetry(user.subscriptionId!);
            
            // Extract cancellation date if subscription is canceled
            let cancellationDate = null;
            if (subscriptionData.status === 'CANCELLED' || subscriptionData.status === 'EXPIRED') {
              cancellationDate = subscriptionData.status_update_time || 
                               (subscriptionData.billing_info?.last_payment?.time) || null;
            }

            // Update user with PayPal data
            await prisma.user.update({
              where: { id: user.id },
              data: {
                paypalStatus: subscriptionData.status,
                paypalId: user.subscriptionId,
                paypalCancellationDate: cancellationDate ? new Date(cancellationDate) : null,
                paypalLastSyncAt: new Date()
              }
            });

            successCount++;
            console.log(`✅ Synced PayPal data for user ${user.email}: ${subscriptionData.status}`);
            
          } catch (error: any) {
            errorCount++;
            const errorMsg = `Failed to sync PayPal data for user ${user.email}: ${error.message}`;
            console.error(errorMsg);
            errors.push(errorMsg);
            
            // Update user with error status and sync time
            try {
              await prisma.user.update({
                where: { id: user.id },
                data: {
                  paypalStatus: "SYNC_ERROR",
                  paypalId: user.subscriptionId,
                  paypalLastSyncAt: new Date()
                }
              });
            } catch (dbError) {
              console.error(`Failed to update error status for user ${user.email}:`, dbError);
            }
          }
        })
      );
      
      // Add delay between batches to prevent rate limiting
      if (i + BATCH_SIZE < paypalUsers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const result = {
      message: `PayPal sync completed. Success: ${successCount}, Errors: ${errorCount}`,
      totalUsers: paypalUsers.length,
      successCount,
      errorCount,
      errors: errors.slice(0, 10) // Limit error messages to prevent large responses
    };

    console.log("PayPal sync result:", result);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error("[PAYPAL_SYNC_ERROR]", error);
    return NextResponse.json(
      { error: "שגיאת שרת פנימית בסנכרון PayPal" },
      { status: 500 }
    );
  }
}
