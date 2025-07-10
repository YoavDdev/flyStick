"use client";

import { CheckIcon } from "@heroicons/react/20/solid";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Link from "next/link";
import toast from "react-hot-toast";
import SubscriptionDetails from "./../api/SubscriptionDetails";
import WabiSabiTexture from "./WabiSabiTexture";
import { standardEasing, staggerChildrenVariants } from "../styles/standardAnimations";
import { FloatingElement, BreathingElement, CursorResponsiveElement, InkFlowBorder, SectionTransition } from "../styles/wabiSabiMotion";

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
      {/* Wabi-Sabi texture background */}
      <WabiSabiTexture type="stone" opacity={0.06} animate={true} />
      
      {/* Asymmetrical decorative element with floating animation */}
      <FloatingElement 
        className="absolute -right-16 top-20 w-64 h-64 opacity-10"
        amplitude={7}
        duration={8}
      >
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <motion.path
            fill="#D9845E"
            d="M39.5,-65.3C50.2,-55.1,57.2,-42.1,63.4,-28.8C69.6,-15.5,74.9,-1.9,73.1,10.7C71.3,23.3,62.3,34.8,51.6,42.8C40.9,50.8,28.5,55.3,15.3,60.5C2.2,65.7,-11.7,71.7,-24.4,69.9C-37.1,68.1,-48.5,58.6,-57.4,47C-66.3,35.4,-72.6,21.7,-74.3,7.2C-76,-7.3,-73,-22.5,-65.3,-34.2C-57.6,-45.9,-45.2,-54,-32.5,-63.8C-19.8,-73.6,-6.6,-85.1,5.2,-83.3C17,-81.5,28.8,-75.5,39.5,-65.3Z"
            initial={{ pathLength: 0, rotate: 0 }}
            animate={{ 
              pathLength: 1, 
              rotate: -2,
              transition: { 
                pathLength: { duration: 2, ease: "easeInOut" },
                rotate: { duration: 25, ease: "linear", repeat: Infinity, repeatType: "reverse" }
              }
            }}
          />
        </svg>
      </FloatingElement>
      
      {/* Additional decorative element */}
      <FloatingElement 
        className="absolute -left-10 top-40 w-32 h-32 opacity-10"
        amplitude={5}
        duration={6.5}
        delay={1.2}
      >
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <motion.path
            fill="#B8A99C"
            d="M42.7,-65.4C53.9,-55.9,60.8,-41.5,65.8,-27.1C70.8,-12.7,73.9,1.7,71.2,15.3C68.5,28.9,60,41.8,48.5,51.7C37,61.7,22.5,68.8,6.7,72.3C-9.1,75.8,-26.2,75.7,-39.7,68.5C-53.2,61.3,-63.1,47,-69.8,31.4C-76.5,15.8,-80,-0.9,-76.2,-15.8C-72.4,-30.6,-61.3,-43.5,-48,-53.1C-34.7,-62.7,-19.2,-69,-2.8,-65.7C13.6,-62.4,31.5,-74.9,42.7,-65.4Z"
            initial={{ pathLength: 0, rotate: 0 }}
            animate={{ 
              pathLength: 1, 
              rotate: 5,
              transition: { 
                pathLength: { duration: 2.5, ease: "easeInOut" },
                rotate: { duration: 25, ease: "linear", repeat: Infinity, repeatType: "reverse" }
              }
            }}
          />
        </svg>
      </FloatingElement>
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div 
          className="mx-auto max-w-2xl lg:text-center mb-12"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            initial: { opacity: 0 },
            animate: { 
              opacity: 1,
              transition: { 
                staggerChildren: 0.2,
              }
            }
          }}
        >
          <motion.h2 
            className="text-base font-semibold leading-7 text-[#5C6A85]"
            variants={staggerChildrenVariants}
          >
            מחירים
          </motion.h2>
          <motion.p 
            className="mt-2 text-3xl font-bold tracking-tight text-[#B56B4A] sm:text-4xl"
            variants={staggerChildrenVariants}
          >
            הצטרפו למסע התנועה והריפוי
          </motion.p>
        </motion.div>
        
        <motion.div 
          className="mx-auto max-w-5xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
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
              
              <BreathingElement 
                scale={1.02} 
                duration={6} 
                className="mt-10 flex items-center gap-x-4">
                <h4 className="flex-none text-sm font-semibold leading-6 text-[#7D8FAF]">
                  מה זה כולל
                </h4>
                <div className="h-px flex-auto bg-[#D0C8B0]" />
              </BreathingElement>
              
              <ul
                role="list"
                className="mt-8 grid grid-cols-1 gap-4 text-sm leading-6 text-[#5D5D5D] sm:grid-cols-2 sm:gap-6"
              >
                {includedFeatures.map((feature, index) => (
                  <motion.li 
                    key={feature} 
                    className="flex gap-x-3"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ 
                      delay: index * 0.1,
                      duration: 0.5,
                      ease: "easeOut"
                    }}
                    viewport={{ once: true }}
                  >
                    <CheckIcon
                      className="h-6 w-5 flex-none text-[#8E9A7C]"
                      aria-hidden="true"
                    />
                    {feature}
                  </motion.li>
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
                          <motion.span
                            className="inline-block rounded-full bg-[#D5C4B7] px-8 py-4 text-lg text-[#3D3D3D] shadow-md hover:bg-[#B8A99C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8A99C] transition-all duration-300 ease-in-out border border-[#B8A99C]/30"
                            whileHover={{ 
                              y: -3,
                              boxShadow: "0 10px 15px rgba(0, 0, 0, 0.07), 0 15px 30px rgba(0, 0, 0, 0.1)"
                            }}
                            transition={{ 
                              duration: 0.5, 
                              ease: "easeOut" 
                            }}
                          >
                            חקור עכשיו
                          </motion.span>
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
                            <CursorResponsiveElement
                              sensitivity={15}
                              className="inline-block"
                            >
                              <motion.span
                                className="inline-block rounded-full bg-[#D5C4B7] px-8 py-4 text-lg text-[#3D3D3D] shadow-md hover:bg-[#B8A99C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8A99C] transition-all duration-300 ease-in-out border border-[#B8A99C]/30"
                                whileHover={{ 
                                  y: -3,
                                  boxShadow: "0 10px 15px rgba(0, 0, 0, 0.07), 0 15px 30px rgba(0, 0, 0, 0.1)"
                                }}
                                transition={{ 
                                  duration: 0.5, 
                                  ease: "easeOut" 
                                }}
                              >
                              התחל
                              </motion.span>
                            </CursorResponsiveElement>
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
        </motion.div>
      </div>
      
      {/* Asymmetrical decorative element - bottom left with floating animation */}
      <div className="absolute -left-16 bottom-20 w-64 h-64 opacity-10">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <motion.path
            fill="#7D8FAF"
            d="M45.3,-77.5C58.9,-69.5,70.3,-56.3,77.7,-41.6C85.1,-26.9,88.5,-10.7,86.6,4.8C84.7,20.2,77.5,34.9,67.8,47.1C58.1,59.3,45.9,69,32.1,74.8C18.3,80.6,2.9,82.5,-12.2,80.1C-27.3,77.8,-42.1,71.2,-54.8,61.3C-67.5,51.4,-78.1,38.2,-83.2,23.2C-88.3,8.1,-87.9,-8.8,-82.6,-23.7C-77.4,-38.6,-67.3,-51.5,-54.6,-59.8C-41.9,-68.1,-26.6,-71.8,-10.9,-72.3C4.8,-72.8,31.7,-85.5,45.3,-77.5Z"
            initial={{ pathLength: 0, rotate: 0 }}
            animate={{ 
              pathLength: 1, 
              rotate: 2,
              transition: { 
                pathLength: { duration: 2, ease: "easeInOut" },
                rotate: { duration: 25, ease: "linear", repeat: Infinity, repeatType: "reverse" }
              }
            }}
          />
        </svg>
      </div>
    </div>
  );
}
