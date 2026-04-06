export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions as authOptionsImport } from "../../auth/[...nextauth]/route.jsx";
import prisma from "@/app/libs/prismadb";

const authOptions = authOptionsImport as any;

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any;
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!adminUser || adminUser.subscriptionId !== "Admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const q = request.nextUrl.searchParams.get("q") || "";

    if (q.length < 2) {
      return NextResponse.json({ users: [] });
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, email: true },
      take: 15,
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error("Search users error:", error);
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}
