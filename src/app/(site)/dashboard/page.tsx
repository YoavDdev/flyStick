"use client";

import { useSession } from "next-auth/react";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import DashboardCard from "../../components/DashboardCard";
import axios from "axios";

const DashboardPage = () => {
  const { data: session } = useSession();
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (session?.user) {
          // Fetch user data including subscriptionId from the new API route
          const response = await axios.post("/api/get-user-subsciptionId", {
            userEmail: session.user.email,
          });

          const userData = response.data;

          // Extract subscriptionId from userData
          const subscriptionId = userData.subscriptionId;

          // Fetch subscription details using the retrieved subscriptionId
          const clientId = process.env.PAYPAL_CLIENT_ID;
          const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

          const auth = {
            username: clientId!,
            password: clientSecret!,
          };

          const subscriptionResponse = await axios.get(
            `https://api.paypal.com/v1/billing/subscriptions/${subscriptionId}`,
            { auth },
          );

          const status = subscriptionResponse.data.status;
          setSubscriptionStatus(status);

          // Update your database with the updated subscription status if needed
        }
      } catch (error) {
        console.error(
          "Error fetching user data or subscription details:",
          error,
        );
      } finally {
        // Set loading to false when the request is completed
        setLoading(false);
      }
    };

    // Fetch user data when the component mounts or when the session changes
    fetchUserData();
  }, [session]);

  const cancelSubscription = async () => {
    try {
      if (session?.user) {
        // Ask for confirmation before canceling subscription
        const confirmed = window.confirm(
          "Are you sure you want to cancel your subscription? You will lose access to the content immediately.",
        );

        if (confirmed) {
          // Make a request to cancel subscription in PayPal
          const clientId = process.env.PAYPAL_CLIENT_ID;
          const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

          const auth = {
            username: clientId!,
            password: clientSecret!,
          };

          // Retrieve the subscription ID from your user data
          const response = await axios.post("/api/get-user-subsciptionId", {
            userEmail: session.user.email,
          });

          const userData = response.data;

          // Extract subscriptionId from userData
          const subscriptionId = userData.subscriptionId;

          const cancellationResponse = await axios.post(
            `https://api.paypal.com/v1/billing/subscriptions/${subscriptionId}/cancel`,
            {},
            { auth },
          );

          if (cancellationResponse.status === 204) {
            // Subscription canceled successfully
            setSubscriptionStatus("CANCELLED");
            console.log("Subscription canceled successfully");
          } else {
            console.log(
              "Failed to cancel subscription",
              cancellationResponse.data,
            );
            // Handle the case where the cancellation request was not successful
          }
        } else {
          console.log("User canceled the subscription cancellation");
          // Handle the case where the user canceled the subscription cancellation
        }
      } else {
        console.log("User session or user data not available");
        // Handle the case where user session or user data is not available
      }
    } catch (error) {
      console.error("Error canceling subscription:", error);
    }
  };

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

            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-extrabold text-[#2D3142] mb-2">
                Payment Section
              </h3>
              {loading ? (
                <p className="text-gray-600 mb-10">Loading...</p>
              ) : (
                <>
                  {subscriptionStatus !== null ? (
                    <p className="text-gray-600 mb-10">
                      Subscription Status:{" "}
                      <span className="text-yellow-600 ">
                        {subscriptionStatus}
                      </span>
                    </p>
                  ) : (
                    <p className="text-gray-600 mb-10">
                      Subscription Status:{" "}
                      <span className="text-red-600">Not Active</span>
                    </p>
                  )}

                  {subscriptionStatus === "ACTIVE" ? (
                    <>
                      <button
                        onClick={cancelSubscription}
                        className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition duration-300 ease-in-out"
                      >
                        Cancel Subscription
                      </button>
                      <p className="text-gray-600 mt-2">
                        Click the button to cancel your subscription.
                      </p>
                    </>
                  ) : subscriptionStatus === "CANCELLED" ? (
                    <Link href="/#Pricing">
                      <span className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition duration-300 ease-in-out">
                        Renew your subscription
                      </span>
                    </Link>
                  ) : (
                    <Link href="/#Pricing">
                      <span className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition duration-300 ease-in-out">
                        Activate subscription
                      </span>
                    </Link>
                  )}
                </>
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
