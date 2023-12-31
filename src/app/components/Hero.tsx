"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import BoazMain_Clean from "../../../public/BoazMain_Clean.png";
import SubscriptionDetails from "./../api/SubscriptionDetails";

const Hero = () => {
  const [visible, setVisible] = useState(true); // Set initial state to false
  const { subscriptionStatus, loading } = SubscriptionDetails();

  return (
    <div className="relative pt-20">
      <div className="mx-auto max-w-7xl">
        <div className="relative z-10 pt-14 lg:w-full lg:max-w-2xl">
          <svg
            className="absolute inset-y-0 right-8 hidden h-full w-80 translate-x-1/2 transform fill-[#FCF6F5] lg:block"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polygon points="0,0 90,0 50,100 0,100" />
          </svg>

          <div
            className={`relative px-6 py-32 sm:py-40 lg:px-8 lg:py-56 lg:pr-16 animate-fade-in ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl">
              <h1 className="text-4xl font-bold tracking-tight text-[#EF8354] sm:text-6xl  mb-4 text-center">
                Boaz Nahaisi&apos;s Online Studio
              </h1>
              <p className="mt-6 text-gray-600 sm:text-xl text-center">
                {subscriptionStatus === "ACTIVE" ? (
                  <>
                    <span className="text-[#EF8354] font-semibold">
                      Welcome back!
                    </span>{" "}
                    Start exploring a vast collection of lessons and exercises,
                    expertly curated to enhance your body-mind connection and
                    elevate your well-being with varied training techniques and
                    difficulty levels.
                  </>
                ) : (
                  <>
                    Dive into a vast collection of lessons and exercises,
                    expertly curated to enhance your body-mind connection and
                    elevate your well-being with varied training techniques and
                    difficulty levels.
                  </>
                )}
              </p>
              <div className="mt-10 flex items-center justify-center transition-all duration-500 ease-in-out">
                {loading ? (
                  <p>Loading...</p>
                ) : subscriptionStatus === "ACTIVE" ? (
                  <Link
                    href="/explore"
                    className="rounded-full bg-[#2D3142] px-6 py-3 text-lg text-white shadow-lg hover:bg-[#4F5D75]  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-transform transform hover:scale-105"
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
      </div>
      <div className="bg-gray-50 lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 ">
        <Image
          src={BoazMain_Clean}
          height={800}
          width={1200}
          alt="BoazMain"
          quality={100}
          className="object-cover w-full h-full rounded-lg"
          priority
        />
      </div>
    </div>
  );
};

export default Hero;
