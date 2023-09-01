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
            <div className="bg-white w-full md:w-2/3">
              <div className="h-full mx-auto px-6 md:px-0 md:pt-6 md:-ml-6">
                <div className="bg-white lg:h-full p-6 -mt-6 md:mt-0  mb-4 md:mb-0 flex flex-wrap md:flex-wrap items-center">
                  <div className="w-full lg:border-right lg:border-solid text-center md:text-left">
                    <h3 className="text-lg font-semibold mb-2">
                      Monthly Subscription - 220 NIS Only
                    </h3>
                    <p className="text-gray-600">
                      Unlock the world of movement and wellness with our
                      comprehensive monthly subscription.
                    </p>
                    <ul className="list-disc pl-4 mt-4">
                      <li>Unlimited access to expert content</li>
                      <li>Supportive community</li>
                      <li>Improved health and well-being</li>
                    </ul>
                    <div className="w-full lg:w-1/5 mt-6 lg:mt-0 lg:px-4 text-center md:text-left">
                      <Link
                        href="/"
                        className="px-6 py-3 inline-block bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-full hover:bg-gradient-to-r hover:from-blue-700 hover:to-blue-900 transition-colors mt-5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                      >
                        Subscribe Now
                      </Link>
                      <p className="text-gray-500 text-sm mt-2">
                        Limited time offer!
                      </p>
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
