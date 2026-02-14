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
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all active messages
    const allMessages = await prisma.message.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });

    // Get messages that user has already read with read timestamps
    const readMessages = await prisma.messageRead.findMany({
      where: { userId: user.id },
      select: { messageId: true, readAt: true },
    });

    const readMessageIds = new Set(readMessages.map((rm: { messageId: string }) => rm.messageId));
    
    // Filter out read messages that are older than 1 day
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const recentReadMessageIds = new Set(
      readMessages
        .filter((rm: { messageId: string; readAt: Date }) => new Date(rm.readAt) > oneDayAgo)
        .map((rm: { messageId: string }) => rm.messageId)
    );

    // Separate read and unread messages
    const unreadMessages = allMessages.filter((msg: { id: string }) => !readMessageIds.has(msg.id));
    const readMessagesData = allMessages.filter((msg: { id: string }) => recentReadMessageIds.has(msg.id));

    return NextResponse.json({
      unreadMessages,
      readMessages: readMessagesData,
      unreadCount: unreadMessages.length,
    });
  } catch (error) {
    console.error("Error fetching user messages:", error);
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

    const body = await request.json();
    const { messageId } = body;

    if (!messageId) {
      return NextResponse.json(
        { error: "Message ID is required" },
        { status: 400 }
      );
    }

    // Mark message as read (upsert to handle duplicates gracefully)
    await prisma.messageRead.upsert({
      where: {
        userId_messageId: {
          userId: user.id,
          messageId: messageId,
        },
      },
      update: {
        readAt: new Date(),
      },
      create: {
        userId: user.id,
        messageId: messageId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Message marked as read",
    });
  } catch (error) {
    console.error("Error marking message as read:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
