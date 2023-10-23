import prisma from "../../libs/prismadb";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const folders = await prisma.folder.findMany();
    const folderNames = folders.map((folder) => folder.name);

    return NextResponse.json({ folderNames });
  } catch (error) {
    console.error("Error fetching folder names:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { folderName } = body;

    if (!folderName) {
      return new NextResponse("Folder name is required", { status: 400 });
    }

    // Check if the folder already exists
    const existingFolder = await prisma.folder.findFirst({
      where: {
        name: folderName,
      },
    });

    if (existingFolder) {
      return new NextResponse("Folder already exists", { status: 409 });
    }

    // Create a new folder
    const newFolder = await prisma.folder.create({
      data: {
        name: folderName,
      },
    });

    return NextResponse.json({
      message: "Folder created successfully",
      folder: newFolder,
    });
  } catch (error) {
    console.error("Error creating folder:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
