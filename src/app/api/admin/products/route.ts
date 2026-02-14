export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/app/libs/prismadb";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.subscriptionId !== "Admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    const products = await prisma.product.findMany({
      where: includeInactive ? {} : { isActive: true },
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

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.subscriptionId !== "Admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    
    const product = await prisma.product.create({
      data: {
        name: body.name,
        nameHebrew: body.nameHebrew,
        description: body.description,
        descriptionHebrew: body.descriptionHebrew,
        price: parseFloat(body.price),
        images: body.images || [],
        stock: parseInt(body.stock) || 0,
        sku: body.sku,
        weight: body.weight ? parseFloat(body.weight) : null,
        dimensions: body.dimensions,
        category: body.category,
        tags: body.tags || [],
        isActive: body.isActive !== undefined ? body.isActive : true,
        isFeatured: body.isFeatured || false,
        hasVariants: body.hasVariants || false,
        order: body.order || 0,
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription,
        variants: body.hasVariants && body.variants ? {
          create: body.variants.map((v: any, index: number) => ({
            name: v.name,
            description: v.description || null,
            image: v.image || null,
            stock: parseInt(v.stock) || 0,
            order: v.order !== undefined ? v.order : index,
          })),
        } : undefined,
      },
      include: {
        variants: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.subscriptionId !== "Admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { id, variants, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    // If hasVariants is being updated, handle variant changes
    if (updateData.hasVariants !== undefined) {
      // Delete all existing variants first
      await prisma.productVariant.deleteMany({
        where: { productId: id },
      });

      // Create new variants if hasVariants is true and variants are provided
      if (updateData.hasVariants && variants && variants.length > 0) {
        await prisma.productVariant.createMany({
          data: variants.map((v: any, index: number) => ({
            productId: id,
            name: v.name,
            description: v.description || null,
            image: v.image || null,
            stock: parseInt(v.stock) || 0,
            order: v.order !== undefined ? v.order : index,
          })),
        });
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: updateData.name,
        nameHebrew: updateData.nameHebrew,
        description: updateData.description,
        descriptionHebrew: updateData.descriptionHebrew,
        price: updateData.price ? parseFloat(updateData.price) : undefined,
        images: updateData.images,
        stock: updateData.stock !== undefined ? parseInt(updateData.stock) : undefined,
        sku: updateData.sku,
        weight: updateData.weight ? parseFloat(updateData.weight) : null,
        dimensions: updateData.dimensions,
        category: updateData.category,
        tags: updateData.tags,
        isActive: updateData.isActive,
        isFeatured: updateData.isFeatured,
        hasVariants: updateData.hasVariants,
        order: updateData.order !== undefined ? parseInt(updateData.order) : undefined,
        metaTitle: updateData.metaTitle,
        metaDescription: updateData.metaDescription,
      },
      include: {
        variants: {
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.subscriptionId !== "Admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
