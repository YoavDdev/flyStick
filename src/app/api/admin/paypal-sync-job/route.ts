export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import axios from "axios";
import { verifyAdminAccess } from "@/app/libs/adminAuth";

// Background job for PayPal sync - no timeout limits
export const maxDuration = 300; // 5 minutes max

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 [PAYPAL_SYNC] Starting PayPal sync request");
    
    // Verify admin access
    const authResult = await verifyAdminAccess(request);
    
    if (!authResult.isAuthenticated || !authResult.isAdmin) {
      console.log("❌ [PAYPAL_SYNC] Admin access denied", { 
        isAuthenticated: authResult.isAuthenticated, 
        isAdmin: authResult.isAdmin 
      });
      return NextResponse.json(
        { error: "אין הרשאות מתאימות" },
        { status: 401 }
      );
    }

    console.log("✅ [PAYPAL_SYNC] Admin access verified");

    // Get PayPal credentials
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    
    console.log("🔑 [PAYPAL_SYNC] Checking PayPal credentials", {
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      clientIdLength: clientId?.length || 0
    });
    
    if (!clientId || !clientSecret) {
      console.error("❌ [PAYPAL_SYNC] PayPal credentials missing", {
        PAYPAL_CLIENT_ID: !!clientId,
        PAYPAL_CLIENT_SECRET: !!clientSecret
      });
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
      status: "started",
      message: "סנכרון PayPal התחיל ברקע. תוכל לבדוק את הסטטוס בעמוד הניהול."
    });
    
  } catch (error) {
    console.error("❌ [PAYPAL_SYNC_JOB_ERROR] Critical error in PayPal sync:", {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    return NextResponse.json(
      { error: "שגיאת שרת פנימית" },
      { status: 500 }
    );
  }
}

async function processPayPalSyncInBackground(auth: any, jobId: string) {
  // Import the status tracking functions
  const { updateSyncStatus } = await import('../paypal-sync-status/route');
  
  try {
    console.log(`🚀 Starting PayPal background sync job: ${jobId}`);
    
    // Mark job as running
    updateSyncStatus(jobId, 'running', { startTime: Date.now() });
    
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
    const syncDetails: any[] = [];
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
        
        // Add detailed sync information
        syncDetails.push({
          email: user.email,
          status: subscriptionData.status,
          paypalId: user.subscriptionId,
          cancellationDate: cancellationDate
        });
        
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
          
          // Add error details
          syncDetails.push({
            email: user.email,
            status: "SYNC_ERROR",
            paypalId: user.subscriptionId,
            cancellationDate: null,
            error: error.message
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
    
    // Return sync results with details
    return {
      successCount,
      errorCount,
      details: syncDetails
    };
    
  } catch (error) {
    console.error(`💥 PayPal sync job ${jobId} failed:`, error);
    return {
      successCount: 0,
      errorCount: 0,
      details: []
    };
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
