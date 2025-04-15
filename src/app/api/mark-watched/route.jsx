import prisma from "../../libs/prismadb"; // Adjust the path as needed
import { NextResponse } from "next/server";

export async function POST(request) {

  try {
    const body = await request.json();
    const { userEmail, videoUri } = body;

    // Validate the required fields are provided
    if (!userEmail || !videoUri) {
      console.log("Missing userEmail or videoUri");
      return new NextResponse("Missing userEmail or videoUri", { status: 400 });
    }

    // Find the user in the database
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      console.log("User not found");
      return new NextResponse("User not found", { status: 404 });
    }

    // Check if the video is already marked as watched for this user
    const existing = await prisma.watchedVideo.findFirst({
      where: {
        userId: user.id,
        videoUri: videoUri,
      },
    });

    if (existing) {
      return NextResponse.json({ message: "Already marked as watched" });
    }

    // Create a new watched video record
    const watched = await prisma.watchedVideo.create({
      data: {
        userId: user.id,
        videoUri: videoUri,
      },
    });

    return NextResponse.json({ message: "Marked as watched", watched });
  } catch (error) {
    console.error("Error marking video as watched:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
  
}

export async function DELETE(request) {
  try {
    const body = await request.json();
    const { userEmail, videoUri } = body;

    if (!userEmail || !videoUri) {
      return new NextResponse("Missing userEmail or videoUri", { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    await prisma.watchedVideo.deleteMany({
      where: {
        userId: user.id,
        videoUri: videoUri,
      },
    });

    return NextResponse.json({ message: "Marked as unwatched" });
  } catch (error) {
    console.error("Error unmarking video:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
