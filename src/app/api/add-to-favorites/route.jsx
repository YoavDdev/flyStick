import prisma from "../../libs/prismadb";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { userEmail: email, videoUri } = body;

    if (!email || !videoUri) {
      console.log("Missing Fields");
      return new NextResponse("Missing Fields", { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      console.log("User not found");
      return new NextResponse("User not found", { status: 404 });
    }

    // Check if the video URI already exists in user's favoriteVideos
    const videoIndex = user.favoriteVideos.findIndex(
      (favVideo) => favVideo === videoUri,
    );

    if (videoIndex !== -1) {
      console.log("Video already in favorites");
      return NextResponse.json({ message: "Video already in favorites" });
    }

    const updatedUser = await prisma.user.update({
      where: {
        email,
      },
      data: {
        favoriteVideos: {
          push: videoUri,
        },
      },
    });

    console.log("Add to favorites");
    return NextResponse.json({ message: "Add to favorites" });
  } catch (error) {
    console.error("Error adding video to favorites:", error);
    console.log("Internal Server Error");
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
