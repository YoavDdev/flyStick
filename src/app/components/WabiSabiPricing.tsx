"use client";

import { CheckIcon } from "@heroicons/react/20/solid";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useSession } from "next-auth/react";
// Removed framer-motion import
import Link from "next/link";
import toast from "react-hot-toast";
import SubscriptionDetails from "./../api/SubscriptionDetails";

// Removed standardAnimations import
// Removed wabiSabiMotion imports

const includedFeatures = [
  "מאות שעות של שיעורים מובנים ומסודרים לפי נושאים, תרגילים, הרצאות וסדנאות הכשרה בנושאים רבים (צוואר, גב תחתון, נשימה, רצפת אגן, הריון ועוד). ",
  "מאגר עצום ומקיף של כלים ורעיונות להדרכת שיעורים ותפיסות חדשות של הגוף.",
  "שיעורים במגוון שיטות כמו קונטרולוג׳י, פילאטיס מזרן, מכשירים, כסא, קיר, אביזרים, תודעה ופלייסטיק.",
  "מגוון רמות קושי באימונים, ארוכים וקצרים.",
];

export default function WabiSabiPricing() {
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
    } catch (error) {
      console.error("Error saving order ID:", error);
    }
  };

  return (
    <div id="Pricing" className="relative bg-[#F7F3EB] py-16 sm:py-24 overflow-hidden">
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div
          className="mx-auto max-w-2xl lg:text-center mb-12"
        >
          <h2 
            className="text-base font-semibold leading-7 text-[#5C6A85]"
          >
            מחירים
          </h2>
          <p 
            className="mt-2 text-3xl font-bold tracking-tight text-[#B56B4A] sm:text-4xl"
          >
            הצטרפו למסע התנועה והריפוי
          </p>
        </div>
        
        <div 
          className="mx-auto max-w-5xl"
        >
          <div className="mx-auto max-w-2xl rounded-tl-2xl rounded-br-2xl rounded-tr-lg rounded-bl-lg overflow-hidden lg:mx-0 lg:flex lg:max-w-none">
            {/* Left side - Features */}
            <div className="p-8 sm:p-10 lg:flex-auto bg-[#FFFCF7] border border-[#D0C8B0]/30">
              <h3 className="text-2xl font-bold tracking-tight text-[#B56B4A]">
                מנוי לסטודיו אונליין של בועז נחייסי
              </h3>

              <p className="mt-6 text-base leading-7 text-[#3D3D3D]">
                מאגר עצום של ידע שיאפשר לך להתחבר לגופך, להעמיק את הבנתך הסומטית
                ולהעשיר את הידע שלך באנטומיה יישומית וכיצד להביא את התובנות הללו
                לשיעור עם מתאמנים בכל הרמות.
              </p>
              
              <div className="mt-10 flex items-center gap-x-4">
                <h4 className="flex-none text-sm font-semibold leading-6 text-[#7D8FAF]">
                  מה זה כולל
                </h4>
                <div className="h-px flex-auto bg-[#D0C8B0]" />
              </div>
              
              <ul
                role="list"
                className="mt-8 grid grid-cols-1 gap-4 text-sm leading-6 text-[#5D5D5D] sm:grid-cols-2 sm:gap-6"
              >
                {includedFeatures.map((feature, index) => (
                  <li 
                    key={feature} 
                    className="flex gap-x-3"
                  >
                    <CheckIcon
                      className="h-6 w-5 flex-none text-[#8E9A7C]"
                      aria-hidden="true"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Right side - Pricing */}
            <div className="p-8 sm:p-10 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0 bg-[#E5DFD0]">
              <div className="rounded-3xl p-8 ring-1 ring-[#D5C4B7] bg-white/80 shadow-lg backdrop-blur-sm">
                <div className="mx-auto max-w-xs px-8">
                  <p className="text-base font-semibold text-[#5C6A85]">
                    מנוי חודשי מתחדש
                  </p>
                  <p className="mt-6 flex items-baseline justify-center gap-x-2">
                    <span className="text-5xl font-bold tracking-tight text-[#3D3D3D]">
                      ₪220
                    </span>
                    <span className="text-sm font-semibold leading-6 tracking-wide text-[#5D5D5D]">
                      לחודש
                    </span>
                  </p>
                  <p className="mt-3 text-sm leading-6 text-[#5D5D5D]">
                    3 ימי נסיון חינם (החיוב הראשון
                    יחל באופן אוטומטי אלא אם ביטלתם לפני תום תקופת הנסיון).
                  </p>

                  {subscriptionStatus === "ACTIVE" ? (
                    <>
                      <p className="mt-3 text-lg text-[#8E9A7C] font-semibold">
                        אתה כבר מנוי!
                      </p>
                      <div className="mt-8 flex items-center justify-center">
                        <Link href="/explore">
                          <span
                            className="inline-block rounded-full bg-[#D5C4B7] px-8 py-4 text-lg text-[#3D3D3D] shadow-md hover:bg-[#B8A99C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8A99C] transition-all duration-300 ease-in-out border border-[#B8A99C]/30"
>
                            חקור עכשיו
                          </span>
                        </Link>
                      </div>
                    </>
                  ) : (
                    <>
                      {session?.user ? (
                        <div className="mt-8 relative">
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
                        <div className="mt-8 flex items-center justify-center">
                          <Link href="/register">
                            <button
                              className="block w-full rounded-full bg-[#D5C4B7] px-3 py-4 text-center text-lg font-semibold text-[#3D3D3D] shadow-md hover:bg-[#B8A99C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8A99C] transition-all duration-300 ease-in-out border border-[#B8A99C]/30"
                            >
                              התחל
                            </button>
                          </Link>
                        </div>
                      )}
                    </>
                  )}
                  <p className="mt-6 text-xs leading-5 text-[#5D5D5D]">
                    המנוי מתחדש אוטומטית מדי חודש. ניתן לבטל בכל עת.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
