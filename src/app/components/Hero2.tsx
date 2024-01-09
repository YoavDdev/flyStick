"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import SubscriptionDetails from "./../api/SubscriptionDetails";
import new_main from "../../../public/new_main.png";

const Hero = () => {
  const [visible, setVisible] = useState(false);
  const { subscriptionStatus, loading } = SubscriptionDetails();

  useEffect(() => {
    // Set a delay to trigger the fade-in animation
    const delay = setTimeout(() => {
      setVisible(true);
    }, 500);

    // Clear the timeout to avoid memory leaks
    return () => clearTimeout(delay);
  }, []);
  return (
    <div className="relative mt-32 sm:mt-10">
      <div
        className={`overflow-hidden transform scale-150 md:scale-100 ${
          visible
            ? "opacity-100 scale-100 transition-opacity duration-1000 ease-in-out delay-500"
            : "opacity-0 scale-80"
        }`}
      >
        <Image
          src={new_main}
          alt="BoazMain"
          layout="responsive"
          className="object-cover w-full h-full "
          priority
        />
      </div>
      <div
        className={`absolute inset-0 flex items-center justify-center text-center text-white lg:mb-32 ${
          visible
            ? "opacity-100 transition-opacity duration-1000 ease-in-out"
            : "opacity-0"
        }`}
      >
        <div className="mx-auto max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-4  sm:text-white drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
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
                <span className="text-white ">Dive into a vast </span>{" "}
                collection of lessons and exercises, expertly curated to enhance
                your body-mind connection and elevate your well-being with
                varied training techniques and difficulty levels.
              </>
            )}
          </p>
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-center transition-all duration-500 ease-in-out">
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
                className={`rounded-full bg-[#2D3142] px-6 py-3 text-lg text-white shadow-lg hover:bg-[#4F5D75] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-opacity transform hover:scale-105 ${
                  visible ? "opacity-100" : "opacity-0"
                }`}
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
