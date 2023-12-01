import bcrypt from "bcrypt";
import prisma from "../../libs/prismadb";
import axios from "axios";
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
      const convertKitUrl = `https://api.convertkit.com/v3/forms/${process.env.CONVERTKIT_FORM_ID}/subscribe`;
      const convertKitData = {
        api_key: process.env.CONVERTKIT_API_KEY,
        email,
      };

      const convertKitResponse = await axios.post(
        convertKitUrl,
        convertKitData,
        {
          headers: { "Content-Type": "application/json; charset=utf-8" },
        },
      );

      if (convertKitResponse.status === 200) {
        console.log("User subscribed to ConvertKit newsletter");
      } else {
        console.error("ConvertKit API error:", convertKitResponse.data);
      }
    } catch (convertKitError) {
      console.error("Error subscribing user to ConvertKit:", convertKitError);
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
