import React from "react";
import Link from "next/link";
import Image from "next/image";
import BoazMain_Clean from "../../../public/BoazMain_Clean.png";

const Hero = () => {
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

          <div className="relative px-6 py-32 sm:py-40 lg:px-8 lg:py-56 lg:pr-0">
            <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl">
              <h1 className="text-4xl font-bold tracking-tight text-[#EF8354] sm:text-6xl  mb-4 text-center">
                Boaz Nahaisi&apos;s Online Studio
              </h1>
              <p className="mt-6 text-gray-600 sm:text-xl">
                Dive into a Vast Collection of Lessons and Exercises, Expertly
                Curated to Enhance Your Body-Mind Connection and Elevate Your
                Well-Being with Varied Training Techniques and Difficulty
                Levels.
              </p>
              <div className="mt-10 flex items-center gap-x-6">
                <a
                  href="/register"
                  className="rounded-md bg-[#2D3142] px-3.5 py-2.5 text-sm  text-white shadow-sm hover:bg-[#4F5D75] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Get started
                </a>
                {/* <a
                  href="#"
                  className="text-sm font-semibold leading-6 text-[#EF8354]"
                >
                  Learn more <span aria-hidden="true">→</span>
                </a> */}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 ">
        {/*       <img
          className="aspect-[3/2] object-cover lg:aspect-auto lg:h-full lg:w-full"
          src=""
          alt=""
        /> */}
        <Image
          src={BoazMain_Clean}
          height={10000}
          width={10000}
          alt="BoazMain"
          quality={100}
          className="aspect-[3/2] object-cover lg:aspect-auto sm:h-full sm:w-full mr-96"
          priority
        />
      </div>
    </div>
  );
};

export default Hero;
