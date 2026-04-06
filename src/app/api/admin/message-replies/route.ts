export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions as authOptionsImport } from "../../auth/[...nextauth]/route.jsx";
import prisma from "@/app/libs/prismadb";

const authOptions = authOptionsImport as any;

// GET: Admin fetches all messages that have replies
export async function GET(request: NextRequest) {
  try {
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

    // Get messages that allow replies and have at least one reply
    const messagesWithReplies = await prisma.message.findMany({
      where: {
        allowReply: true,
        replies: { some: {} },
      },
      include: {
        replies: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: { select: { replies: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Count unread replies
    const unreadCount = await prisma.messageReply.count({
      where: { isRead: false },
    });

    return NextResponse.json({
      messages: messagesWithReplies,
      unreadCount,
    });
  } catch (error: any) {
    console.error("Error fetching replies:", error);
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}

// PATCH: Admin marks replies as read
export async function PATCH(request: NextRequest) {
  try {
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

    const { messageId } = await request.json();

    if (messageId) {
      // Mark all replies for a specific message as read
      await prisma.messageReply.updateMany({
        where: { messageId, isRead: false },
        data: { isRead: true },
      });
    } else {
      // Mark ALL replies as read
      await prisma.messageReply.updateMany({
        where: { isRead: false },
        data: { isRead: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error marking replies as read:", error);
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}
