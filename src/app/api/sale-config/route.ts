export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

// GET - Fetch current sale configuration (public - no auth needed)
export async function GET() {
  try {
    const saleConfig = await prisma.saleConfig.findFirst();

    if (!saleConfig || !saleConfig.isActive) {
      return NextResponse.json({
        isActive: false,
        saleName: null,
        badgeText: null,
        originalPrice: null,
        salePrice: null,
      });
    }

    return NextResponse.json({
      isActive: saleConfig.isActive,
      saleName: saleConfig.saleName,
      badgeText: saleConfig.badgeText,
      originalPrice: saleConfig.originalPrice,
      salePrice: saleConfig.salePrice,
    });
  } catch (error) {
    console.error("Error fetching sale config:", error);
    return NextResponse.json({
      isActive: false,
      saleName: null,
      badgeText: null,
      originalPrice: null,
      salePrice: null,
    });
  }
}
