export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

// GET - Fetch the current or next upcoming live stream
export async function GET(request: NextRequest) {
  try {
    const now = new Date();

    // First, check if there's a currently live stream
    const liveStream = await prisma.liveStream.findFirst({
      where: {
        status: "live",
        isActive: true,
      },
      orderBy: { scheduledAt: "desc" },
    });

    if (liveStream) {
      return NextResponse.json({
        success: true,
        stream: liveStream,
        streamState: "live",
      });
    }

    // If no live stream, get the next scheduled one
    const nextStream = await prisma.liveStream.findFirst({
      where: {
        status: "scheduled",
        isActive: true,
        scheduledAt: { gte: now },
      },
      orderBy: { scheduledAt: "asc" },
    });

    if (nextStream) {
      return NextResponse.json({
        success: true,
        stream: nextStream,
        streamState: "scheduled",
      });
    }

    // No upcoming streams - get the most recent ended stream
    const lastStream = await prisma.liveStream.findFirst({
      where: {
        status: "ended",
        isActive: true,
      },
      orderBy: { scheduledAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      stream: lastStream || null,
      streamState: lastStream ? "ended" : "none",
    });
  } catch (error: any) {
    console.error("Error fetching live stream:", error.message);
    return NextResponse.json(
      { success: false, error: "Failed to fetch live stream data" },
      { status: 500 }
    );
  }
}
