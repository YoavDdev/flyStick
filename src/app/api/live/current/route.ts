export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

// GET - Get the current live stream or next upcoming from DB
export async function GET(request: NextRequest) {
  try {
    // Check for currently live event
    const liveEvent = await prisma.liveEvent.findFirst({
      where: { status: "live" },
      orderBy: { scheduledAt: "desc" },
    });

    if (liveEvent) {
      return NextResponse.json({
        success: true,
        streamState: "live",
        stream: {
          id: liveEvent.id,
          title: liveEvent.title,
          description: liveEvent.description || "",
          vimeoEmbedUrl: liveEvent.vimeoEmbedUrl || "",
          scheduledAt: liveEvent.scheduledAt.toISOString(),
          estimatedDuration: liveEvent.estimatedDuration,
        },
      });
    }

    // Check for next scheduled event (future events only)
    const now = new Date();
    const scheduledEvents = await prisma.liveEvent.findMany({
      where: {
        status: "scheduled",
        scheduledAt: { gte: now },
      },
      orderBy: { scheduledAt: "asc" },
      take: 5,
    });

    if (scheduledEvents.length > 0) {
      const nextEvent = scheduledEvents[0];
      return NextResponse.json({
        success: true,
        streamState: "scheduled",
        stream: {
          id: nextEvent.id,
          title: nextEvent.title,
          description: nextEvent.description || "",
          scheduledAt: nextEvent.scheduledAt.toISOString(),
          estimatedDuration: nextEvent.estimatedDuration,
        },
        upcomingCount: scheduledEvents.length,
      });
    }

    // No streams
    return NextResponse.json({
      success: true,
      streamState: "none",
      stream: null,
    });
  } catch (error: any) {
    console.error("Error fetching current live stream:", error.message);
    return NextResponse.json(
      { success: false, streamState: "none", stream: null },
      { status: 500 }
    );
  }
}
