export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

// GET - Get my registrations (for the logged-in user)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "חסר אימייל" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "משתמש לא נמצא" }, { status: 404 });
    }

    const registrations = await prisma.liveEventRegistration.findMany({
      where: { userId: user.id },
      select: { eventId: true },
    });

    return NextResponse.json({
      success: true,
      registeredEventIds: registrations.map((r: { eventId: string }) => r.eventId),
    });
  } catch (error: any) {
    console.error("Error fetching registrations:", error.message);
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}

// POST - Register for a live event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, email } = body;

    if (!eventId || !email) {
      return NextResponse.json({ error: "חסרים שדות חובה" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "משתמש לא נמצא" }, { status: 404 });
    }

    // Verify the event exists and is scheduled
    const event = await prisma.liveEvent.findUnique({ where: { id: eventId } });
    if (!event) {
      return NextResponse.json({ error: "אירוע לא נמצא" }, { status: 404 });
    }
    if (event.status !== "scheduled") {
      return NextResponse.json({ error: "ניתן להירשם רק לאירועים מתוזמנים" }, { status: 400 });
    }

    // Create registration (upsert to avoid duplicates)
    const registration = await prisma.liveEventRegistration.upsert({
      where: {
        eventId_userId: { eventId, userId: user.id },
      },
      update: {},
      create: {
        eventId,
        userId: user.id,
      },
    });

    // Send confirmation email (don't wait for it, run in background)
    console.log("📧 Attempting to send registration email to:", user.email);
    fetch(`${process.env.NEXTAUTH_URL}/api/live-events/send-registration-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId, registrationId: registration.id }),
    })
      .then((res) => {
        if (res.ok) {
          console.log("✅ Registration email sent successfully to:", user.email);
        } else {
          console.error("❌ Failed to send registration email. Status:", res.status);
        }
      })
      .catch((err) => console.error("❌ Error sending registration email:", err));

    // Get updated count
    const count = await prisma.liveEventRegistration.count({ where: { eventId } });

    return NextResponse.json({ success: true, count });
  } catch (error: any) {
    console.error("Error registering for event:", error.message);
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}

// DELETE - Unregister from a live event
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const email = searchParams.get("email");

    if (!eventId || !email) {
      return NextResponse.json({ error: "חסרים שדות חובה" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "משתמש לא נמצא" }, { status: 404 });
    }

    await prisma.liveEventRegistration.deleteMany({
      where: { eventId, userId: user.id },
    });

    // Get updated count
    const count = await prisma.liveEventRegistration.count({ where: { eventId } });

    return NextResponse.json({ success: true, count });
  } catch (error: any) {
    console.error("Error unregistering from event:", error.message);
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}
