export const dynamic = 'force-dynamic';
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
      isComingSoon,
      order
    } = body;

    // Validate required fields based on series type
    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    // Additional validation for regular series (not coming soon)
    if (!isComingSoon && (!price || !vimeoFolderId || !paypalProductId)) {
      return NextResponse.json(
        { error: "Price, Vimeo Folder ID, and PayPal Product ID are required for regular series" },
        { status: 400 }
      );
    }

    const series = await prisma.videoSeries.create({
      data: {
        title,
        description,
        price: isComingSoon ? null : parseFloat(price),
        vimeoFolderId: isComingSoon ? null : vimeoFolderId,
        vimeoFolderName: isComingSoon ? null : (vimeoFolderName || title),
        paypalProductId: isComingSoon ? null : paypalProductId,
        thumbnailUrl,
        videoCount: parseInt(videoCount) || 0,
        isActive: isActive !== false,
        isFeatured: isFeatured === true,
        isComingSoon: isComingSoon === true,
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

    // Prepare data for update with proper type conversion
    const processedData: any = {};
    
    // Handle string fields
    if (updateData.title !== undefined) processedData.title = updateData.title;
    if (updateData.description !== undefined) processedData.description = updateData.description;
    if (updateData.vimeoFolderId !== undefined) processedData.vimeoFolderId = updateData.vimeoFolderId || null;
    if (updateData.vimeoFolderName !== undefined) processedData.vimeoFolderName = updateData.vimeoFolderName || null;
    if (updateData.paypalProductId !== undefined) processedData.paypalProductId = updateData.paypalProductId || null;
    if (updateData.thumbnailUrl !== undefined) processedData.thumbnailUrl = updateData.thumbnailUrl || null;
    
    // Handle numeric fields with proper validation
    if (updateData.price !== undefined) {
      processedData.price = updateData.price === "" || updateData.price === null ? null : parseFloat(updateData.price);
    }
    if (updateData.videoCount !== undefined) {
      processedData.videoCount = updateData.videoCount === "" ? 0 : parseInt(updateData.videoCount) || 0;
    }
    if (updateData.order !== undefined) {
      processedData.order = updateData.order === "" ? 0 : parseInt(updateData.order) || 0;
    }
    
    // Handle boolean fields
    if (updateData.isActive !== undefined) processedData.isActive = Boolean(updateData.isActive);
    if (updateData.isFeatured !== undefined) processedData.isFeatured = Boolean(updateData.isFeatured);
    if (updateData.isComingSoon !== undefined) processedData.isComingSoon = Boolean(updateData.isComingSoon);

    const series = await prisma.videoSeries.update({
      where: { id },
      data: processedData
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
