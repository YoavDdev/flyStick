export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { verifyAdminAccess } from "@/app/libs/adminAuth";

// Convert any Vimeo URL to embeddable player/event URL
function normalizeVimeoUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  // Already an embed URL - keep as-is (player.vimeo.com OR contains /embed/)
  if (url.includes("player.vimeo.com") || url.includes("/embed")) return url;

  // Vimeo Event URL (without /embed) → append /embed
  const eventMatch = url.match(/vimeo\.com\/event\/(\d+)(\/[a-f0-9]+)?/);
  if (eventMatch) {
    const hash = eventMatch[2] || "";
    return `https://vimeo.com/event/${eventMatch[1]}/embed${hash}/interaction`;
  }

  // Regular Vimeo video URL → player.vimeo.com/video/VIDEO_ID
  const videoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (videoMatch) {
    const videoId = videoMatch[1];
    const hashMatch = url.match(/\/(\d+)\/([a-f0-9]+)/) || url.match(/[?&]h=([a-f0-9]+)/);
    const hash = hashMatch ? (hashMatch[2] || hashMatch[1]) : "";
    return `https://player.vimeo.com/video/${videoId}${hash ? `?h=${hash}` : ""}`;
  }

  return url;
}

// GET - Fetch all live events
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminAccess(request);
    if (!authResult.isAuthenticated || !authResult.isAdmin) {
      return NextResponse.json({ error: "אין הרשאות מתאימות" }, { status: 401 });
    }

    const events = await prisma.liveEvent.findMany({
      orderBy: { scheduledAt: "desc" },
    });

    return NextResponse.json({ success: true, events });
  } catch (error: any) {
    console.error("Error fetching live events:", error.message);
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}

// POST - Create a new live event
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdminAccess(request);
    if (!authResult.isAuthenticated || !authResult.isAdmin) {
      return NextResponse.json({ error: "אין הרשאות מתאימות" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, scheduledAt, estimatedDuration, vimeoEmbedUrl, vimeoEventUrl } = body;

    if (!title || !scheduledAt) {
      return NextResponse.json({ error: "חסרים שדות חובה (כותרת, תאריך)" }, { status: 400 });
    }

    const event = await prisma.liveEvent.create({
      data: {
        title,
        description: description || null,
        scheduledAt: new Date(scheduledAt),
        estimatedDuration: estimatedDuration || 60,
        vimeoEmbedUrl: normalizeVimeoUrl(vimeoEmbedUrl),
        vimeoEventUrl: vimeoEventUrl || null,
        status: "scheduled",
      },
    });

    return NextResponse.json({ success: true, event });
  } catch (error: any) {
    console.error("Error creating live event:", error.message);
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}

// PUT - Update a live event (edit details or change status)
export async function PUT(request: NextRequest) {
  try {
    const authResult = await verifyAdminAccess(request);
    if (!authResult.isAuthenticated || !authResult.isAdmin) {
      return NextResponse.json({ error: "אין הרשאות מתאימות" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "חסר מזהה אירוע" }, { status: 400 });
    }

    // Convert scheduledAt string to Date if present
    if (updateData.scheduledAt) {
      updateData.scheduledAt = new Date(updateData.scheduledAt);
    }
    // Normalize Vimeo embed URL if present
    if (updateData.vimeoEmbedUrl) {
      updateData.vimeoEmbedUrl = normalizeVimeoUrl(updateData.vimeoEmbedUrl);
    }

    const event = await prisma.liveEvent.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, event });
  } catch (error: any) {
    console.error("Error updating live event:", error.message);
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}

// DELETE - Delete a live event
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await verifyAdminAccess(request);
    if (!authResult.isAuthenticated || !authResult.isAdmin) {
      return NextResponse.json({ error: "אין הרשאות מתאימות" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "חסר מזהה אירוע" }, { status: 400 });
    }

    await prisma.liveEvent.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting live event:", error.message);
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}
