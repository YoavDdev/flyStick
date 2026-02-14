export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { verifyAdminAccess } from "@/app/libs/adminAuth";

export async function GET(request: NextRequest) {
  try {
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
    
    // Fetch all users with their watched videos count, folders, and cached PayPal data
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        subscriptionId: true,
        trialStartDate: true,
        subscriptionStartDate: true,
        cancellationDate: true,
        // Include cached PayPal fields
        paypalStatus: true,
        paypalId: true,
        paypalCancellationDate: true,
        paypalLastSyncAt: true,
        emailVerified: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            watchedVideos: true,
            favorites: true,
            accounts: true,
            purchases: true,
          }
        },
        purchases: {
          select: {
            id: true,
            amount: true,
            currency: true,
            status: true,
            purchaseDate: true,
            paypalOrderId: true,
            series: {
              select: {
                id: true,
                title: true,
                price: true
              }
            }
          },
          orderBy: {
            purchaseDate: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Return users with cached PayPal data - no real-time API calls needed!
    // PayPal data is now cached in the database and updated via background sync
    const usersWithPayPalData = users.map((user: typeof users[0]) => ({
      ...user,
      // Use cached PayPal data or fallback values
      paypalStatus: user.paypalStatus,
      paypalId: user.paypalId || user.subscriptionId,
      paypalCancellationDate: user.paypalCancellationDate,
      paypalLastSyncAt: user.paypalLastSyncAt
    }));
    
    return NextResponse.json(usersWithPayPalData);
    
  } catch (error) {
    console.error("[ADMIN_GET_ALL_USERS_ERROR]", error);
    return NextResponse.json(
      { error: "שגיאת שרת פנימית" },
      { status: 500 }
    );
  }
}
