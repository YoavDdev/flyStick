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

    const { subscriptionId, userEmail } = await request.json();

    if (!subscriptionId) {
      return NextResponse.json({ error: "subscriptionId is required" }, { status: 400 });
    }

    // Get PayPal credentials
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: "PayPal credentials not configured" }, { status: 500 });
    }

    const auth = {
      username: clientId,
      password: clientSecret,
    };

    // Query PayPal for subscription status
    const response = await axios.get(
      `https://api.paypal.com/v1/billing/subscriptions/${subscriptionId}`,
      { auth, timeout: 10000 }
    );

    const subscriptionData = response.data;

    // Extract relevant info
    const result = {
      status: subscriptionData.status,
      statusUpdateTime: subscriptionData.status_update_time,
      planId: subscriptionData.plan_id,
      startTime: subscriptionData.start_time,
      subscriberEmail: subscriptionData.subscriber?.email_address,
      subscriberName: subscriptionData.subscriber?.name?.given_name 
        ? `${subscriptionData.subscriber.name.given_name} ${subscriptionData.subscriber.name.surname || ''}`
        : null,
      lastPayment: subscriptionData.billing_info?.last_payment?.time,
      lastPaymentAmount: subscriptionData.billing_info?.last_payment?.amount?.value,
      nextBillingTime: subscriptionData.billing_info?.next_billing_time,
    };

    // Update DB with fresh PayPal data if userEmail is provided
    if (userEmail) {
      let cancellationDate = null;
      if (subscriptionData.status === 'CANCELLED' || subscriptionData.status === 'EXPIRED') {
        cancellationDate = subscriptionData.status_update_time || 
                           subscriptionData.billing_info?.last_payment?.time || null;
      }

      await prisma.user.update({
        where: { email: userEmail },
        data: {
          paypalStatus: subscriptionData.status,
          paypalId: subscriptionId,
          paypalCancellationDate: cancellationDate ? new Date(cancellationDate) : null,
          paypalLastSyncAt: new Date(),
        },
      });
    }

    return NextResponse.json({ success: true, paypal: result });
  } catch (error: any) {
    console.error("Error checking PayPal status:", error);

    if (error.response?.status === 404) {
      return NextResponse.json({ error: "מנוי לא נמצא ב-PayPal" }, { status: 404 });
    }

    return NextResponse.json({ error: "שגיאה בבדיקת סטטוס PayPal" }, { status: 500 });
  }
}
