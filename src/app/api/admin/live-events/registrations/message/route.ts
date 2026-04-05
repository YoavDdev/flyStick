export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { verifyAdminAccess } from "@/app/libs/adminAuth";

// POST - Send a message to all registrants of a specific event
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdminAccess(request);
    if (!authResult.isAuthenticated || !authResult.isAdmin) {
      return NextResponse.json({ error: "אין הרשאות מתאימות" }, { status: 401 });
    }

    const body = await request.json();
    const { eventId, title, content } = body;

    if (!eventId || !title || !content) {
      return NextResponse.json({ error: "חסרים שדות חובה" }, { status: 400 });
    }

    // Get all registrant userIds for this event
    const registrations = await prisma.liveEventRegistration.findMany({
      where: { eventId },
      select: { userId: true },
    });

    if (registrations.length === 0) {
      return NextResponse.json({ error: "אין נרשמים לאירוע זה" }, { status: 400 });
    }

    const targetUserIds = registrations.map((r: { userId: string }) => r.userId);

    // Create a targeted message visible only to these users
    await prisma.message.create({
      data: {
        title,
        content,
        targetUserIds,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      count: targetUserIds.length,
    });
  } catch (error: any) {
    console.error("Error sending message to registrants:", error.message);
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}
