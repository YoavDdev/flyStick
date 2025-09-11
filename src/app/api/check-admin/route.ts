import { NextResponse } from "next/server";
import prismadb from "@/app/libs/prismadb";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "אימייל נדרש" }, { status: 400 });
    }

    // Find user by email
    const user = await prismadb.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "משתמש לא נמצא" }, { status: 404 });
    }

    // Check if user exists and has Admin role
    const isAdmin = user.role === "Admin" || user.subscriptionId === "Admin";
    
    // Check if user has free or trial access
    const isFreeOrTrial = user.subscriptionId === "free" || user.subscriptionId === "trial_30";
    
    // Check if user is in grace period after cancellation
    let isInGracePeriod = false;
    if (user.cancellationDate) {
      // Check if user was subscribed for at least 4 days before cancellation
      let qualifiesForGracePeriod = false;
      
      if (user.subscriptionStartDate) {
        // Calculate days between subscription start and cancellation
        const subscriptionDuration = Math.floor(
          (new Date(user.cancellationDate).getTime() - new Date(user.subscriptionStartDate).getTime()) / (1000 * 60 * 60 * 24)
        );
        qualifiesForGracePeriod = subscriptionDuration >= 4;
      } else {
        // If no subscriptionStartDate, fall back to createdAt (for existing users)
        const subscriptionDuration = Math.floor(
          (new Date(user.cancellationDate).getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        );
        qualifiesForGracePeriod = subscriptionDuration >= 4;
      }
      
      // Only apply grace period if user qualifies AND is still within the grace period
      if (qualifiesForGracePeriod) {
        const gracePeriodEnd = new Date(user.cancellationDate);
        gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 30); // 30-day grace period
        isInGracePeriod = new Date() < gracePeriodEnd;
      }
    }
    
    // Users with free or trial access should have content access like subscribers
    // Also include users in the 30-day grace period after cancellation
    const hasContentAccess = isAdmin || isFreeOrTrial || (user.subscriptionId?.startsWith("I-") && user.paypalStatus === "ACTIVE") || isInGracePeriod;
    
    // Return both admin status and subscription type
    return NextResponse.json({ 
      isAdmin,
      subscriptionId: user.subscriptionId,
      isFreeOrTrial,
      hasContentAccess
    });
  } catch (error) {
    console.error("[CHECK_ADMIN_ERROR]", error);
    return NextResponse.json(
      { error: "שגיאת שרת פנימית" },
      { status: 500 }
    );
  }
}
