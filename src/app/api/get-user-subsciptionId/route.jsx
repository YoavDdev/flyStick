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

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user data:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
