export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import axios from "axios";
import { verifyAdminAccess } from "@/app/libs/adminAuth";
import { rateLimit, rateLimitConfigs } from "@/app/libs/rateLimit";

// Increase the API route timeout to 60 seconds (Vercel Pro limit)
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting for PayPal operations
    const rateLimitResult = rateLimit(rateLimitConfigs.paypal)(request);
    if (rateLimitResult) {
      return rateLimitResult;
    }
    
    // Verify admin access using new standardized method
    const authResult = await verifyAdminAccess(request);
    
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: authResult.error || "אין הרשאות מתאימות" },
        { status: 401 }
      );
    }
    
    if (!authResult.isAdmin) {
      return NextResponse.json(
        { error: authResult.error || "אין הרשאות מנהל" },
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
    const BATCH_SIZE = 2; // Reduced batch size for better reliability
    
    // Get the page number from query parameters (for pagination)
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const perPage = 20; // Process 20 users at a time (10 batches of 2)
    const startIdx = (page - 1) * perPage;
    const endIdx = Math.min(startIdx + perPage, paypalUsers.length);
    const paginatedUsers = paypalUsers.slice(startIdx, endIdx);
    
    console.log(`Processing page ${page} (users ${startIdx + 1}-${endIdx} of ${paypalUsers.length})`);
    
    for (let i = 0; i < paginatedUsers.length; i += BATCH_SIZE) {
      const batch = paginatedUsers.slice(i, i + BATCH_SIZE);
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

    const hasMore = endIdx < paypalUsers.length;
    const nextPage = hasMore ? page + 1 : null;
    
    const result = {
      message: `PayPal sync completed for page ${page}. Success: ${successCount}, Errors: ${errorCount}`,
      totalUsers: paypalUsers.length,
      processedInThisBatch: paginatedUsers.length,
      successCount,
      errorCount,
      hasMore,
      nextPage,
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
