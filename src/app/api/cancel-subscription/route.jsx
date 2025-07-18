// cancel-subscription.js
import prisma from "../../libs/prismadb";
import { NextResponse } from "next/server";

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

    // In a real implementation, replace the following lines with the actual cancellation logic
    // For example, make a request to your payment provider's API to cancel the subscription

    // Simulating a successful cancellation
    console.log("Subscription canceled successfully");

    // Update the user's subscription status in the database
    // Set cancellationDate to track when the subscription was cancelled
    // This is used for both grace period calculation and recent cancellations stats
    await prisma.user.update({
      where: {
        email: userEmail,
      },
      data: {
        subscriptionId: null,
        cancellationDate: new Date(), // Set cancellation date to now
      },
    });

    return new NextResponse("Subscription canceled successfully", {
      status: 200,
    });
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
