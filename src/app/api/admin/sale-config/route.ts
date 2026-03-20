export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAccess } from "@/app/libs/adminAuth";
import prisma from "@/app/libs/prismadb";

// GET - Fetch current sale configuration (admin)
export async function GET(request: NextRequest) {
  try {
    const adminCheck = await verifyAdminAccess(request);
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: adminCheck.error }, { status: 401 });
    }

    // Get the single sale config document (or return defaults)
    const saleConfig = await prisma.saleConfig.findFirst();

    if (!saleConfig) {
      return NextResponse.json({
        isActive: false,
        saleName: "מבצע",
        badgeText: "",
        originalPrice: 350,
        salePrice: 99,
      });
    }

    return NextResponse.json(saleConfig);
  } catch (error) {
    console.error("Error fetching sale config:", error);
    return NextResponse.json(
      { error: "Failed to fetch sale config" },
      { status: 500 }
    );
  }
}

// PUT - Update sale configuration (admin)
export async function PUT(request: NextRequest) {
  try {
    const adminCheck = await verifyAdminAccess(request);
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: adminCheck.error }, { status: 401 });
    }

    const body = await request.json();
    const { isActive, saleName, badgeText, originalPrice, salePrice } = body;

    if (originalPrice === undefined || salePrice === undefined) {
      return NextResponse.json(
        { error: "originalPrice and salePrice are required" },
        { status: 400 }
      );
    }

    // Find existing config or create new one
    const existing = await prisma.saleConfig.findFirst();

    let saleConfig;
    if (existing) {
      saleConfig = await prisma.saleConfig.update({
        where: { id: existing.id },
        data: {
          isActive: Boolean(isActive),
          saleName: saleName || "מבצע",
          badgeText: badgeText || null,
          originalPrice: parseFloat(originalPrice),
          salePrice: parseFloat(salePrice),
        },
      });
    } else {
      saleConfig = await prisma.saleConfig.create({
        data: {
          isActive: Boolean(isActive),
          saleName: saleName || "מבצע",
          badgeText: badgeText || null,
          originalPrice: parseFloat(originalPrice),
          salePrice: parseFloat(salePrice),
        },
      });
    }

    return NextResponse.json(saleConfig);
  } catch (error) {
    console.error("Error updating sale config:", error);
    return NextResponse.json(
      { error: "Failed to update sale config" },
      { status: 500 }
    );
  }
}
