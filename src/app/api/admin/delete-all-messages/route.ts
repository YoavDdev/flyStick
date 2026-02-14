export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(request: NextRequest) {
  try {
    // Get session to verify admin access
    const session = await getServerSession(authOptions as any) as any;
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized - No session" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.subscriptionId !== "Admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    // Delete all message reads first (due to foreign key constraints)
    const deletedReads = await prisma.messageRead.deleteMany({});
    
    // Delete all messages
    const deletedMessages = await prisma.message.deleteMany({});

    return NextResponse.json({
      success: true,
      message: "All messages deleted successfully",
      deletedMessages: deletedMessages.count,
      deletedReads: deletedReads.count,
    });

  } catch (error) {
    console.error("Error deleting all messages:", error);
    return NextResponse.json(
      { error: "Failed to delete messages" },
      { status: 500 }
    );
  }
}
