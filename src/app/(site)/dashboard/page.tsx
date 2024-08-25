"use client";

import { useSession } from "next-auth/react";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import DashboardCard from "../../components/DashboardCard";
import axios from "axios";
import Image from "next/image";
import Dashboardpic from "../../../../public/Dashboardpic.png";

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
    <div className="relative">
      <div className="absolute inset-0 z-[-1]">
        <Image
          src={Dashboardpic}
          layout="fill"
          objectFit="cover"
          quality={100}
          alt="BoazMain"
        />
      </div>
      <div className="relative  min-h-screen flex justify-center items-start sm:pt-60 pt-20">
        {session?.user ? (
          <div className="bg-white bg-opacity-50 w-full max-w-screen-xl p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl font-semibold text-[#EF8354] mb-4 capitalize">
              ברוך הבא, {session.user.name}!
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              פה תמצאו את כל מה שאתם צריכים לדעת על המנוי.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <DashboardCard
                title="לחקור את עולם התנועה"
                description="צללו לתוך עולם של למידה עם מאגר ידע עצום ומעורר. מקלידים בחיפוש נושא ומקבלים פלייליסט אישי ומקיף."
                link="/explore"
              />

              <DashboardCard
                title="סגנונות ותכנים"
                description="צפו בשיעורים, תרגילים, הרצאות המסודרים לפי סגנונות שונים וטכניקות מגוונות. בחרו את הטכניקה המועדפת עליכם היום וקבלו מבחר אינסופי של שיעורים שמתחדש כל שבוע."
                link="/styles"
              />

              <DashboardCard
                title="הספרייה האישית שלך"
                description="כאן תוכלו לארגן את אוסף סרטי הוידאו שאהבתם במיוחד וליצור תיקיות מותאמות אישית."
                link="/user"
              />

              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-extrabold text-[#2D3142] mb-2">
                  אזור תשלום
                </h3>
                <p className="text-gray-600 mb-4">
                נהלו את המנוי שלכם, חידוש או ביטול בכל שלב, מתי שמתאים לכם בלחיצה על הכפתור למטה:
                </p>
                {loading ? (
                  <p className="text-gray-600 mb-10">טעינה...</p>
                ) : (
                  <>
                    {subscriptionStatus !== null ? (
                      <p className="text-gray-600 mb-10">
                        סטטוס מנוי:{" "}
                        <span className="text-green-500 ">
                          {subscriptionStatus}
                        </span>
                      </p>
                    ) : (
                      <p className="text-gray-600 mb-10">
                        סטטוס מנוי:{" "}
                        <span className="text-red-600">Not Active</span>
                      </p>
                    )}

                    {subscriptionStatus === "ACTIVE" ? (
                      <>
                        <button
                          onClick={cancelSubscription}
                          className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition duration-300 ease-in-out"
                        >
                          בטל מנוי
                        </button>
                        <p className="text-gray-600 mt-2 text-sm">
                          לחץ על הכפתור כדי לבטל את המנוי שלך.
                        </p>
                      </>
                    ) : subscriptionStatus === "CANCELED" ? (
                      <Link href="/#Pricing">
                        <span className="bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition duration-300 ease-in-out">
                          חדש את המנוי שלך
                        </span>
                      </Link>
                    ) : (
                      <Link href="/#Pricing">
                        <span className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition duration-300 ease-in-out">
                          הפעל מנוי
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
              אנא התחבר כדי להמשיך
            </h1>
            <Link href="/login">
              <span className="text-[#EF8354] text-lg">Login</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
