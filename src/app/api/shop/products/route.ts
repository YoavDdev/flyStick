import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get("featured") === "true";

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(featured ? { isFeatured: true } : {}),
      },
      include: {
        variants: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
