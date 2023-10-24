import prisma from "../../libs/prismadb";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { userEmail: email } = body;

    if (!email) {
      console.log("Missing Email");
      return new NextResponse("Missing Email", { status: 400 });
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

    //console.log("User ID:", user.id);

    const folders = await prisma.folder.findMany({
      where: {
        userId: user.id,
      },
    });
    const folderNames = folders.map((folder) => folder.name);

    // console.log(folders);
    // console.log(folderNames);

    return NextResponse.json({ folderNames });
  } catch (error) {
    console.error("Error logging userId:", error);
    console.log("Internal Server Error");
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
