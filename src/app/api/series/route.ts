import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/app/libs/prismadb";

// GET - Fetch available video series for marketplace
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any) as any;
    
    // Get all active series
    const series = await prisma.videoSeries.findMany({
      where: { isActive: true },
      orderBy: [
        { isFeatured: 'desc' },
        { order: 'asc' },
        { createdAt: 'desc' }
      ],
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        thumbnailUrl: true,
        videoCount: true,
        isFeatured: true,
        vimeoFolderId: true,
        vimeoFolderName: true,
        paypalProductId: true
      }
    });

    // If user is logged in, check their subscription status and purchases
    let userPurchases: string[] = [];
    let hasActiveSubscription = false;

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
          purchases: {
            where: { status: "COMPLETED" },
            select: { seriesId: true }
          }
        }
      });

      if (user) {
        // Check if user has active subscription (gets free access to all series)
        hasActiveSubscription = !!(
          user.subscriptionId === "Admin" ||
          user.subscriptionId === "free" ||
          user.subscriptionId === "trial_30" ||
          (user.subscriptionId && user.subscriptionId.startsWith("I-") && user.paypalStatus === "ACTIVE")
        );

        // Get list of purchased series IDs
        userPurchases = user.purchases.map((p: any) => p.seriesId);
      }
    }

    // Add access information to each series
    const seriesWithAccess = series.map((s: any) => ({
      ...s,
      hasAccess: hasActiveSubscription || userPurchases.includes(s.id),
      accessType: hasActiveSubscription ? 'subscription' : 
                  userPurchases.includes(s.id) ? 'purchased' : 'none'
    }));

    return NextResponse.json({
      series: seriesWithAccess,
      userInfo: {
        hasActiveSubscription,
        purchasedSeriesCount: userPurchases.length
      }
    });

  } catch (error) {
    console.error("Error fetching video series:", error);
    return NextResponse.json(
      { error: "Failed to fetch video series" },
      { status: 500 }
    );
  }
}
