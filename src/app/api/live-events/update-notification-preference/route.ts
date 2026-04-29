import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/app/libs/prismadb";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { registrationId, wantsEmailUpdates } = await req.json();

    if (!registrationId || typeof wantsEmailUpdates !== "boolean") {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    // Verify the registration belongs to the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const registration = await prisma.liveEventRegistration.findUnique({
      where: { id: registrationId },
    });

    if (!registration || registration.userId !== user.id) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    // Update preference
    await prisma.liveEventRegistration.update({
      where: { id: registrationId },
      data: { wantsEmailUpdates },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating notification preference:", error);
    return NextResponse.json(
      { error: "Failed to update preference" },
      { status: 500 }
    );
  }
}
