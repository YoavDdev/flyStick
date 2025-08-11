import { NextResponse } from "next/server";
import prisma from "../../libs/prismadb";

export async function POST(req: Request) {
  const body = await req.json();
  const { userEmail, videoUri, progress, resumeTime } = body;

  if (!userEmail || !videoUri) {
    return new NextResponse("Missing userEmail or videoUri", { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!user) {
    return new NextResponse("User not found", { status: 404 });
  }

  const existing = await prisma.watchedVideo.findFirst({
    where: {
      userId: user.id,
      videoUri,
    },
  });

  if (existing) {
    await prisma.watchedVideo.update({
      where: { id: existing.id },
      data: {
        progress, // ✅ always update to current percent
        resumeTime, // ✅ always update
      },
    });
  
    return NextResponse.json({ message: "Progress updated" });
  }

  const watched = await prisma.watchedVideo.create({
    data: {
      userId: user.id,
      videoUri,
      progress: progress || 0,
      resumeTime,
    },
  });

  return NextResponse.json({ message: "Marked as watched", watched });
}

export async function DELETE(req: Request) {
  // Client calls this with query params: /api/mark-watched?userEmail=...&videoUri=...
  const { searchParams } = new URL(req.url);
  const userEmail = searchParams.get("userEmail");
  const videoUri = searchParams.get("videoUri");

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
      videoUri,
    },
  });

  return NextResponse.json({ message: "Marked as unwatched" });
}