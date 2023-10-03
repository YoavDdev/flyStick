import prisma from "../../libs/prismadb";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { userEmail: email, videoUri } = body;

    if (!email || !videoUri) {
      return new NextResponse("Missing Fields", { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
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

    return Response.json({ message: "OK" });
  } catch (error) {
    console.error("Error adding video to favorites:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
