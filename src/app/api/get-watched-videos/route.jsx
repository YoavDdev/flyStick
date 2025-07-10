import prisma from "../../libs/prismadb";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    
    const { userEmail, page = 1, limit = 10 } = body;

    if (!userEmail) {
      return NextResponse.json({ message: "Missing userEmail" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Calculate pagination values
    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    // Get total count for pagination info
    const totalCount = await prisma.watchedVideo.count({
      where: { userId: user.id },
    });

    // Get paginated watched videos
    const watched = await prisma.watchedVideo.findMany({
      where: { userId: user.id },
      select: { videoUri: true, progress: true, resumeTime: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
    
    const watchedVideos = watched.map((v) => ({
      uri: v.videoUri,
      progress: v.progress || 0,
      resumeTime: v.resumeTime ?? 0, 
    }));

    return NextResponse.json({ 
      watchedVideos,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: take,
        hasMore: skip + take < totalCount
      }
    });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}