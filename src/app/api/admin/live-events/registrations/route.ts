export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { verifyAdminAccess } from "@/app/libs/adminAuth";

// GET - Get registrations for a specific event (admin only)
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminAccess(request);
    if (!authResult.isAuthenticated || !authResult.isAdmin) {
      return NextResponse.json({ error: "אין הרשאות מתאימות" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json({ error: "חסר מזהה אירוע" }, { status: 400 });
    }

    const registrations = await prisma.liveEventRegistration.findMany({
      where: { eventId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            subscriptionId: true,
          },
        },
      },
      orderBy: { registeredAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      registrations: registrations.map((r: any) => ({
        id: r.id,
        registeredAt: r.registeredAt,
        userName: r.user.name || "ללא שם",
        userEmail: r.user.email,
        isSubscriber: r.user.subscriptionId?.startsWith("I-") || r.user.subscriptionId === "Admin" || r.user.subscriptionId === "free" || r.user.subscriptionId === "trial_30",
      })),
      count: registrations.length,
    });
  } catch (error: any) {
    console.error("Error fetching registrations:", error.message);
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}
