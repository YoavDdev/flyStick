export const dynamic = 'force-dynamic';
import prismadb from "../../libs/prismadb";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userEmail, videoUri, isCompleted, currentProgress } = body;

    if (!userEmail || !videoUri) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find user
    const user = await prismadb.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Find or create watched video record
    const existingRecord = await prismadb.watchedVideo.findFirst({
      where: {
        userId: user.id,
        videoUri: videoUri,
      },
    });

    if (existingRecord) {
      // Update existing record
      if (isCompleted) {
        // Mark as complete - set to 100 but keep resumeTime to track original progress
        // Store the original progress in resumeTime (as a percentage) if it was < 100
        const originalProgress = existingRecord.progress < 100 ? existingRecord.progress : 0;
        await prismadb.watchedVideo.update({
          where: { id: existingRecord.id },
          data: {
            progress: 100,
            resumeTime: originalProgress, // Store original progress here
          },
        });
      } else {
        // Mark as incomplete - restore from resumeTime if available
        if (existingRecord.progress === 100) {
          // Restore original progress from resumeTime
          const restoredProgress = existingRecord.resumeTime || 0;
          await prismadb.watchedVideo.update({
            where: { id: existingRecord.id },
            data: {
              progress: restoredProgress,
              resumeTime: 0, // Clear resumeTime after restoring
            },
          });
        }
        // If progress is already < 100, do nothing (keep the actual progress)
      }
    } else {
      // Create new record
      await prismadb.watchedVideo.create({
        data: {
          userId: user.id,
          videoUri: videoUri,
          progress: isCompleted ? 100 : 0,
          resumeTime: 0,
        },
      });
    }

    return NextResponse.json(
      { 
        message: isCompleted ? "Video marked as completed" : "Video marked as incomplete",
        success: true 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[MARK_COMPLETED]", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
