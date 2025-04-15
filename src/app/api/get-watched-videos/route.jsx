import prisma from "../../libs/prismadb"; // Adjust the path as needed
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
      select: { videoUri: true },
    });

    const videoUris = watched.map((v) => v.videoUri);

    return NextResponse.json({ watchedVideos: videoUris });
  } catch (error) {
    console.error("Error fetching watched videos:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
