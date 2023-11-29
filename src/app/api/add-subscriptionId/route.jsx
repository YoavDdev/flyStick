import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request) {
  const body = await request.json();
  const { orderId: orderId, email } = body;

  try {
    const user = await prisma.user.update({
      where: {
        email: email,
      },
      data: {
        subscriptionId: {
          set: orderId,
        },
      },
    });
    console.log(user);
    return new NextResponse({
      status: 200,
      body: {
        success: true,
        message: "Order ID saved successfully!",
        user: user,
      },
    });
  } catch (error) {
    console.error("Error canceling subscription:", error);
    console.error(error.stack); // Log the stack trace for detailed information
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
