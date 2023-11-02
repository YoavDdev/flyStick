import prisma from "../../libs/prismadb";
import { NextResponse } from "next/server";

export async function DELETE(request) {
  try {
    const body = await request.json();
    const { userEmail: email, folderName } = body;

    if (!email || !folderName) {
      console.log("Missing Email or Folder Name");
      return new NextResponse("Missing Email or Folder Name", { status: 400 });
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

    // Delete the folder
    await prisma.folder.delete({
      where: {
        id: folder.id,
      },
    });

    return new NextResponse("Folder deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Error deleting folder:", error);
    console.log("Internal Server Error");
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
