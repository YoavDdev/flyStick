import prisma from "../../libs/prismadb";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { userEmail } = body;

    if (!userEmail) {
      return NextResponse.json({ message: "Missing userEmail" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const watched = await prisma.watchedVideo.findMany({
      where: { userId: user.id },
      select: { videoUri: true, progress: true, resumeTime: true },
    });
    const watchedVideos = watched.map((v) => ({
      uri: v.videoUri,
      progress: v.progress || 0,
      resumeTime: v.resumeTime ?? 0, 
    }));

    return NextResponse.json({ watchedVideos });
  } catch (error) {
    console.error("Error fetching watched videos:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
