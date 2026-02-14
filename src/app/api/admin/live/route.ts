export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

// Helper to extract YouTube video ID from various URL formats
function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  
  // Handle various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/, // Just the ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// GET - Fetch all live streams (admin)
export async function GET(request: NextRequest) {
  try {
    const streams = await prisma.liveStream.findMany({
      where: { isActive: true },
      orderBy: { scheduledAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ success: true, streams });
  } catch (error: any) {
    console.error("Error fetching live streams:", error.message);
    return NextResponse.json(
      { success: false, error: "Failed to fetch live streams" },
      { status: 500 }
    );
  }
}

// POST - Create a new live stream event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      youtubeUrl,
      scheduledAt,
      thumbnailUrl,
      duration,
      isRecurring,
      recurringDay,
      recurringTime,
    } = body;

    if (!title || !scheduledAt) {
      return NextResponse.json(
        { success: false, error: "Title and scheduled date are required" },
        { status: 400 }
      );
    }

    const youtubeVideoId = youtubeUrl ? extractYouTubeId(youtubeUrl) : null;

    const stream = await prisma.liveStream.create({
      data: {
        title,
        description: description || null,
        youtubeUrl: youtubeUrl || null,
        youtubeVideoId,
        scheduledAt: new Date(scheduledAt),
        thumbnailUrl: thumbnailUrl || null,
        duration: duration ? parseInt(duration) : null,
        isRecurring: isRecurring ?? true,
        recurringDay: recurringDay || null,
        recurringTime: recurringTime || null,
        status: "scheduled",
      },
    });

    return NextResponse.json({ success: true, stream });
  } catch (error: any) {
    console.error("Error creating live stream:", error.message);
    return NextResponse.json(
      { success: false, error: "Failed to create live stream" },
      { status: 500 }
    );
  }
}

// PUT - Update a live stream (change status, add YouTube URL, etc.)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Stream ID is required" },
        { status: 400 }
      );
    }

    // If youtubeUrl is being updated, extract the video ID
    if (updateData.youtubeUrl) {
      updateData.youtubeVideoId = extractYouTubeId(updateData.youtubeUrl);
    }

    // If scheduledAt is being updated, convert to Date
    if (updateData.scheduledAt) {
      updateData.scheduledAt = new Date(updateData.scheduledAt);
    }

    // If duration is being updated, ensure it's an int
    if (updateData.duration) {
      updateData.duration = parseInt(updateData.duration);
    }

    const stream = await prisma.liveStream.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, stream });
  } catch (error: any) {
    console.error("Error updating live stream:", error.message);
    return NextResponse.json(
      { success: false, error: "Failed to update live stream" },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete (deactivate) a live stream
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Stream ID is required" },
        { status: 400 }
      );
    }

    await prisma.liveStream.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true, message: "Stream deactivated" });
  } catch (error: any) {
    console.error("Error deleting live stream:", error.message);
    return NextResponse.json(
      { success: false, error: "Failed to delete live stream" },
      { status: 500 }
    );
  }
}
