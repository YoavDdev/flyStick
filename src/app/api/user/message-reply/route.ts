export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions as authOptionsImport } from "../../auth/[...nextauth]/route.jsx";
import prisma from "@/app/libs/prismadb";

const authOptions = authOptionsImport as any;

// POST: User submits a reply to a message
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any;
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { messageId, content } = await request.json();

    if (!messageId || !content?.trim()) {
      return NextResponse.json({ error: "messageId and content are required" }, { status: 400 });
    }

    // Verify message exists and allows replies
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    if (!message.allowReply) {
      return NextResponse.json({ error: "This message does not allow replies" }, { status: 400 });
    }

    // Check if user already replied
    const existingReply = await prisma.messageReply.findUnique({
      where: { userId_messageId: { userId: user.id, messageId } },
    });

    if (existingReply) {
      // Update existing reply
      const updated = await prisma.messageReply.update({
        where: { id: existingReply.id },
        data: { content: content.trim(), isRead: false },
      });
      return NextResponse.json({ success: true, reply: updated, updated: true });
    }

    // Create new reply
    const reply = await prisma.messageReply.create({
      data: {
        messageId,
        userId: user.id,
        content: content.trim(),
      },
    });

    return NextResponse.json({ success: true, reply, updated: false });
  } catch (error: any) {
    console.error("Error submitting reply:", error);
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}
