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
    const { userId, subscriptionId, name, userEmail, trialStartDate, cancellationDate } = body;
    
    if (!userId) {
      return NextResponse.json(
        { error: "מזהה משתמש נדרש" },
        { status: 400 }
      );
    }
    
    // Update user information
    const updatedUser = await prismadb.user.update({
      where: {
        id: userId,
      },
      data: {
        // Handle subscriptionId specially to allow empty string ("ללא מנוי")
        ...(subscriptionId !== undefined ? { subscriptionId: subscriptionId } : {}),
        ...(name && { name }),
        ...(userEmail && { email: userEmail }),
        // Handle trialStartDate field
        ...(trialStartDate !== undefined ? { trialStartDate } : {}),
        // Handle cancellationDate field
        ...(cancellationDate !== undefined ? { cancellationDate } : {}),
      },
    });
    
    return NextResponse.json(updatedUser);
    
  } catch (error) {
    console.error("[ADMIN_UPDATE_USER_ERROR]", error);
    return NextResponse.json(
      { error: "שגיאת שרת פנימית" },
      { status: 500 }
    );
  }
}