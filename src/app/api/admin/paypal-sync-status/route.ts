import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { verifyAdminAccess } from "@/app/libs/adminAuth";

// Simple in-memory storage for sync results (in production, use Redis or database)
const syncResults = new Map<string, {
  status: 'running' | 'completed' | 'failed';
  startTime: number;
  endTime?: number;
  successCount?: number;
  errorCount?: number;
  details?: any[];
  error?: string;
}>();

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminAccess(request);
    
    if (!authResult.isAuthenticated || !authResult.isAdmin) {
      return NextResponse.json(
        { error: "אין הרשאות מתאימות" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (jobId && syncResults.has(jobId)) {
      // Return specific job status
      return NextResponse.json(syncResults.get(jobId));
    }

    // Return general sync statistics
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

    return NextResponse.json({
      totalPayPalUsers,
      syncedToday,
      successfulSyncs,
      errorSyncs,
      lastSyncTime: recentSyncs.length > 0 ? 
        Math.max(...recentSyncs.map((u: any) => u.paypalLastSyncAt?.getTime() || 0)) : null
    });
    
  } catch (error) {
    console.error("Error getting sync status:", error);
    return NextResponse.json(
      { error: "שגיאה בקבלת סטטוס הסנכרון" },
      { status: 500 }
    );
  }
}

// Helper function to store sync results
export function storeSyncResult(jobId: string, result: any) {
  syncResults.set(jobId, result);
  
  // Clean up old results (keep only last 10)
  if (syncResults.size > 10) {
    const oldestKey = Array.from(syncResults.keys())[0];
    syncResults.delete(oldestKey);
  }
}

// Helper function to update sync status
export function updateSyncStatus(jobId: string, status: 'running' | 'completed' | 'failed', data?: any) {
  const existing = syncResults.get(jobId) || { status: 'running', startTime: Date.now() };
  
  syncResults.set(jobId, {
    ...existing,
    status,
    ...data,
    endTime: status !== 'running' ? Date.now() : existing.endTime
  });
}
