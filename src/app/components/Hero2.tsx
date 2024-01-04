"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import BoazMain_Clean from "../../../public/BoazMain_Clean.png";
import SubscriptionDetails from "./../api/SubscriptionDetails";
import new_main from "../../../public/new_main.png";

const Hero = () => {
  const [visible, setVisible] = useState(true); // Set initial state to false
  const { subscriptionStatus, loading } = SubscriptionDetails();

  return (
    <div className="relative mt-20">
      <div className="overflow-hidden rounded-md">
        <Image
          src={new_main}
          alt="BoazMain"
          layout="responsive"
          width={1920}
          height={1080}
        />
      </div>

      <div className="absolute inset-0 flex items-center justify-center text-center text-white lg:mb-32">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-4">
            Boaz Nahaisi&apos;s Online Studio
          </h1>
          <p className="mt-6 text-gray-700 sm:text-xl mx-5">
            {subscriptionStatus === "ACTIVE" ? (
              <>
                <span className="text-white font-semibold">Welcome back!</span>{" "}
                Start exploring a vast collection of lessons and exercises,
                expertly curated to enhance your body-mind connection and
                elevate your well-being with varied training techniques and
                difficulty levels.
              </>
            ) : (
              <>
                Dive into a vast collection of lessons and exercises, expertly
                curated to enhance your body-mind connection and elevate your
                well-being with varied training techniques and difficulty
                levels.
              </>
            )}
          </p>
          <div className="mt-10 flex items-center justify-center transition-all duration-500 ease-in-out">
            {loading ? (
              <p>Loading...</p>
            ) : subscriptionStatus === "ACTIVE" ? (
              <Link
                href="/explore"
                className="rounded-full bg-[#2D3142] px-6 py-3 text-lg text-white shadow-lg hover:bg-[#4F5D75] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-transform transform hover:scale-105"
              >
                Start Exploring
              </Link>
            ) : (
              <Link
                href="/register"
                className="rounded-full bg-[#2D3142] px-6 py-3 text-lg text-white shadow-lg hover:bg-[#4F5D75] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-transform transform hover:scale-105"
              >
                Start Your 3-Day Free Trial
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
