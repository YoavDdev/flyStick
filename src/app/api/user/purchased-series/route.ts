export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/app/libs/prismadb";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any) as any;
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "נדרשת התחברות" },
        { status: 401 }
      );
    }

    // Get user with their purchases
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        purchases: {
          where: { status: "COMPLETED" },
          include: {
            series: {
              select: {
                id: true,
                title: true,
                description: true,
                thumbnailUrl: true,
                videoCount: true,
                price: true,
                vimeoFolderId: true,
                vimeoFolderName: true,
                isActive: true
              }
            }
          },
          orderBy: { purchaseDate: 'desc' }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "משתמש לא נמצא" },
        { status: 404 }
      );
    }

    // Extract series data from purchases
    const purchasedSeries = user.purchases
      .filter((purchase: any) => purchase.series && purchase.series.isActive)
      .map((purchase: any) => ({
        ...purchase.series,
        purchaseDate: purchase.purchaseDate,
        purchaseAmount: purchase.amount
      }));

    return NextResponse.json({
      purchasedSeries,
      totalPurchases: purchasedSeries.length
    });

  } catch (error) {
    console.error("Error fetching purchased series:", error);
    return NextResponse.json(
      { error: "שגיאה בטעינת הסדרות שנרכשו" },
      { status: 500 }
    );
  }
}
