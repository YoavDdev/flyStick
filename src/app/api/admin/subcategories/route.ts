export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch subcategories for a specific category
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');

    if (!categoryId) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    const subcategories = await prisma.subcategory.findMany({
      where: {
        categoryId,
        isActive: true
      },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json({ success: true, subcategories });
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subcategories' },
      { status: 500 }
    );
  }
}

// POST - Create new subcategory
export async function POST(request: NextRequest) {
  try {
    const { categoryId, key, hebrew, order } = await request.json();

    if (!categoryId || !key || !hebrew) {
      return NextResponse.json(
        { error: 'Category ID, key, and Hebrew name are required' },
        { status: 400 }
      );
    }

    // Check if subcategory with this key already exists in this category
    const existingSubcategory = await prisma.subcategory.findFirst({
      where: {
        categoryId,
        key,
        isActive: true
      }
    });

    if (existingSubcategory) {
      return NextResponse.json(
        { error: 'Subcategory with this key already exists in this category' },
        { status: 409 }
      );
    }

    const subcategory = await prisma.subcategory.create({
      data: {
        categoryId,
        key,
        hebrew,
        order: order || 0
      }
    });

    return NextResponse.json({ subcategory });
  } catch (error) {
    console.error('Error creating subcategory:', error);
    return NextResponse.json(
      { error: 'Failed to create subcategory' },
      { status: 500 }
    );
  }
}

// PUT - Update subcategory
export async function PUT(request: NextRequest) {
  try {
    const { id, key, hebrew, order } = await request.json();

    if (!id || !key || !hebrew) {
      return NextResponse.json(
        { error: 'ID, key, and Hebrew name are required' },
        { status: 400 }
      );
    }

    // Get the current subcategory to check category
    const currentSubcategory = await prisma.subcategory.findUnique({
      where: { id }
    });

    if (!currentSubcategory) {
      return NextResponse.json(
        { error: 'Subcategory not found' },
        { status: 404 }
      );
    }

    // Check if another subcategory with this key exists in the same category (excluding current one)
    const existingSubcategory = await prisma.subcategory.findFirst({
      where: {
        categoryId: currentSubcategory.categoryId,
        key,
        id: { not: id },
        isActive: true
      }
    });

    if (existingSubcategory) {
      return NextResponse.json(
        { error: 'Another subcategory with this key already exists in this category' },
        { status: 409 }
      );
    }

    const subcategory = await prisma.subcategory.update({
      where: { id },
      data: {
        key,
        hebrew,
        order: order || 0
      }
    });

    return NextResponse.json({ subcategory });
  } catch (error) {
    console.error('Error updating subcategory:', error);
    return NextResponse.json(
      { error: 'Failed to update subcategory' },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete subcategory (mark as inactive)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Subcategory ID is required' },
        { status: 400 }
      );
    }

    await prisma.subcategory.update({
      where: { id },
      data: { isActive: false }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting subcategory:', error);
    return NextResponse.json(
      { error: 'Failed to delete subcategory' },
      { status: 500 }
    );
  }
}
