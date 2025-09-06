import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { verifyAdminAccess } from "@/app/libs/adminAuth";

// GET - Fetch all video series for admin management
export async function GET(request: NextRequest) {
  try {
    const adminCheck = await verifyAdminAccess(request);
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: adminCheck.error }, { status: 401 });
    }

    const series = await prisma.videoSeries.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ],
      include: {
        _count: {
          select: { purchases: true }
        }
      }
    });

    return NextResponse.json(series);
  } catch (error) {
    console.error("Error fetching video series:", error);
    return NextResponse.json(
      { error: "Failed to fetch video series" },
      { status: 500 }
    );
  }
}

// POST - Create new video series
export async function POST(request: NextRequest) {
  try {
    const adminCheck = await verifyAdminAccess(request);
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: adminCheck.error }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      price,
      vimeoFolderId,
      vimeoFolderName,
      paypalProductId,
      thumbnailUrl,
      videoCount,
      isActive,
      isFeatured,
      order
    } = body;

    // Validate required fields
    if (!title || !description || !price || !vimeoFolderId || !paypalProductId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const series = await prisma.videoSeries.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        vimeoFolderId,
        vimeoFolderName: vimeoFolderName || title,
        paypalProductId,
        thumbnailUrl,
        videoCount: parseInt(videoCount) || 0,
        isActive: isActive !== false,
        isFeatured: isFeatured === true,
        order: parseInt(order) || 0
      }
    });

    return NextResponse.json(series);
  } catch (error) {
    console.error("Error creating video series:", error);
    return NextResponse.json(
      { error: "Failed to create video series" },
      { status: 500 }
    );
  }
}

// PUT - Update existing video series
export async function PUT(request: NextRequest) {
  try {
    const adminCheck = await verifyAdminAccess(request);
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: adminCheck.error }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Series ID is required" },
        { status: 400 }
      );
    }

    // Convert numeric fields
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.videoCount) updateData.videoCount = parseInt(updateData.videoCount);
    if (updateData.order) updateData.order = parseInt(updateData.order);

    const series = await prisma.videoSeries.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(series);
  } catch (error) {
    console.error("Error updating video series:", error);
    return NextResponse.json(
      { error: "Failed to update video series" },
      { status: 500 }
    );
  }
}

// DELETE - Delete video series (soft delete by setting isActive to false)
export async function DELETE(request: NextRequest) {
  try {
    const adminCheck = await verifyAdminAccess(request);
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: adminCheck.error }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Series ID is required" },
        { status: 400 }
      );
    }

    // Soft delete by setting isActive to false
    const series = await prisma.videoSeries.update({
      where: { id },
      data: { isActive: false }
    });

    return NextResponse.json({ message: "Series deleted successfully" });
  } catch (error) {
    console.error("Error deleting video series:", error);
    return NextResponse.json(
      { error: "Failed to delete video series" },
      { status: 500 }
    );
  }
}
