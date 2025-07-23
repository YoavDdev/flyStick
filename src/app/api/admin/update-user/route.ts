import { NextRequest, NextResponse } from "next/server";
import prismadb from "@/app/libs/prismadb";
import { verifyAdminAccess } from "@/app/libs/adminAuth";
import { rateLimit, rateLimitConfigs } from "@/app/libs/rateLimit";
import { validateRequestBody, adminSchemas } from "@/app/libs/validation";

export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting for admin actions
    const rateLimitResult = rateLimit(rateLimitConfigs.adminActions)(req);
    if (rateLimitResult) {
      return rateLimitResult;
    }
    
    // Verify admin access using new standardized method
    const authResult = await verifyAdminAccess(req);
    
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: authResult.error || "אינך מחובר למערכת" },
        { status: 401 }
      );
    }
    
    if (!authResult.isAdmin) {
      return NextResponse.json(
        { error: authResult.error || "אין לך הרשאות מנהל" },
        { status: 403 }
      );
    }
    
    // Validate request body
    const validation = await validateRequestBody(req, adminSchemas.updateUser);
    if (!validation.success) {
      return validation.error;
    }
    
    const { userId, subscriptionId, name, userEmail, trialStartDate, cancellationDate } = validation.data;
    
    // Request body already validated and extracted above
    console.log("API DEBUG - Validated request data:", { userId, subscriptionId, name, userEmail, trialStartDate, cancellationDate });
    
    console.log("API DEBUG - Extracted fields:", { 
      userId, 
      subscriptionId, 
      name, 
      userEmail,
      trialStartDate,
      cancellationDate 
    });
    
    if (!userId) {
      return NextResponse.json(
        { error: "מזהה משתמש נדרש" },
        { status: 400 }
      );
    }
    
    // Prepare update data object
    let updateData: any = {
      // Handle subscriptionId specially to allow empty string ("ללא מנוי")
      ...(subscriptionId !== undefined ? { subscriptionId: subscriptionId } : {}),
      ...(name && { name }),
      ...(userEmail && { email: userEmail }),
      // Handle cancellationDate field
      ...(cancellationDate !== undefined ? { cancellationDate } : {}),
    };
    
    // Special handling for trial_30 subscription - always ensure trialStartDate is set
    if (subscriptionId === "trial_30") {
      // If trialStartDate is provided, use it; otherwise set to current date
      if (trialStartDate) {
        updateData.trialStartDate = trialStartDate;
      } else {
        updateData.trialStartDate = new Date().toISOString();
      }
    } else if (trialStartDate !== undefined) {
      // For other subscription types, only update trialStartDate if explicitly provided
      updateData.trialStartDate = trialStartDate;
    }
    
    // Update user information
    const updatedUser = await prismadb.user.update({
      where: {
        id: userId,
      },
      data: updateData,
    });
    
    console.log("API DEBUG - Updated user returned from Prisma:", JSON.stringify(updatedUser));
    
    return NextResponse.json(updatedUser);
    
  } catch (error) {
    console.error("[ADMIN_UPDATE_USER_ERROR]", error);
    return NextResponse.json(
      { error: "שגיאת שרת פנימית" },
      { status: 500 }
    );
  }
}