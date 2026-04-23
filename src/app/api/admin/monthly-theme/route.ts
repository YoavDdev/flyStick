export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { verifyAdminAccess } from "@/app/libs/adminAuth";

// GET - Get monthly theme for a specific month/year (or all)
export async function GET(request: NextRequest) {
  const adminCheck = await verifyAdminAccess(request);
  if (!adminCheck.isAdmin) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 401 });
  }

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

    // Return all themes
    const themes = await prisma.monthlyTheme.findMany({
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });
    return NextResponse.json({ success: true, themes });
  } catch (error: any) {
    console.error("Error fetching monthly theme:", error.message);
    return NextResponse.json({ error: "שגיאה בטעינת נושא חודשי" }, { status: 500 });
  }
}

// POST - Create or update monthly theme
export async function POST(request: NextRequest) {
  const adminCheck = await verifyAdminAccess(request);
  if (!adminCheck.isAdmin) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { month, year, title } = body;

    if (!month || !year || !title) {
      return NextResponse.json({ error: "חסרים שדות חובה: חודש, שנה וכותרת" }, { status: 400 });
    }

    const theme = await prisma.monthlyTheme.upsert({
      where: { month_year: { month: parseInt(month), year: parseInt(year) } },
      update: { title: title.trim() },
      create: { month: parseInt(month), year: parseInt(year), title: title.trim() },
    });

    return NextResponse.json({ success: true, theme });
  } catch (error: any) {
    console.error("Error saving monthly theme:", error.message);
    return NextResponse.json({ error: "שגיאה בשמירת נושא חודשי" }, { status: 500 });
  }
}

// DELETE - Remove monthly theme
export async function DELETE(request: NextRequest) {
  const adminCheck = await verifyAdminAccess(request);
  if (!adminCheck.isAdmin) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    if (!month || !year) {
      return NextResponse.json({ error: "חסרים חודש ושנה" }, { status: 400 });
    }

    await prisma.monthlyTheme.delete({
      where: { month_year: { month: parseInt(month), year: parseInt(year) } },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting monthly theme:", error.message);
    return NextResponse.json({ error: "שגיאה במחיקת נושא חודשי" }, { status: 500 });
  }
}
