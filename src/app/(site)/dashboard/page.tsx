"use client";

import { useSession } from "next-auth/react";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import DashboardCard from "../../components/DashboardCard";
import axios from "axios";
import Image from "next/image";
import Dashboardpic from "../../../../public/Dashboardpic.png";
import ConvertkitEmailForm from "../../components/NewsletterSignUpForm";

const DashboardPage = () => {
  const { data: session } = useSession();
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [subscriptionId, setSubscriptionId] = useState(null);

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
          setSubscriptionId(subscriptionId); // Add this line to set the subscriptionId

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
          "האם אתה בטוח שברצונך לבטל את המנוי שלך?",
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
    <div className="relative min-h-screen">
      {/* Background Image */}
      <div className="absolute inset-0 z-[-1]">
        <Image
          src={Dashboardpic}
          layout="fill"
          objectFit="cover"
          quality={100}
          alt="BoazMain"
        />
      </div>

      {/* Main Content */}
      <div className="relative flex flex-col items-center justify-start pt-20 sm:pt-60 px-4">
        {session?.user ? (
          <div className="bg-white bg-opacity-70 w-full max-w-screen-md p-8 rounded-lg shadow-lg">
            {/* Welcome Message */}
            <h2 className="text-3xl font-semibold text-[#EF8354] mb-4 capitalize text-center">
              ברוך הבא, {session.user.name}!
            </h2>
            <p className="text-lg text-gray-700 text-center mb-10">
              פה תמצאו את כל מה שאתם צריכים לדעת על המנוי.
            </p>

            {/* Payment Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-[#2D3142] mb-4 text-center">
                אזור תשלום
              </h3>

              {loading ? (
                <p className="text-center text-gray-600 mb-6">טוען נתונים...</p>
              ) : (
                <>
                  {/* Subscription Status Display */}
                  {subscriptionStatus !== null && (
                    <p className="text-center text-gray-600 mb-6">
                      סטטוס מנוי:{" "}
                      <span
                        className={
                          subscriptionStatus ? "text-green-500" : "text-red-500"
                        }
                      >
                        {subscriptionStatus}
                      </span>
                    </p>
                  )}

                  {/* Subscription Messages */}
                  <div className="mb-6 text-center text-gray-700">
                  {(subscriptionStatus === "ACTIVE" || subscriptionId === "Admin") && (
  <>
    <p>
      כאן תוכלו לנהל את המנוי שלכם, לחדש או לבטל בכל שלב.
      במידה ובחרתם להנות מתקופת הנסיון של 3 ימים, הקפידו
      לסיים את המנוי לפני תום תקופת הניסיון. במידה והנכם
      מתלבטים, או זקוקים לעזרה והכוונה{" "}
      <Link
        href="/navigation"
        className="text-blue-600 font-bold underline"
      >
        לחץ כאן
      </Link>
      . שימו לב, סיום מנוי מאפשר להנות מתכני הסטודיו עד
      לתום תקופת החיוב.
    </p>
    <button
      onClick={cancelSubscription}
      className="bg-red-500 text-white py-2 px-6 mt-4 rounded-md hover:bg-red-600 transition duration-300 ease-in-out"
    >
      בטל מנוי
    </button>
  </>
)}


                    {subscriptionStatus === "PENDING_CANCELLATION" && (
                      <>
                        <p>
                          המנוי שלך נמצא בתהליך ביטול. תוכל להמשיך להנות מהתכנים
                          שלנו עד תום תקופת החיוב הנוכחית. במידה ואתה מעוניין
                          להפסיק את תהליך הביטול ולהמשיך במנוי, צור איתנו קשר
                          ב&aposצרו קשר&apos;.
                        </p>
                      </>
                    )}

                    {subscriptionStatus === "CANCELLED" && (
                      <>
                        <p>
                          המנוי שלך בוטל בהצלחה. לחידוש המנוי לחצו על הכפתור
                          מטה.
                        </p>
                        <Link href="/#Pricing">
                          <span className="bg-slate-500 hover:bg-slate-700 text-white py-2 px-6 mt-4 rounded-md transition duration-300 ease-in-out inline-block">
                            חדש את המנוי שלך
                          </span>
                        </Link>
                      </>
                    )}

                    {subscriptionStatus === null && (
                      <>
                        <p>
                          אין לך מנוי פעיל. להצטרפות למנוי חדש ולהנות מתכני
                          הסטודיו, לחצו על הכפתור מטה.
                        </p>
                        <Link href="/#Pricing">
                          <span className=" text-white py-2 px-6 mt-4 rounded-md ounded-md bg-slate-500 hover:bg-slate-700 transition duration-300 ease-in-out inline-block ">
                            הפעל מנוי
                          </span>
                        </Link>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
            {/* Newsletter Message */}
            <div className="bg-[#f9f9f9] border border-slate-500 rounded-lg p-4 mb-6 mt-6 shadow-md">
              <p className="text-center text-[#2D3142] font-semibold mb-2">
                אנא הקפידו להרשם לניוזלטר!
              </p>
              <p className="text-center text-gray-600">
                כדי לקבל הסברים שימושיים שיעזרו לכם להתנהל בסטודיו ולדעת מה
                מתאים עבורכם ומדי פעם תקבלו עדכון על סרט חשוב, המלצה, הרצאה חדשה
                וכו&apos;.
              </p>

              {/* Newsletter Subscription Form */}
              <div className="flex justify-center">
                <ConvertkitEmailForm />
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
