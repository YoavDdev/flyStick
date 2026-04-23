export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

// GET - Public endpoint to fetch monthly themes for the live page
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    if (month && year) {
      const theme = await prisma.monthlyTheme.findUnique({
        where: { month_year: { month: parseInt(month), year: parseInt(year) } },
      });
      return NextResponse.json({ success: true, theme });
    }

    // Return themes for the current year and adjacent months
    const now = new Date();
    const currentYear = now.getFullYear();
    const themes = await prisma.monthlyTheme.findMany({
      where: {
        OR: [
          { year: currentYear },
          { year: currentYear - 1, month: { gte: now.getMonth() } },
          { year: currentYear + 1, month: { lte: now.getMonth() + 2 } },
        ],
      },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });

    return NextResponse.json({ success: true, themes });
  } catch (error: any) {
    console.error("Error fetching monthly themes:", error.message);
    return NextResponse.json({ success: true, themes: [] });
  }
}
