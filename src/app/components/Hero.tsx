import React from "react";
import Link from "next/link";

const Hero = () => {
  return (
    <div>
      <div className="bg-[url(/BoazMain_Clean.png)] h-screen w-screen bg-no-repeat md:bg-center bg-[center_left_-50rem] bg-cover">
        <div className="h-screen flex items-center md:justify-end ">
          <div className="text-center mx-auto ">
            <h1 className="sm:text-8xl text-5xl  text-[#990011] ">
              Elevate Your Movement Mastery
            </h1>
            <p className="font-light text-5xl mt-5">
              Discover The Flystick Technique
            </p>
            <Link
              href="/#Pricing"
              className="px-6 py-3 inline-block bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-full hover:bg-gradient-to-r hover:from-blue-700 hover:to-blue-900 transition-colors mt-5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
