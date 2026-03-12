export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

// GET - Fetch live events for calendar display (public)
export async function GET(request: NextRequest) {
  try {
    // Get all future events (scheduled + live)
    const futureEvents = await prisma.liveEvent.findMany({
      where: {
        status: { in: ["scheduled", "live"] },
      },
      orderBy: { scheduledAt: "asc" },
    });

    // Get ended/cancelled events from the past 90 days for calendar history
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const pastEvents = await prisma.liveEvent.findMany({
      where: {
        status: { in: ["ended", "cancelled"] },
        scheduledAt: { gte: ninetyDaysAgo },
      },
      orderBy: { scheduledAt: "desc" },
    });

    const allEvents = [...futureEvents, ...pastEvents].map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description || "",
      status: event.status,
      scheduledAt: event.scheduledAt.toISOString(),
      estimatedDuration: event.estimatedDuration,
      vimeoEmbedUrl: event.vimeoEmbedUrl || "",
    }));

    return NextResponse.json({ success: true, events: allEvents });
  } catch (error: any) {
    console.error("Error fetching live events:", error.message);
    return NextResponse.json(
      { success: false, error: "Failed to fetch live events" },
      { status: 500 }
    );
  }
}
