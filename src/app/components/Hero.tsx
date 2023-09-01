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
              href="/"
              className="px-5 py-2 inline-block bg-slate-600 text-white hover:bg-[#990011] transition-colors mt-10"
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
