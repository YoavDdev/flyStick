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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as SessionUser;

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.subscriptionId !== "Admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { title, content, link, linkText } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        title,
        content,
        link: link || null,
        linkText: linkText || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Message sent successfully to all users",
      messageId: message.id,
    });
  } catch (error) {
    console.error("Error sending admin message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
