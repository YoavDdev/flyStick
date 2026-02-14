export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch all categories with subcategories
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        subcategories: {
          where: { isActive: true },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST - Create new category
export async function POST(request: NextRequest) {
  try {
    const { key, hebrew, emoji, order } = await request.json();

    if (!key || !hebrew) {
      return NextResponse.json(
        { error: 'Key and Hebrew name are required' },
        { status: 400 }
      );
    }

    // Check if category with this key already exists
    const existingCategory = await prisma.category.findUnique({
      where: { key }
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category with this key already exists' },
        { status: 409 }
      );
    }

    const category = await prisma.category.create({
      data: {
        key,
        hebrew,
        emoji: emoji || null,
        order: order || 0
      },
      include: {
        subcategories: {
          where: { isActive: true },
          orderBy: { order: 'asc' }
        }
      }
    });

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}

// PUT - Update category
export async function PUT(request: NextRequest) {
  try {
    const { id, key, hebrew, emoji, order } = await request.json();

    if (!id || !key || !hebrew) {
      return NextResponse.json(
        { error: 'ID, key, and Hebrew name are required' },
        { status: 400 }
      );
    }

    // Check if another category with this key exists (excluding current one)
    const existingCategory = await prisma.category.findFirst({
      where: {
        key,
        id: { not: id }
      }
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Another category with this key already exists' },
        { status: 409 }
      );
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        key,
        hebrew,
        emoji: emoji || null,
        order: order || 0
      },
      include: {
        subcategories: {
          where: { isActive: true },
          orderBy: { order: 'asc' }
        }
      }
    });

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete category (mark as inactive)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    // Soft delete category and all its subcategories
    await prisma.category.update({
      where: { id },
      data: { isActive: false }
    });

    await prisma.subcategory.updateMany({
      where: { categoryId: id },
      data: { isActive: false }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
