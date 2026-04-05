export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

// POST - Quick status toggle for admin from the live page
// Accepts: { action: "start" | "end", eventId?: string, email: string }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, eventId, email } = body;

    if (!email) {
      return NextResponse.json({ error: "חסר אימייל" }, { status: 400 });
    }

    // Verify admin access via email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || (user.role !== "Admin" && user.subscriptionId !== "Admin")) {
      return NextResponse.json({ error: "אין הרשאות מתאימות" }, { status: 401 });
    }

    if (action === "start") {
      // Find the next scheduled event (closest to now) or use specific eventId
      let event;
      if (eventId) {
        event = await prisma.liveEvent.findUnique({ where: { id: eventId } });
      } else {
        event = await prisma.liveEvent.findFirst({
          where: { status: "scheduled" },
          orderBy: { scheduledAt: "asc" },
        });
      }

      if (!event) {
        return NextResponse.json({ error: "לא נמצא אירוע מתוזמן" }, { status: 404 });
      }

      const updated = await prisma.liveEvent.update({
        where: { id: event.id },
        data: { status: "live" },
      });

      return NextResponse.json({ success: true, event: updated, message: "השידור התחיל!" });

    } else if (action === "end") {
      // Find the currently live event or use specific eventId
      let event;
      if (eventId) {
        event = await prisma.liveEvent.findUnique({ where: { id: eventId } });
      } else {
        event = await prisma.liveEvent.findFirst({
          where: { status: "live" },
          orderBy: { scheduledAt: "desc" },
        });
      }

      if (!event) {
        return NextResponse.json({ error: "לא נמצא שידור פעיל" }, { status: 404 });
      }

      const updated = await prisma.liveEvent.update({
        where: { id: event.id },
        data: { status: "ended" },
      });

      return NextResponse.json({ success: true, event: updated, message: "השידור הסתיים!" });

    } else {
      return NextResponse.json({ error: "פעולה לא תקינה" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Error in quick-control:", error.message);
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}
