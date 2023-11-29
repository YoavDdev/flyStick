// /pages/api/cancel-subscription.js
import { NextResponse } from "next/server";
import { SubscriptionCancelRequest } from "@paypal/checkout-server-sdk";

// Import the necessary PayPal SDK and initialize it with your credentials

export async function POST(request) {
  try {
    const body = await request.json();
    const { userEmail } = body;

    if (!userEmail) {
      console.log("Missing userEmail");
      return new NextResponse("Missing userEmail", { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: userEmail,
      },
      select: {
        // Include any other fields you need from the user
        subscriptionId: true,
      },
    });

    if (!user) {
      console.log("User not found");
      return new NextResponse("User not found", { status: 404 });
    }

    // Initialize the PayPal SDK with your credentials

    // Construct the request to cancel the subscription
    const cancelRequest = new SubscriptionCancelRequest(user.subscriptionId);

    // Call the PayPal API to cancel the subscription
    const cancelResponse = await paypalClient
      .subscriptions()
      .cancel(cancelRequest);

    if (cancelResponse.result.status === "CANCELLED") {
      // Subscription successfully canceled
      // You may want to update your database or perform other cleanup tasks

      return new NextResponse(JSON.stringify({ success: true }));
    } else {
      // Failed to cancel subscription
      console.log("Failed to cancel subscription:", cancelResponse.result);
      return new NextResponse("Failed to cancel subscription", { status: 500 });
    }
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
