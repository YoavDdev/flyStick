export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "../../../libs/prismadb";
import axios from "axios";

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const session = await getServerSession(authOptions) as any;
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!adminUser || adminUser.subscriptionId !== "Admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { userEmail } = await request.json();

    if (!userEmail) {
      return NextResponse.json({ error: "userEmail is required" }, { status: 400 });
    }

    // Find the target user
    const targetUser = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const subscriptionId = targetUser.subscriptionId;

    if (!subscriptionId || !subscriptionId.startsWith("I-")) {
      return NextResponse.json({ error: "User does not have an active PayPal subscription" }, { status: 400 });
    }

    // Cancel the subscription on PayPal
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: "PayPal credentials not configured" }, { status: 500 });
    }

    const auth = {
      username: clientId,
      password: clientSecret,
    };

    const cancellationResponse = await axios.post(
      `https://api.paypal.com/v1/billing/subscriptions/${subscriptionId}/cancel`,
      { reason: "Cancelled by admin" },
      { auth },
    );

    if (cancellationResponse.status !== 204) {
      return NextResponse.json({ error: "Failed to cancel PayPal subscription" }, { status: 500 });
    }

    // Update the database - same as what cancel-subscription route does
    await prisma.user.update({
      where: { email: userEmail },
      data: {
        subscriptionId: null,
        cancellationDate: new Date(),
      },
    });

    console.log(`Admin ${session.user.email} cancelled subscription for user ${userEmail} (PayPal: ${subscriptionId})`);

    return NextResponse.json({ 
      success: true, 
      message: `המנוי של ${targetUser.name || userEmail} בוטל בהצלחה ב-PayPal`,
      cancelledSubscriptionId: subscriptionId,
    });
  } catch (error: any) {
    console.error("Error cancelling subscription:", error);
    
    // Handle specific PayPal errors
    if (error.response?.status === 422) {
      return NextResponse.json({ 
        error: "המנוי כבר בוטל או לא פעיל ב-PayPal" 
      }, { status: 422 });
    }
    
    return NextResponse.json({ error: "שגיאת שרת פנימית" }, { status: 500 });
  }
}
