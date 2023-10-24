import prisma from "../../libs/prismadb";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { userEmail: email, videoUri, folderName } = body;

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

    // Check if the folder already exists for the user
    const existingFolder = await prisma.folder.findFirst({
      where: {
        userId: user.id,
        name: folderName,
      },
    });

    if (existingFolder) {
      console.log("Folder already exists");

      // Check if the videoUri already exists in the urls array
      if (!existingFolder.urls.includes(videoUri)) {
        // Add the videoUri to the urls array of the existing folder
        await prisma.folder.update({
          where: {
            id: existingFolder.id,
          },
          data: {
            urls: [...existingFolder.urls, videoUri],
          },
        });
      } else {
        console.log("videoUri already exists in the folder");
        return NextResponse.json({
          message: "videoUri already exists in the folder",
        });
      }
    } else {
      // Create a new folder if it doesn't exist
      const newFolder = await prisma.folder.create({
        data: {
          name: folderName,
          urls: [videoUri],
          user: {
            connect: {
              id: user.id,
            },
          },
        },
      });
      //console.log(newFolder);
    }

    console.log("Add to favorites");
    return NextResponse.json({ message: "Add to favorites" });
  } catch (error) {
    console.error("Error adding video to favorites:", error);
    console.log("Internal Server Error");
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
