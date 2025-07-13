"use client";

import { CheckIcon } from "@heroicons/react/20/solid";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Link from "next/link";
import toast from "react-hot-toast";
import SubscriptionDetails from "./../api/SubscriptionDetails";

const includedFeatures = [
  "מאות שעות של שיעורים מובנים ומסודרים לפי נושאים, תרגילים, הרצאות וסדנאות הכשרה בנושאים רבים (צוואר, גב תחתון, נשימה, רצפת אגן, הריון ועוד). ",
  "מאגר עצום ומקיף של כלים ורעיונות להדרכת שיעורים ותפיסות חדשות של הגוף.",
  "שיעורים במגוון שיטות כמו קונטרולוג׳י, פילאטיס מזרן, מכשירים, כסא, קיר, אביזרים, תודעה ופלייסטיק.",
  "מגוון רמות קושי באימונים, ארוכים וקצרים.",
];

export default function WabiSabiPricing() {
  const { data: session } = useSession();
  const { subscriptionStatus, loading } = SubscriptionDetails();

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
    <div id="Pricing" className="relative overflow-hidden py-16 sm:py-24">
      {/* Decorative background elements */}
      <div className="absolute -right-32 top-20 w-72 h-72 rounded-full bg-[#D5C4B7]/10 blur-xl"></div>
      <div className="absolute -left-20 bottom-40 w-64 h-64 rounded-full bg-[#B8A99C]/10 blur-lg"></div>
      <div className="absolute inset-0 bg-[url('/paper-texture.png')] opacity-[0.03] pointer-events-none"></div>
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <motion.div
          className="mx-auto max-w-2xl lg:text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          {/* Decorative element above heading */}
          <motion.div 
            className="w-16 h-1 bg-[#B56B4A]/30 rounded-full mx-auto mb-6"
            initial={{ width: 0 }}
            whileInView={{ width: 64 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.8 }}
          />
          
          <h2 className="text-base font-semibold leading-7 text-[#5C6A85]">
            מחירים
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-[#B56B4A] sm:text-4xl">
            הצטרפו למסע התנועה והריפוי
          </p>
        </motion.div>
        
        <motion.div 
          className="mx-auto max-w-5xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className="mx-auto max-w-2xl rounded-tl-3xl rounded-br-3xl rounded-tr-xl rounded-bl-xl overflow-hidden lg:mx-0 lg:flex lg:max-w-none shadow-xl">
            {/* Left side - Features with enhanced styling */}
            <div className="p-10 sm:p-12 lg:flex-auto bg-gradient-to-br from-[#FFFCF7] to-[#F7F3EB] border border-[#D0C8B0]/30">
              <h3 className="text-2xl font-bold tracking-tight text-[#B56B4A]">
                מנוי לסטודיו אונליין של בועז נחייסי
              </h3>

              {/* Decorative divider */}
              <div className="w-16 h-1 bg-[#D5C4B7] rounded-full my-6"></div>

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
                className="mt-8 grid grid-cols-1 gap-5 text-sm leading-6 text-[#5D5D5D] sm:grid-cols-2 sm:gap-6"
              >
                {includedFeatures.map((feature, index) => (
                  <motion.li 
                    key={feature} 
                    className="flex gap-x-3 items-start p-3 rounded-lg hover:bg-[#F0E9DF]/50 transition-colors duration-300"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <CheckIcon
                      className="h-6 w-5 flex-none text-[#8E9A7C] mt-0.5"
                      aria-hidden="true"
                    />
                    <span>{feature}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Right side - Pricing with enhanced styling */}
            <div className="p-10 sm:p-12 lg:flex-shrink-0 lg:border-l lg:border-[#D0C8B0]/30 lg:p-12 bg-gradient-to-br from-[#F7F3EB] to-[#F0E9DF]">
              <div className="text-center">
                <p className="text-base font-semibold text-[#5C6A85]">
                  מחיר חודשי
                </p>
                <p className="mt-4 flex items-baseline justify-center gap-x-2">
                  <span className="text-5xl font-bold tracking-tight text-[#3D3D3D]">
                    ₪49
                  </span>
                  <span className="text-sm font-semibold leading-6 tracking-wide text-[#5D5D5D]">
                    לחודש
                  </span>
                </p>
                
                {/* Decorative divider */}
                <div className="w-12 h-0.5 bg-[#D5C4B7] rounded-full mx-auto my-6"></div>
                
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
        </motion.div>
      </div>
    </div>
  );
}
