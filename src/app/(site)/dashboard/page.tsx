"use client";

import { useSession } from "next-auth/react";
import React from "react";
import Link from "next/link";
import DashboardCard from "../../components/DashboardCard"; // Create a DashboardCard component for each section

const DashboardPage = () => {
  const { data: session } = useSession();

  return (
    <div className="bg-gray-100 min-h-screen flex justify-center items-start sm:pt-40 pt-20">
      {session?.user ? (
        <div className="bg-white w-full max-w-screen-xl p-8 rounded-lg shadow-lg">
          <h2 className="text-3xl font-semibold text-[#EF8354] mb-4 capitalize">
            Welcome, {session.user.name}!
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Dashboard Overview, Explore your personalized learning dashboard.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <DashboardCard
              title="Explore Section"
              description="Dive into a world of learning with a vast pool of knowledge."
              link="/explore"
            />

            <DashboardCard
              title="Styles Section"
              description="Browse lessons, exercises, and lectures by style and technique."
              link="/styles"
            />

            <DashboardCard
              title="Library Section"
              description="Organize your video collection and create custom folders."
              link="/user"
            />

            <DashboardCard
              title="Payment Section"
              description="Manage your subscription and unlock exclusive features."
              link="/#Pricing"
            />
          </div>
        </div>
      ) : (
        <div className="text-center">
          <h1 className="text-4xl font-semibold text-gray-700 mb-4">
            Please Log in to Continue
          </h1>
          <Link href="/login">
            <span className="text-[#EF8354] text-lg">Login</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
