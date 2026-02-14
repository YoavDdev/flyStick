import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

// GET - Fetch AI settings (public - ChatBot needs this)
export async function GET() {
  try {
    const setting = await prisma.siteSettings.findUnique({
      where: { key: "ai_chat_enabled" },
    });

    return NextResponse.json({
      success: true,
      enabled: setting ? setting.value === "true" : true, // Default: enabled
    });
  } catch (error: any) {
    console.error("Error fetching AI settings:", error.message);
    return NextResponse.json({ success: true, enabled: true }); // Default on error
  }
}

// PUT - Update AI settings (admin only)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { enabled } = body;

    if (typeof enabled !== "boolean") {
      return NextResponse.json(
        { success: false, error: "enabled must be a boolean" },
        { status: 400 }
      );
    }

    await prisma.siteSettings.upsert({
      where: { key: "ai_chat_enabled" },
      update: { value: String(enabled) },
      create: { key: "ai_chat_enabled", value: String(enabled) },
    });

    return NextResponse.json({ success: true, enabled });
  } catch (error: any) {
    console.error("Error updating AI settings:", error.message);
    return NextResponse.json(
      { success: false, error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
