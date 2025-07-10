"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import SubscriptionDetails from "./../api/SubscriptionDetails";
import new_main from "../../../public/new_main.png";
import new_mainPhone from "../../../public/new_mainPhone.png";
import WabiSabiTexture from "./WabiSabiTexture";
import { wabiSabiColors } from "../styles/wabiSabiTheme";
import { standardEasing, staggerChildrenVariants } from "../styles/standardAnimations";

const WabiSabiHero = () => {
  const [visible, setVisible] = useState(false);
  const { subscriptionStatus, loading } = SubscriptionDetails();

  useEffect(() => {
    // Set a delay to trigger the fade-in animation
    const delay = setTimeout(() => {
      setVisible(true);
    }, 500);

    // Clear the timeout to avoid memory leaks
    return () => clearTimeout(delay);
  }, []);

  return (
    <div className="relative isolate overflow-hidden pt-36 sm:pt-64 md:h-screen">
      {/* Background Image with Wabi-Sabi texture overlay */}
      <motion.div
        className={`absolute inset-0 -z-10 h-full w-full object-cover transition-opacity ${
          visible ? "opacity-100" : "opacity-0"
        } hidden md:block`}
        initial={{ scale: 1.05 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: standardEasing.gentle }}
      >
        <Image
          src={new_main}
          alt="BoazMain"
          layout="fill"
          className="object-cover mt-20"
          priority
        />
        <WabiSabiTexture type="paper" opacity={0.15} animate={true} />
      </motion.div>

      {/* Background Image for Mobile with texture */}
      <motion.div
        className={`absolute inset-0 -z-10 h-full w-full object-cover transition-opacity ${
          visible ? "opacity-100" : "opacity-0"
        } block md:hidden`}
        initial={{ scale: 1.05 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: standardEasing.gentle }}
      >
        <Image
          src={new_mainPhone}
          alt="BoazMain Mobile"
          layout="fill"
          className="object-cover mt-20"
          priority
        />
        <WabiSabiTexture type="paper" opacity={0.15} animate={true} />
      </motion.div>

      {/* Asymmetrical decorative element - Wabi-Sabi style */}
      <div className="absolute top-1/4 right-10 w-32 h-32 md:w-64 md:h-64 opacity-20 hidden md:block">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <motion.path
            fill={wabiSabiColors.clay.DEFAULT}
            d="M45.7,-58.2C58.9,-48.3,69.2,-33.5,73.2,-16.9C77.2,-0.3,74.9,18.1,66.4,32.6C57.9,47.1,43.2,57.7,27.1,64.9C11,72.1,-6.5,75.9,-22.6,71.3C-38.7,66.7,-53.4,53.7,-62.3,37.8C-71.2,21.9,-74.3,3.1,-70.9,-14.1C-67.5,-31.3,-57.6,-46.9,-44.1,-56.8C-30.6,-66.7,-13.6,-70.8,1.5,-72.7C16.6,-74.6,32.5,-68.2,45.7,-58.2Z"
            initial={{ pathLength: 0, rotate: 0 }}
            animate={{ 
              pathLength: 1, 
              rotate: 3,
              transition: { 
                pathLength: { duration: 2, ease: "easeInOut" },
                rotate: { duration: 20, ease: "linear", repeat: Infinity, repeatType: "reverse" }
              }
            }}
          />
        </svg>
      </div>

      {/* Content container with staggered animation */}
      <motion.div 
        className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56"
        initial="initial"
        animate="animate"
        variants={{
          initial: { opacity: 0 },
          animate: { 
            opacity: 1,
            transition: { 
              staggerChildren: 0.2,
              delayChildren: 0.3
            }
          }
        }}
      >
        <div className="text-center">
          {/* Heading with Wabi-Sabi styling */}
          <motion.h1 
            className="text-3xl font-bold tracking-tight text-white sm:text-6xl"
            variants={staggerChildrenVariants}
            style={{ 
              textShadow: "0 2px 4px rgba(0,0,0,0.2)",
              letterSpacing: "0.02em"
            }}
          >
            הסטודיו המקוון של בועז נחייסי
          </motion.h1>
          
          {/* Description with Wabi-Sabi styling */}
          <motion.p 
            className="mt-6 text-gray-700 sm:text-xl mx-5"
            variants={staggerChildrenVariants}
          >
            {subscriptionStatus === "ACTIVE" ? (
              <>
                <span className="text-white font-semibold"> ברוך הבא!</span>{" "}
                חקור אוסף עצום של שיעורים ותרגילים, שנבחרו בקפידה כדי לשפר את
                הקשר בין הגוף לנפש שלך. השג רווחה גבוהה יותר בעזרת טכניקות אימון
                מגוונות המותאמות לרמות קושי שונות, וכל זאת במקום אחד
              </>
            ) : (
              <>
                <span className="text-white ">לצלול אל אוסף עצום </span> נדיר של
                שיעורים ותרגולי גוף, שנבחרו בקפידה ומוגשים לכם בכדי לחזק בכם את
                הקשר בין הנפש לגוף ולהעצים את הרווחה האישית בעזרת טכניקות אימון
                מגוונות ורמות קושי מותאמות. אני מזמין אתכם להצטרף אל דרכי
                הייחודית להבין את החיים.
              </>
            )}
          </motion.p>
          
          {/* CTA Button with Wabi-Sabi styling */}
          <motion.div 
            className="mt-8 flex flex-col sm:flex-row items-center justify-center"
            variants={staggerChildrenVariants}
          >
            {loading ? (
              <p className="text-white opacity-80">טעינה...</p>
            ) : subscriptionStatus === "ACTIVE" ? (
              <Link href="/explore">
                <motion.span
                  className="inline-block rounded-full bg-[#D5C4B7] px-8 py-4 text-lg text-[#3D3D3D] shadow-md hover:bg-[#B8A99C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8A99C] transition-all duration-300 ease-in-out border border-[#B8A99C]/30"
                  whileHover={{ 
                    y: -3,
                    boxShadow: "0 10px 15px rgba(0, 0, 0, 0.07), 0 15px 30px rgba(0, 0, 0, 0.1)"
                  }}
                  transition={{ 
                    duration: 0.5, 
                    ease: standardEasing.gentle 
                  }}
                >
                  חיפוש
                </motion.span>
              </Link>
            ) : (
              <Link href="/register">
                <motion.span
                  className={`inline-block rounded-full bg-[#D5C4B7] px-8 py-4 text-lg text-[#3D3D3D] shadow-md hover:bg-[#B8A99C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8A99C] transition-all duration-300 ease-in-out border border-[#B8A99C]/30 ${
                    visible ? "opacity-100" : "opacity-0"
                  }`}
                  whileHover={{ 
                    y: -3,
                    boxShadow: "0 10px 15px rgba(0, 0, 0, 0.07), 0 15px 30px rgba(0, 0, 0, 0.1)"
                  }}
                  transition={{ 
                    duration: 0.5, 
                    ease: standardEasing.gentle 
                  }}
                >
                  הרשמו כמנויים חדשים וקבלו 3 ימי נסיון חינם
                  </motion.span>
              </Link>
            )}
          </motion.div>
        </div>
      </motion.div>
      
      {/* Subtle decorative element at bottom */}
      <div
        className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#D5C4B7] to-[#B3BBA3] opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>
    </div>
  );
};

export default WabiSabiHero;
