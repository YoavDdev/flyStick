export const dynamic = 'force-dynamic';
// pages/api/add-new-folder.js

import prisma from "../../libs/prismadb";
import { NextResponse } from "next/server";

export async function POST(request) {
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

    // Check if the folder already exists for the user
    const existingFolder = await prisma.folder.findFirst({
      where: {
        userId: user.id,
        name: folderName,
      },
    });

    if (existingFolder) {
      console.log("Folder already exists");
      return new NextResponse("Folder already exists", { status: 400 });
    }

    // Create a new folder
    const newFolder = await prisma.folder.create({
      data: {
        name: folderName,
        userId: user.id,
      },
    });

    return new NextResponse("Folder added successfully", { status: 200 });
  } catch (error) {
    console.error("Error adding new folder:", error);
    console.log("Internal Server Error");
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
