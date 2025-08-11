import { NextResponse } from "next/server";
import prismadb from "@/app/libs/prismadb";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userEmail } = body;

    if (!userEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const watchedVideos = await prismadb.watchedVideo.findMany({
      where: {
        userEmail: userEmail,
      },
      select: {
        uri: true,
        progress: true,
        resumeTime: true,
      },
    });

    return NextResponse.json({ watchedVideos }, { status: 200 });
  } catch (error) {
    console.error("[GET_WATCHED_VIDEOS]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
