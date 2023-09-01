import React from "react";
import Link from "next/link";
import Image from "next/image";
import Logo from "../../../public/Flystick_logo.svg";
import BoazJoin from "../../../public/BoazJoin.jpg";

const Pricing = () => {
  return (
    <div className="relative">
      <div id="Pricing" className=" bg-white p-10 flex">
        <div className="  container mx-auto ">
          <div className="shadow-lg flex flex-wrap w-full h-full lg:w-auto mx-auto  ">
            <div className="border w-full md:w-1/3 ">
              <Image
                src={BoazJoin}
                alt="image"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="bg-white w-full md:w-2/3 ">
              <div className="h-full mx-auto px-6 md:px-0 md:pt-6 md:-ml-6 ">
                <div className="bg-white lg:h-full p-6 -mt-6 md:mt-0  mb-4 md:mb-0 flex flex-wrap md:flex-wrap items-center">
                  <div className="w-full lg:border-right lg:border-solid text-center md:text-left">
                    <h3 className="text-lg font-semibold">
                      Monthly Subscription - 220 NIS Only
                    </h3>
                    <p>What You Get:</p>
                    <div className="w-1/4 md:ml-0 mt-4 border lg:hidden"></div>
                    <div className="w-full lg:w-3/5 lg:px-3">
                      <p>
                        Unlock the world of movement and wellness with our
                        comprehensive monthly subscription. For just 220 NIS per
                        month, you'll have unlimited access to a treasure trove
                        of content, expert insights, and a supportive community.
                        Join us on this exciting journey towards improved health
                        and well-being!
                      </p>
                    </div>
                    <div className="w-full lg:w-1/5 mt-6 lg:mt-0 lg:px-4 text-center md:text-left">
                      <Link
                        href="/"
                        className="px-5 py-2 inline-block bg-slate-600 text-white hover:bg-[#990011] transition-colors mt-5"
                      >
                        Get Started
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
