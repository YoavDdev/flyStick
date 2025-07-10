import { NextResponse } from "next/server";
import prismadb from "@/app/libs/prismadb";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Find user by email
    const user = await prismadb.user.findUnique({
      where: {
        email: email,
      },
    });

    // Check if user exists and has Admin role
    const isAdmin = user?.role === "Admin" || user?.subscriptionId === "Admin";

    return NextResponse.json({ isAdmin });
  } catch (error) {
    console.error("[CHECK_ADMIN_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
