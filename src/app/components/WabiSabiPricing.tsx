"use client";

import { CheckIcon } from "@heroicons/react/20/solid";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Link from "next/link";
import toast from "react-hot-toast";
import SubscriptionDetails from "./../api/SubscriptionDetails";

const includedFeatures = [
  "מאות שיעורים מקצועיים בנושאי תנועה, נשימה, יציבה וריפוי",
  "כלים מתקדמים לשיפור הגוף והנפש לכל רמה ומגדר",
  "שיטות מגוונות: קונטרולוג׳י, פילאטיס, תודעה ופלייסטיק",
  "אימונים קצרים וארוכים המותאמים לזמן שלך",
  "שמירת סרטונים מועדפים והמשך צפייה מהנקודה האחרונה",
  "תמיכה אישית וקהילה מקצועית לליווי מלא",
  "עדכונים ותכונות חדשות באופן קבוע",
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
    <div id="Pricing" className="relative overflow-hidden py-4 sm:py-6 md:py-12">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="mx-auto max-w-2xl lg:text-center mb-8 sm:mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          {/* Decorative element above heading */}
          <motion.div 
            className="w-12 sm:w-16 h-1 bg-[#B56B4A]/30 rounded-full mx-auto mb-4 sm:mb-6"
            initial={{ width: 0 }}
            whileInView={{ width: 48, transition: { delay: 0.5, duration: 0.8 } }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.8 }}
          />
          
          <h2 className="text-base font-semibold leading-6 sm:leading-7 text-[#5C6A85]">
            מנוי מיוחד
          </h2>
          <p className="mt-2 text-xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#B56B4A]">
            הצטרפו למסע התנועה והריפוי שלכם
          </p>
          <p className="mt-3 sm:mt-4 text-sm sm:text-lg text-[#5D5D5D] max-w-xl mx-auto px-1 sm:px-0">
            גלו את הדרך לחיבור עמוק עם הגוף והנפש שלכם, בין אם אתם גברים או נשים, מתחילים או מתקדמים
          </p>
        </motion.div>
        
        <motion.div 
          className="mx-auto max-w-5xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className="mx-auto max-w-2xl rounded-tl-2xl sm:rounded-tl-3xl rounded-br-2xl sm:rounded-br-3xl rounded-tr-lg sm:rounded-tr-xl rounded-bl-lg sm:rounded-bl-xl overflow-hidden lg:mx-0 lg:flex lg:max-w-none shadow-xl border border-[#D5C4B7]/30">
            {/* Left side - Features with enhanced styling */}
            <div className="p-4 sm:p-8 md:p-10 lg:p-12 lg:flex-auto bg-gradient-to-br from-[#FFFCF7] to-[#F7F3EB] border border-[#D0C8B0]/30">
              <h3 className="text-lg sm:text-2xl font-bold tracking-tight text-[#B56B4A]">
                מנוי לסטודיו אונליין של בועז נחייסי
              </h3>
              <p className="text-xs sm:text-sm text-[#8E9A7C] mt-1">לכל אחד ואחת מכם</p>

              {/* Decorative divider */}
              <div className="w-12 sm:w-16 h-1 bg-[#D5C4B7] rounded-full my-4 sm:my-6"></div>

              <p className="mt-6 text-base leading-7 text-[#3D3D3D]">
                מאגר עצום של ידע שיאפשר לך להתחבר לגופך, להעמיק את הבנתך הסומטית
                ולהעשיר את הידע שלך באנטומיה יישומית. בין אם אתה מורה המעוניין להעשיר את השיעורים שלך
                או מתאמנת המבקשת להעמיק את החיבור לגופך, תמצאו כאן את כל מה שאתם צריכים למסע האישי שלכם.
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
            <div className="p-10 sm:p-12 lg:flex-shrink-0 lg:border-l lg:border-[#D0C8B0]/30 lg:p-12 bg-gradient-to-br from-[#F7F3EB] to-[#F0E9DF] relative">
              {/* Decorative elements */}
              <div className="absolute top-6 right-6 w-16 h-16 opacity-10">
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#B56B4A" strokeWidth="1" strokeDasharray="5,3" />
                </svg>
              </div>
              <div className="absolute bottom-6 left-6 w-12 h-12 opacity-10">
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20,20 Q40,5 60,20 T80,40 T60,60 T40,80 T20,60 Z" fill="none" stroke="#B56B4A" strokeWidth="1" />
                </svg>
              </div>
              
              <motion.div 
                className="text-center"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="relative inline-block">
                  <p className="text-base font-semibold text-[#5C6A85] bg-[#F7F3EB] px-4 relative z-10">
                    מחיר חודשי מיוחד
                  </p>
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-[#D5C4B7] -z-0"></div>
                </div>
                
                <motion.div 
                  className="mt-6 bg-[#F7F3EB] p-6 rounded-lg border border-[#D5C4B7]/40 shadow-sm relative overflow-hidden"
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {/* Decorative corner */}
                  <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#D5C4B7]/20 transform rotate-45 translate-x-8 -translate-y-8"></div>
                  </div>
                  
                  <div className="flex items-baseline justify-center gap-x-2">
                    <span className="text-6xl font-bold tracking-tight text-[#B56B4A]">
                      ₪220
                    </span>
                    <span className="text-lg font-semibold leading-6 tracking-wide text-[#5D5D5D]">
                      לחודש
                    </span>
                  </div>
                  
                  <p className="mt-2 text-sm text-[#8E9A7C] font-medium">
                    השקעה בבריאות הגוף והנפש שלכם
                  </p>
                  
                  <div className="w-16 h-1 bg-[#D5C4B7]/60 rounded-full mx-auto my-4"></div>
                  
                  <div className="mt-3 p-3 bg-[#FFFCF7] rounded-lg border border-[#D5C4B7]/30">
                    <p className="text-sm leading-6 text-[#5D5D5D]">
                      <span className="font-medium text-[#B56B4A]">3 ימי נסיון חינם</span> - התחילו את המסע שלכם ללא התחייבות
                    </p>
                  </div>
                </motion.div>

                {subscriptionStatus === "ACTIVE" ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <p className="mt-5 text-lg text-[#8E9A7C] font-semibold">
                      את/ה כבר במנוי!
                    </p>
                    <div className="mt-6 flex items-center justify-center">
                      <Link href="/explore">
                        <motion.span
                          className="inline-block rounded-full bg-[#D5C4B7] px-8 py-4 text-lg text-[#3D3D3D] shadow-md hover:bg-[#B8A99C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8A99C] transition-all duration-300 ease-in-out border border-[#B8A99C]/30 relative overflow-hidden group"
                          whileHover={{ scale: 1.03 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <span className="relative z-10">חקרו עכשיו</span>
                          <span className="absolute inset-0 bg-[#B8A99C] transform scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100 z-0"></span>
                        </motion.span>
                      </Link>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    {session?.user ? (
                      <motion.div 
                        className="mt-6"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                      >
                        {/* Custom payment buttons instead of default PayPal */}
                        <div className="space-y-4">
                          <motion.button
                            onClick={() => {
                              // Here we would trigger the PayPal subscription flow
                              // For now, we'll just show the PayPal provider when this button is clicked
                              document.getElementById('paypal-button-container')?.classList.remove('hidden');
                              document.getElementById('payment-buttons')?.classList.add('hidden');
                            }}
                            className="w-full rounded-lg bg-[#B56B4A] px-6 py-4 text-center text-lg font-medium text-white shadow-md hover:bg-[#A25B3A] transition-all duration-300 ease-in-out border border-[#B56B4A]/30 relative overflow-hidden group"
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                          >
                            <span className="relative z-10 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              הצטרפו עכשיו עם כרטיס אשראי
                            </span>
                          </motion.button>
                          
                          <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-[#D5C4B7]/30"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                              <span className="px-2 bg-[#F0E9DF] text-[#5D5D5D]">או</span>
                            </div>
                          </div>
                          
                          <motion.button
                            onClick={() => {
                              // Here we would trigger the PayPal subscription flow
                              document.getElementById('paypal-button-container')?.classList.remove('hidden');
                              document.getElementById('payment-buttons')?.classList.add('hidden');
                            }}
                            className="w-full rounded-lg bg-[#F7F3EB] px-6 py-4 text-center text-lg font-medium text-[#3D3D3D] shadow-md hover:bg-[#D5C4B7] transition-all duration-300 ease-in-out border border-[#D5C4B7] relative overflow-hidden group"
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                          >
                            <span className="relative z-10 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="#3D3D3D">
                                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                              </svg>
                              שלמו באמצעות PayPal
                            </span>
                          </motion.button>
                        </div>
                        
                        {/* Hidden PayPal buttons that will be shown when custom buttons are clicked */}
                        <div id="paypal-button-container" className="mt-4 hidden">
                          <div className="bg-[#F7F3EB] p-4 rounded-lg border border-[#D5C4B7]/40 mb-4">
                            <p className="text-sm text-[#5D5D5D] mb-2">בחרו את אמצעי התשלום המועדף עליכם:</p>
                          </div>
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
                                color: "blue",
                                shape: "pill",
                                height: 55,
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
                                toast.success("המנוי נרכש בהצלחה!");
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
                          
                          <button 
                            onClick={() => {
                              document.getElementById('paypal-button-container')?.classList.add('hidden');
                              document.getElementById('payment-buttons')?.classList.remove('hidden');
                            }}
                            className="w-full mt-3 text-sm text-[#5D5D5D] hover:text-[#B56B4A] transition-colors duration-200"
                          >
                            חזרה לאפשרויות תשלום
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        className="mt-6"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                      >
                        <Link href="/register">
                          <motion.button
                            className="w-full rounded-lg bg-[#B56B4A] px-6 py-4 text-center text-lg font-medium text-white shadow-md hover:bg-[#A25B3A] transition-all duration-300 ease-in-out border border-[#B56B4A]/30 relative overflow-hidden group"
                            whileHover={{ scale: 1.03 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                          >
                            <span className="relative z-10">הירשמו והתחילו את המסע</span>
                            <span className="absolute inset-0 bg-[#A25B3A] transform scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100 z-0"></span>
                          </motion.button>
                        </Link>
                      </motion.div>
                    )}
                  </>
                )}
                
                <motion.div
                  className="mt-6"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <p className="text-xs leading-5 text-[#5D5D5D]">
                    המנוי מתחדש אוטומטית מדי חודש. ניתן לבטל בכל עת ללא התחייבות.
                  </p>
                  <div className="mt-4 flex items-center justify-center space-x-2 rtl:space-x-reverse">
                    <span className="w-2 h-2 rounded-full bg-[#D5C4B7]"></span>
                    <span className="w-2 h-2 rounded-full bg-[#B8A99C]"></span>
                    <span className="w-2 h-2 rounded-full bg-[#D5C4B7]"></span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
