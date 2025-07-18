import { NextResponse } from "next/server";
import prismadb from "@/app/libs/prismadb";

export async function POST(req: Request) {
  try {
    // Get the email from the request headers
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: "אינך מחובר למערכת" },
        { status: 401 }
      );
    }
    
    const email = authHeader.split(' ')[1];
    
    // Check if user is an admin
    const currentUser = await prismadb.user.findUnique({
      where: { email },
    });
    
    if (!currentUser || currentUser.subscriptionId !== "Admin") {
      return NextResponse.json(
        { error: "אין לך הרשאות מנהל" },
        { status: 403 }
      );
    }
    
    // Get request body
    const body = await req.json();
    console.log("API DEBUG - Full request body:", JSON.stringify(body));
    const { userId, subscriptionId, name, userEmail, trialStartDate, cancellationDate } = body;
    
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