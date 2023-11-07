"use client";

import { useSession } from "next-auth/react";
import React from "react";
import Link from "next/link"; // Import the Link component

const DashboardPage = () => {
  const { data: session } = useSession();

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        {session?.user ? (
          <div className="bg-white py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-base font-semibold leading-7  text-[#990011]">
                  Dashboard Overview
                </h2>
                <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  Welcome {session.user.name}
                </p>
                <p className="mt-6 text-lg leading-7 text-gray-600">
                  Welcome to your personalized learning dashboard. Here, you
                  have access to a wide range of resources, videos, and tools to
                  enhance your learning experience. Let's explore what's at your
                  fingertips.
                </p>
              </div>
              <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
                <h2 className="text-3xl font-semibold mt-6">Explore Section</h2>
                <p className="mt-2 text-lg leading-7 text-gray-600">
                  The Explore section is your gateway to a vast pool of
                  knowledge. It offers a diverse range of lessons, exercises,
                  and lectures tailored to your needs. Dive into a world of
                  learning, connect with your body in ways you've never known
                  before, and discover new horizons.
                </p>
                <Link href="/explore">
                  <span className="text-[#EF8354] mt-4">
                    Explore More <span aria-hidden="true">→</span>
                  </span>
                </Link>
              </div>

              <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
                <h2 className="text-3xl font-semibold mt-6">Styles Section</h2>
                <p className="mt-2 text-lg leading-7 text-gray-600">
                  The Styles section organizes content for your convenience.
                  Browse lessons, exercises, and lectures categorized by style
                  and technique. Whether you're a beginner or an advanced
                  learner, you'll find content suited to your skill level.
                  Explore various styles and categories to customize your
                  learning journey.
                </p>
                <Link href="/styles">
                  <span className="text-[#EF8354] mt-4">
                    Explore Styles <span aria-hidden="true">→</span>
                  </span>
                </Link>
              </div>

              <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
                <h2 className="text-3xl font-semibold mt-6">Library Section</h2>
                <p className="mt-2 text-lg leading-7 text-gray-600">
                  You have full control over your video collection. Save any
                  video you like and organize them in custom folders. Create
                  folders with unique names to categorize your videos. If you
                  ever wish to tidy up your library, deleting videos or entire
                  folders is just a click away. This feature allows you to
                  tailor your learning experience and stay organized.
                </p>
                <Link href="/user">
                  <span className="text-[#EF8354] mt-4">
                    Manage Library <span aria-hidden="true">→</span>
                  </span>
                </Link>
              </div>

              <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
                <h2 className="text-3xl font-semibold mt-6">Payment Section</h2>
                <p className="mt-2 text-lg leading-7 text-gray-600">
                  In the Payment section, you can manage your subscription. Here
                  are the available options:
                </p>
                <ul className="list-disc list-inside">
                  <li>
                    Subscribe to premium content and unlock exclusive features.
                  </li>
                  <li>
                    Manage your subscription, including renewing or canceling
                    it.
                  </li>
                  <li>View your subscription status and payment history.</li>
                </ul>
                <p className="mt-2 text-lg leading-7 text-gray-600">
                  Our payment section provides you with flexibility and control
                  over your subscription, ensuring a seamless learning
                  experience.
                </p>
                <Link href="/#Pricing">
                  <span className="text-[#EF8354] mt-4">
                    Manage Payments <span aria-hidden="true">→</span>
                  </span>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="ml-10">
            <h1 className="text-4xl">Please Login to continue.</h1>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
