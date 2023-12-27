"use client";
import { CheckIcon } from "@heroicons/react/20/solid";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import SubscriptionDetails from "./../api/SubscriptionDetails";

const prisma = new PrismaClient();

const includedFeatures = [
  "Hundreds of hours of lessons, exercises, and lectures",
  "A vast pool of tools and ideas for lessons and exercises",
  "Exercises in a variety of methods (pleistic, controlology, pilates)",
  "Different difficulty levels",
];

export default function Pricing() {
  const { data: session } = useSession();
  const { subscriptionStatus, loading } = SubscriptionDetails();

  const clientId = process.env.PAYPAL_CLIENT_ID;

  const saveOrderInDatabase = async (orderId: any, email: any) => {
    try {
      const response = await fetch("/api/add-subscriptionId", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId, email }),
      });

      const data = await response.json();

      // if (data.success) {
      //   toast.success(data.message);
      // } else {
      //   toast.error(data.message);
      // }
    } catch (error) {
      console.error("Error saving order ID:", error);
      // toast.error("Failed to save order ID. Please try again.");
    }
  };

  return (
    <div id="Pricing" className="bg-white p-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-3xl ring-1 ring-gray-200 lg:mx-0 lg:flex lg:max-w-none">
          <div className="p-8 sm:p-10 lg:flex-auto">
            <h3 className="text-2xl font-bold tracking-tight text-[#EF8354]">
              Boaz Nahaisi&apos;s Online Studio Membership
            </h3>
            <p className="mt-6 text-base leading-7 text-gray-600">
              A vast pool of knowledge that will allow you to connect with your
              body in ways you&apos;ve never known before.
            </p>
            <div className="mt-10 flex items-center gap-x-4">
              <h4 className="flex-none text-sm font-semibold leading-6 text-[#EF8354]">
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
                    className="h-6 w-5 flex-none text-[#EF8354]"
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
                {subscriptionStatus === "ACTIVE" ? (
                  <>
                    <p className="mt-3 text-lg text-green-600 font-semibold">
                      You are subscribed!
                    </p>
                    <div className="mt-5 flex items-center justify-center gap-x-6">
                      <Link
                        href="/explore"
                        className="rounded-full bg-[#2D3142] px-6 py-3 text-lg text-white shadow-lg hover:bg-[#4F5D75] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      >
                        Explore Now
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    {session?.user ? (
                      <div className="mt-6">
                        <PayPalScriptProvider
                          options={{
                            clientId: process.env.PAYPAL_CLIENT_ID || "",
                            components: "buttons",
                            intent: "subscription",
                            vault: true,
                          }}
                        >
                          <PayPalButtons
                            style={{
                              color: "gold",
                              shape: "rect",
                              height: 50,
                              label: "subscribe",
                            }}
                            createSubscription={(data, actions) => {
                              return actions.subscription
                                .create({
                                  plan_id: "P-3JL116175C333194WMWGDHEI",
                                })
                                .then((orderId) => {
                                  return orderId;
                                })
                                .catch((err) => {
                                  console.error(err);
                                  toast.error(
                                    "Subscription creation failed. Please try again.",
                                  );
                                  return err;
                                });
                            }}
                            onApprove={(data, actions) => {
                              return new Promise((resolve) => {
                                if (session.user) {
                                  saveOrderInDatabase(
                                    data.subscriptionID,
                                    session.user.email,
                                  );
                                }
                                resolve(); // Resolve the Promise to satisfy the type requirement
                              });
                            }}
                          />
                        </PayPalScriptProvider>
                      </div>
                    ) : (
                      <div className="mt-5 flex items-center justify-center gap-x-6">
                        <Link
                          href="/register"
                          className="rounded-full bg-[#2D3142] px-6 py-3 text-lg text-white shadow-lg hover:bg-[#4F5D75] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                          Get started
                        </Link>
                      </div>
                    )}
                  </>
                )}
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
