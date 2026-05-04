export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { verifyAdminAccess } from "@/app/libs/adminAuth";

// POST - Update all registrations to receive email updates
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdminAccess(request);
    if (!authResult.isAuthenticated || !authResult.isAdmin) {
      return NextResponse.json({ error: "אין הרשאות מתאימות" }, { status: 401 });
    }

    console.log('🔄 Updating all existing registrations to receive email updates...');
    
    // Update all non-true values to true
    const result = await prisma.liveEventRegistration.updateMany({
      where: {
        NOT: {
          wantsEmailUpdates: true
        }
      },
      data: {
        wantsEmailUpdates: true
      }
    });
    
    console.log(`✅ Updated ${result.count} registrations`);
    
    // Get current stats
    const total = await prisma.liveEventRegistration.count();
    const wantsUpdates = await prisma.liveEventRegistration.count({
      where: { wantsEmailUpdates: true }
    });
    
    return NextResponse.json({
      success: true,
      updated: result.count,
      stats: {
        total,
        wantsUpdates,
        doesNotWant: total - wantsUpdates
      }
    });
  } catch (error: any) {
    console.error("Error updating email preferences:", error.message);
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}
