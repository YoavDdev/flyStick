import { NextResponse } from "next/server";
import prismadb from "@/app/libs/prismadb";
import { addDays, isBefore } from "date-fns";

export async function GET(request: Request) {
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
    const adminUser = await prismadb.user.findUnique({
      where: { email },
      select: { subscriptionId: true },
    });

    if (!adminUser || adminUser.subscriptionId !== "Admin") {
      return NextResponse.json(
        { error: "אין הרשאות מתאימות" },
        { status: 403 }
      );
    }

    // Find all users with trial_30 subscription
    const trialUsers = await prismadb.user.findMany({
      where: {
        subscriptionId: "trial_30",
        trialStartDate: { not: null }
      },
    });

    const now = new Date();
    const expiredUsers = [];
    const updatedUsers = [];

    // Check each trial user
    for (const user of trialUsers) {
      if (user.trialStartDate) {
        // Calculate expiry date (30 days after trial start)
        const expiryDate = addDays(user.trialStartDate, 30);
        
        // If current date is after expiry date, update subscription to empty string ("ללא מנוי")
        if (isBefore(expiryDate, now)) {
          const updatedUser = await prismadb.user.update({
            where: { id: user.id },
            data: { 
              subscriptionId: "", // Empty string for "ללא מנוי"
              trialStartDate: null // Clear trial start date
            },
          });
          
          expiredUsers.push({
            id: user.id,
            email: user.email,
            name: user.name,
            trialStarted: user.trialStartDate,
            expiryDate
          });
          
          updatedUsers.push(updatedUser.id);
        }
      }
    }

    return NextResponse.json({
      message: `בדיקת תוקף מנויי ניסיון הושלמה. ${updatedUsers.length} מנויים פגי תוקף עודכנו.`,
      expiredUsers,
      updatedUsers
    });

  } catch (error) {
    console.error("[CHECK_TRIAL_EXPIRY_ERROR]", error);
    return NextResponse.json(
      { error: "שגיאת שרת פנימית" },
      { status: 500 }
    );
  }
}