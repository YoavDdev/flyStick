import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/app/libs/prismadb";

// POST - Process series purchase after PayPal payment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any) as any;
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      seriesId,
      paypalOrderId,
      paypalPayerId,
      amount,
      currency = "ILS"
    } = body;

    // Validate required fields
    if (!seriesId || !paypalOrderId || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user already has an active subscription (subscribers get free access)
    if (user.subscriptionId && user.subscriptionId !== "free" && user.subscriptionId !== "trial") {
      return NextResponse.json(
        { error: "Active subscribers have free access to all series" },
        { status: 400 }
      );
    }

    // Verify the series exists and is active
    const series = await prisma.videoSeries.findUnique({
      where: { id: seriesId }
    });

    if (!series || !series.isActive) {
      return NextResponse.json(
        { error: "Series not found or not available" },
        { status: 404 }
      );
    }

    // Check if user already purchased this series
    const existingPurchase = await prisma.purchase.findUnique({
      where: {
        userId_seriesId: {
          userId: user.id,
          seriesId: seriesId
        }
      }
    });

    if (existingPurchase) {
      return NextResponse.json(
        { error: "Series already purchased" },
        { status: 400 }
      );
    }

    // Create the purchase record
    const purchase = await prisma.purchase.create({
      data: {
        userId: user.id,
        seriesId: seriesId,
        paypalOrderId,
        paypalPayerId,
        amount: parseFloat(amount),
        currency,
        status: "COMPLETED"
      },
      include: {
        series: true
      }
    });

    return NextResponse.json({
      message: "Purchase completed successfully",
      purchase: {
        id: purchase.id,
        seriesTitle: purchase.series.title,
        amount: purchase.amount,
        currency: purchase.currency,
        purchaseDate: purchase.purchaseDate
      }
    });

  } catch (error) {
    console.error("Error processing purchase:", error);
    return NextResponse.json(
      { error: "Failed to process purchase" },
      { status: 500 }
    );
  }
}

// GET - Get user's purchases
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any) as any;
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const purchases = await prisma.purchase.findMany({
      where: { userId: user.id },
      include: {
        series: {
          select: {
            id: true,
            title: true,
            description: true,
            thumbnailUrl: true,
            videoCount: true,
            vimeoFolderId: true,
            vimeoFolderName: true
          }
        }
      },
      orderBy: { purchaseDate: 'desc' }
    });

    return NextResponse.json(purchases);

  } catch (error) {
    console.error("Error fetching purchases:", error);
    return NextResponse.json(
      { error: "Failed to fetch purchases" },
      { status: 500 }
    );
  }
}
