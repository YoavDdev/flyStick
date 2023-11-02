import { CheckIcon } from "@heroicons/react/20/solid";
import Link from "next/link";

const includedFeatures = [
  "Hundreds of hours of lessons, exercises, and lectures",
  "A vast pool of tools and ideas for lessons and exercises",
  "Exercises in a variety of methods (pleistic, controlology, pilates)",
  "Different difficulty levels",
];

export default function Pricing() {
  return (
    <div id="Pricing" className="bg-white p-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-3xl ring-1 ring-gray-200 lg:mx-0 lg:flex lg:max-w-none">
          <div className="p-8 sm:p-10 lg:flex-auto">
            <h3 className="text-2xl font-bold tracking-tight text-[#990011]">
              Boaz Nahaisi's Online Studio Membership
            </h3>
            <p className="mt-6 text-base leading-7 text-gray-600">
              A vast pool of knowledge that will allow you to connect with your
              body in ways you've never known before.
            </p>
            <div className="mt-10 flex items-center gap-x-4">
              <h4 className="flex-none text-sm font-semibold leading-6 text-[#990011]">
                What’s included
              </h4>
              <div className="h-px flex-auto bg-gray-100" />
            </div>
            <ul
              role="list"
              className="mt-8 grid grid-cols-1 gap-4 text-sm leading-6 text-gray-600 sm:grid-cols-2 sm:gap-6"
            >
              {includedFeatures.map((feature) => (
                <li key={feature} className="flex gap-x-3">
                  <CheckIcon
                    className="h-6 w-5 flex-none text-[#990011]"
                    aria-hidden="true"
                  />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          <div className="-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0">
            <div className="rounded-2xl bg-gray-50 py-10 text-center ring-1 ring-inset ring-gray-900/5 lg:flex lg:flex-col lg:justify-center lg:py-16">
              <div className="mx-auto max-w-xs px-8">
                <p className="text-base font-semibold text-gray-600">
                  Monthly Subscription
                </p>
                <p className="mt-6 flex items-baseline justify-center gap-x-2">
                  <span className="text-5xl font-bold tracking-tight text-gray-900">
                    220
                  </span>
                  <span className="text-sm font-semibold leading-6 tracking-wide text-gray-600">
                    NIS
                  </span>
                </p>

                <Link
                  href={"/login"}
                  className="mt-10 block w-full rounded-md bg-red-600 px-3 py-2 text-center text-sm text-white shadow-sm hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Get Started
                </Link>

                <p className="mt-6 text-xs leading-5 text-gray-600">
                  Subscription renews automatically every month. Cancel anytime.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* import React from "react";
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
 */
