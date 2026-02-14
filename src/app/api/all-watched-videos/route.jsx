export const dynamic = 'force-dynamic';
import prisma from "../../libs/prismadb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const allWatched = await prisma.watchedVideo.findMany({
      select: {
        userId: true,
        videoUri: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ watched: allWatched });
  } catch (error) {
    console.error("Error fetching watched videos for all users:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
