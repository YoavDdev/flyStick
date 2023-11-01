import prisma from "../../libs/prismadb";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { userEmail: email, folderName } = body; // Add folderName field to the request body

    if (!email || !folderName) {
      console.log("Missing Email or Folder Name");
      return new NextResponse("Missing Email or Folder Name", { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    // const useremal = user.id;

    // console.log(useremal);

    if (!user) {
      console.log("User not found");
      return new NextResponse("User not found", { status: 404 });
    }

    const folders = await prisma.folder.findMany({
      where: {
        userId: user.id,
        name: folderName,
      },
    });
    const folderUrls = folders.map((folder) => folder.urls);
    // const folderUrls = folder.urls;
    // console.log(folderUrls);
    // console.log(folders);
    // console.log(folderNames);

    const array = folderUrls;
    const newFolderUrls = array[0];
    console.log(newFolderUrls); // [ '/videos/874531983', '/videos/831159208' ]

    return NextResponse.json({ newFolderUrls });
  } catch (error) {
    console.error("Error logging userId:", error);
    console.log("Internal Server Error");
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
