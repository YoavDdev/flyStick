import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

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
