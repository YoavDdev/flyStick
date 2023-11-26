"use client";

import { useSession } from "next-auth/react";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import DashboardCard from "../../components/DashboardCard";
import axios from "axios";

const DashboardPage = () => {
  const { data: session } = useSession();
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        const clientId =
          "AUCQ4EpGcrWEqFKt5IBAAaixzjpYUn4CH-l35TSvPFbJhcF7lUbe6vaVDfAOMW2HSshM7PJ6GNKjT0Yw";
        const clientSecret =
          "ELs2eL9V_MaNK535C7pAWBEwnlMtBLZbkBcBUQw_wcXkw6kDRhuq8m0GZpME6WBjVL_qtMkdptvgvNby";
        const subscriptionId = "I-RW678BJXRFX9";

        const auth = {
          username: clientId,
          password: clientSecret,
        };

        const response = await axios.get(
          `https://api.paypal.com/v1/billing/subscriptions/${subscriptionId}`,
          { auth },
        );

        const status = response.data.status;
        setSubscriptionStatus(status);

        // Update your database with the subscription status
        // Implement your logic based on the status (e.g., set subscriptionActive to true/false)
      } catch (error) {
        console.error("Error fetching subscription details:");
      }
    };

    // Fetch subscription status when the component mounts
    fetchSubscriptionStatus();
  }, []); // Empty dependency array ensures that this effect runs only once when the component mounts

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
            <div>
              {subscriptionStatus !== null ? (
                <p className="text-green-500">
                  Subscription Status: {subscriptionStatus}
                </p>
              ) : (
                <p>Loading subscription status...</p>
              )}
            </div>
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
