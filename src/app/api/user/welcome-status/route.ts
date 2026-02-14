export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
// Import and cast authOptions to any to avoid type errors
import { authOptions as authOptionsImport } from "../../auth/[...nextauth]/route.jsx";
import prisma from "../../../libs/prismadb";

// Cast to avoid TypeScript errors with session.strategy
const authOptions = authOptionsImport as any;

// Define session type to avoid TypeScript errors
interface SessionUser {
  user?: {
    email?: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as SessionUser;

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { hasSeenWelcomeMessage: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      hasSeenWelcomeMessage: user.hasSeenWelcomeMessage
    });
  } catch (error) {
    console.error("Error fetching welcome status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as SessionUser;

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Mark welcome message as seen
    await prisma.user.update({
      where: { id: user.id },
      data: { hasSeenWelcomeMessage: true }
    });

    console.log(`✅ Welcome popup dismissed by user: ${user.email}`);

    return NextResponse.json({
      success: true,
      message: "Welcome message marked as seen"
    });
  } catch (error) {
    console.error("Error marking welcome as seen:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
