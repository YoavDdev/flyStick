import prisma from "../../libs/prismadb";
import { NextResponse } from "next/server";

export async function DELETE(request) {
  try {
    const { folderId } = request.params; // Assuming the folderId is passed as a parameter in the URL

    if (!folderId) {
      console.log("Missing Folder ID");
      return new NextResponse("Missing Folder ID", { status: 400 });
    }

    const folder = await prisma.folder.findUnique({
      where: {
        id: folderId,
      },
    });

    if (!folder) {
      console.log("Folder not found");
      return new NextResponse("Folder not found", { status: 404 });
    }

    // Delete the folder
    await prisma.folder.delete({
      where: {
        id: folderId,
      },
    });

    // Optionally, you can delete associated data, like folder contents, here

    console.log("Folder deleted:", folderId);

    return new NextResponse("Folder deleted", { status: 204 }); // 204 means No Content
  } catch (error) {
    console.error("Error deleting folder:", error);
    console.log("Internal Server Error");
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
