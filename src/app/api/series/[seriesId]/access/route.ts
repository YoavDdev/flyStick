import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route.jsx";
import prisma from "@/app/libs/prismadb";

export async function GET(
  request: NextRequest,
  { params }: { params: { seriesId: string } }
) {
  try {
    const session = await getServerSession(authOptions as any) as any;
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { hasAccess: false, reason: "נדרשת התחברות" },
        { status: 401 }
      );
    }

    const seriesId = params.seriesId;

    // Get the video series
    const series = await prisma.videoSeries.findUnique({
      where: { id: seriesId },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        videoCount: true,
        vimeoFolderId: true,
        vimeoFolderName: true,
        isActive: true
      }
    });

    if (!series || !series.isActive) {
      return NextResponse.json(
        { hasAccess: false, reason: "הסדרה לא נמצאה או לא פעילה" },
        { status: 404 }
      );
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        subscriptionId: true,
        purchases: {
          where: { 
            seriesId: seriesId,
            status: "COMPLETED" // Only completed purchases count
          },
          select: { id: true, status: true }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { hasAccess: false, reason: "משתמש לא נמצא" },
        { status: 404 }
      );
    }

    // Enhanced access control logic
    let hasAccess = false;
    let accessType = "";
    let reason = "";

    // 1. Admin access - full access to everything
    if (user.subscriptionId === "Admin") {
      hasAccess = true;
      accessType = "admin";
    }
    // 2. Active PayPal subscribers - free access to all series
    else if (user.subscriptionId && user.subscriptionId.startsWith("I-") && user.paypalStatus === "ACTIVE") {
      hasAccess = true;
      accessType = "subscription";
    }
    // 3. Free access users - free access to all series
    else if (user.subscriptionId === "free") {
      hasAccess = true;
      accessType = "subscription";
    }
    // 4. Trial users - free access to all series during trial
    else if (user.subscriptionId === "trial_30") {
      hasAccess = true;
      accessType = "subscription";
    }
    // 5. Any user with subscriptionId (including other subscription types) - free access
    else if (user.subscriptionId && user.subscriptionId !== "none" && user.subscriptionId !== null) {
      hasAccess = true;
      accessType = "subscription";
    }
    // 6. Purchased access - access only to purchased series
    else if (user.purchases.length > 0) {
      hasAccess = true;
      accessType = "purchased";
    }
    // 7. No access - must purchase or subscribe
    else {
      hasAccess = false;
      reason = "נדרש מנוי או רכישת הסדרה כדי לצפות בתכנים";
    }

    return NextResponse.json({
      hasAccess,
      accessType,
      reason,
      series
    });

  } catch (error) {
    console.error("Error checking series access:", error);
    console.error("Series ID:", params.seriesId);
    console.error("Error details:", error);
    return NextResponse.json(
      { hasAccess: false, reason: "שגיאה בבדיקת הגישה" },
      { status: 500 }
    );
  }
}
