import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

export async function DELETE(request: Request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "אין הרשאות מתאימות" },
        { status: 401 }
      );
    }

    // Extract the email from the token
    const email = authHeader.split(" ")[1];

    // Check if the user is an admin
    const adminUser = await prisma.user.findUnique({
      where: { email },
      select: { subscriptionId: true },
    });

    if (!adminUser || adminUser.subscriptionId !== "Admin") {
      return NextResponse.json(
        { error: "אין הרשאות מתאימות" },
        { status: 403 }
      );
    }

    // Get user ID from request body
    const body = await request.json();
    const { userId, confirmationText } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "מזהה משתמש נדרש" },
        { status: 400 }
      );
    }

    // Additional safety check - require confirmation text
    if (confirmationText !== "DELETE") {
      return NextResponse.json(
        { error: "טקסט אישור לא תקין" },
        { status: 400 }
      );
    }

    // Get user details before deletion for logging
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        email: true, 
        name: true, 
        subscriptionId: true,
        createdAt: true 
      }
    });

    if (!userToDelete) {
      return NextResponse.json(
        { error: "משתמש לא נמצא" },
        { status: 404 }
      );
    }

    // Prevent deletion of admin users
    if (userToDelete.subscriptionId === "Admin") {
      return NextResponse.json(
        { error: "לא ניתן למחוק משתמש מנהל" },
        { status: 403 }
      );
    }

    console.log(`🗑️ Admin ${email} is deleting user:`, {
      id: userToDelete.id,
      email: userToDelete.email,
      name: userToDelete.name,
      subscriptionId: userToDelete.subscriptionId,
      createdAt: userToDelete.createdAt
    });

    // Delete user and all related data in a transaction
    await prisma.$transaction(async (tx: any) => {
      // Delete related data first (foreign key constraints)
      
      // Delete watched videos
      await tx.watchedVideo.deleteMany({
        where: { userId: userId }
      });

      // Delete folders (favorites)
      await tx.folder.deleteMany({
        where: { userId: userId }
      });

      // Delete message reads
      await tx.messageRead.deleteMany({
        where: { userId: userId }
      });

      // Delete accounts (OAuth connections)
      await tx.account.deleteMany({
        where: { userId: userId }
      });

      // Delete password resets
      await tx.passwordReset.deleteMany({
        where: { userId: userId }
      });

      // Finally, delete the user
      await tx.user.delete({
        where: { id: userId }
      });
    });

    console.log(`✅ User ${userToDelete.email} (${userToDelete.id}) deleted successfully by admin ${email}`);

    return NextResponse.json({
      message: `המשתמש ${userToDelete.email} נמחק בהצלחה`,
      deletedUser: {
        email: userToDelete.email,
        name: userToDelete.name,
        subscriptionId: userToDelete.subscriptionId
      }
    });

  } catch (error) {
    console.error("[ADMIN_DELETE_USER_ERROR]", error);
    return NextResponse.json(
      { error: "שגיאת שרת פנימית במחיקת המשתמש" },
      { status: 500 }
    );
  }
}
