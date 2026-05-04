import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/app/libs/prismadb";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Verify admin
    const user = await prisma.user.findUnique({
      where: { email: session?.user?.email || "" },
    });

    if (!user || user.subscriptionId !== "Admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const status = searchParams.get("status"); // "sent", "failed", "pending"
    const emailType = searchParams.get("emailType"); // "welcome", "reset_password", etc.

    // Build query
    const where: any = {};
    if (status) where.status = status;
    if (emailType) where.emailType = emailType;

    // Get email logs
    const logs = await prisma.emailLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    // Get statistics
    const stats = await prisma.emailLog.groupBy({
      by: ['status'],
      _count: true,
    });

    const statsByType = await prisma.emailLog.groupBy({
      by: ['emailType'],
      _count: true,
    });

    return NextResponse.json({
      success: true,
      logs,
      stats: {
        byStatus: stats,
        byType: statsByType,
        total: logs.length,
      },
    });
  } catch (error: any) {
    console.error("Error fetching email logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch email logs", details: error.message },
      { status: 500 }
    );
  }
}
