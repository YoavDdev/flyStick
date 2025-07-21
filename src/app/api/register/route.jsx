import bcrypt from "bcrypt";
import prisma from "../../libs/prismadb";
import { NextResponse } from "next/server";

export async function POST(request) {
  const body = await request.json();
  const { name, email, password, subscribeToNewsletter } = body;

  if (!name || !email || !password) {
    return new NextResponse("Missing Fields", { status: 400 });
  }

  const exist = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (exist) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      hashedPassword,
    },
  });

  // Newsletter Subscription Logic
  if (subscribeToNewsletter) {
    try {
      const newsletterResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          email,
          name,
          source: 'registration'
        })
      });

      if (newsletterResponse.ok) {
        console.log("✅ User subscribed to newsletter");
      } else {
        const errorData = await newsletterResponse.json();
        console.error("❌ Newsletter subscription error:", errorData.error);
      }
    } catch (newsletterError) {
      console.error("❌ Error subscribing user to newsletter:", newsletterError);
    }
  }

  await prisma.folder.create({
    data: {
      userId: user.id,
      name: "favorites",
      urls: [],
    },
  });

  return NextResponse.json(user);
}
