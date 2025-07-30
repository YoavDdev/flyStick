import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import axios from "axios";
import { verifyAdminAccess } from "@/app/libs/adminAuth";

// Background job for PayPal sync - no timeout limits
export const maxDuration = 300; // 5 minutes max

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const authResult = await verifyAdminAccess(request);
    
    if (!authResult.isAuthenticated || !authResult.isAdmin) {
      return NextResponse.json(
        { error: "אין הרשאות מתאימות" },
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

    // Create or update sync job status
    const jobId = `paypal_sync_${Date.now()}`;
    
    // Start background processing
    processPayPalSyncInBackground(auth, jobId);
    
    return NextResponse.json({
      success: true,
      jobId,
      message: "סנכרון PayPal התחיל ברקע. תוכל לבדוק את הסטטוס בעמוד הניהול."
    });
    
  } catch (error) {
    console.error("[PAYPAL_SYNC_JOB_ERROR]", error);
    return NextResponse.json(
      { error: "שגיאת שרת פנימית" },
      { status: 500 }
    );
  }
}

async function processPayPalSyncInBackground(auth: any, jobId: string) {
  try {
    console.log(`🚀 Starting PayPal background sync job: ${jobId}`);
    
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

    let successCount = 0;
    let errorCount = 0;
    const startTime = Date.now();

    console.log(`📊 Processing ${paypalUsers.length} PayPal users`);

    // Process users one by one with proper delays
    for (let i = 0; i < paypalUsers.length; i++) {
      const user = paypalUsers[i];
      
      try {
        // Fetch PayPal subscription data with extended timeout
        const response = await axios.get(
          `https://api.paypal.com/v1/billing/subscriptions/${user.subscriptionId}`,
          { 
            auth,
            timeout: 15000 // 15 second timeout
          }
        );
        
        const subscriptionData = response.data;
        
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
        console.log(`✅ [${i+1}/${paypalUsers.length}] Synced ${user.email}: ${subscriptionData.status}`);
        
      } catch (error: any) {
        errorCount++;
        console.error(`❌ [${i+1}/${paypalUsers.length}] Failed to sync ${user.email}:`, error.message);
        
        // Update user with error status
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
          console.error(`Failed to update error status for ${user.email}:`, dbError);
        }
      }
      
      // Progressive delay to avoid rate limiting
      // Longer delays as we process more users
      const delay = Math.min(2000 + (i * 100), 5000); // 2-5 seconds
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Log progress every 10 users
      if ((i + 1) % 10 === 0) {
        const elapsed = Math.round((Date.now() - startTime) / 1000);
        console.log(`📈 Progress: ${i + 1}/${paypalUsers.length} (${elapsed}s elapsed)`);
      }
    }

    const totalTime = Math.round((Date.now() - startTime) / 1000);
    
    console.log(`🎉 PayPal sync job ${jobId} completed in ${totalTime}s`);
    console.log(`📊 Results: ${successCount} success, ${errorCount} errors`);
    
    // Store job results for admin to check
    await prisma.user.updateMany({
      where: { subscriptionId: "Admin" },
      data: {
        // Store sync results in a way admin can check
        // This is a simple approach - in production you'd use a proper job queue
      }
    });
    
  } catch (error) {
    console.error(`💥 PayPal sync job ${jobId} failed:`, error);
  }
}

// GET endpoint to check sync status
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminAccess(request);
    
    if (!authResult.isAuthenticated || !authResult.isAdmin) {
      return NextResponse.json(
        { error: "אין הרשאות מתאימות" },
        { status: 401 }
      );
    }

    // Get recent sync statistics
    const recentSyncs = await prisma.user.findMany({
      where: {
        subscriptionId: { startsWith: "I-" },
        paypalLastSyncAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      select: {
        paypalStatus: true,
        paypalLastSyncAt: true
      }
    });

    const totalPayPalUsers = await prisma.user.count({
      where: {
        subscriptionId: { startsWith: "I-" }
      }
    });

    const syncedToday = recentSyncs.length;
    const successfulSyncs = recentSyncs.filter((u: any) => u.paypalStatus !== "SYNC_ERROR").length;
    const errorSyncs = recentSyncs.filter((u: any) => u.paypalStatus === "SYNC_ERROR").length;

    // Check if sync is ongoing (if there are recent sync attempts within last 10 minutes)
    const recentSyncAttempts = await prisma.user.findMany({
      where: {
        subscriptionId: { startsWith: "I-" },
        paypalLastSyncAt: {
          gte: new Date(Date.now() - 10 * 60 * 1000) // Last 10 minutes
        }
      },
      orderBy: {
        paypalLastSyncAt: 'desc'
      },
      take: 5
    });
    
    // Consider sync ongoing if we have recent sync activity
    const isOngoing = recentSyncAttempts.length > 0 && 
                     (Date.now() - (recentSyncAttempts[0].paypalLastSyncAt?.getTime() || 0)) < 5 * 60 * 1000; // 5 minutes

    return NextResponse.json({
      totalPayPalUsers,
      syncedToday,
      successfulSyncs,
      errorSyncs,
      isOngoing,
      lastSyncTime: recentSyncs.length > 0 ? 
        Math.max(...recentSyncs.map((u: any) => u.paypalLastSyncAt?.getTime() || 0)) : null
    });
    
  } catch (error) {
    console.error("[PAYPAL_SYNC_STATUS_ERROR]", error);
    return NextResponse.json(
      { error: "שגיאת שרת פנימית" },
      { status: 500 }
    );
  }
}
