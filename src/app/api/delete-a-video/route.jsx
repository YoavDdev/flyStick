export const dynamic = 'force-dynamic';
import prisma from "../../libs/prismadb";
import { NextResponse } from "next/server";

export async function DELETE(request) {
  try {
    const body = await request.json();
    const { userEmail: email, folderName, videoUrl } = body; // Add videoUrl field to the request body

    if (!email || !folderName || !videoUrl) {
      console.log("Missing Email, Folder Name, or Video URL");
      return new NextResponse("Missing Email, Folder Name, or Video URL", {
        status: 400,
      });
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

    const folder = await prisma.folder.findFirst({
      where: {
        userId: user.id,
        name: folderName,
      },
    });

    if (!folder) {
      console.log("Folder not found");
      return new NextResponse("Folder not found", { status: 404 });
    }

    // Check if the video URL exists in the folder's URLs
    if (folder.urls.includes(videoUrl)) {
      // Remove the video URL from the folder
      await prisma.folder.update({
        where: { id: folder.id },
        data: {
          urls: {
            set: folder.urls.filter((url) => url !== videoUrl),
          },
        },
      });

      return new NextResponse("Video removed successfully", { status: 200 });
    } else {
      console.log("Video not found in the folder");
      return new NextResponse("Video not found in the folder", { status: 404 });
    }
  } catch (error) {
    console.error("Error removing video:", error);
    console.log("Internal Server Error");
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
