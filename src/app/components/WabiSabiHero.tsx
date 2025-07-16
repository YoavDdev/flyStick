"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import SubscriptionDetails from "./../api/SubscriptionDetails";
import new_main from "../../../public/new_main.png";
import new_mainPhone from "../../../public/new_mainPhone.png";
import * as FramerMotion from "framer-motion";
const { motion, useScroll, useTransform } = FramerMotion;

const WabiSabiHero = () => {
  const [visible, setVisible] = useState(false);
  const { subscriptionStatus, loading } = SubscriptionDetails();
  const { scrollY } = useScroll();
  
  // Parallax effect for background images
  const backgroundY = useTransform(scrollY, [0, 500], [0, 150]);
  
  useEffect(() => {
    // Set a delay to trigger the fade-in animation
    const delay = setTimeout(() => {
      setVisible(true);
    }, 300);

    // Clear the timeout to avoid memory leaks
    return () => clearTimeout(delay);
  }, []);

  return (
    <div className="relative isolate overflow-hidden pt-0 md:h-screen flex items-center justify-center min-h-[85vh] sm:min-h-[90vh]">
      {/* Background Image with Wabi-Sabi texture overlay and parallax effect */}
      <motion.div
        className={`absolute inset-0 -z-10 h-full w-full object-cover transition-opacity ${
          visible ? "opacity-100" : "opacity-0"
        } hidden md:block`}
        style={{ y: backgroundY }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
      >
        <Image
          src={new_main}
          alt="BoazMain"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 bg-black/20 mix-blend-overlay"></div>
      </motion.div>

      {/* Background Image for Mobile with texture and animation */}
      <motion.div
        className={`absolute inset-0 -z-10 h-full w-full object-cover block md:hidden`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
      >
        <Image
          src={new_mainPhone}
          alt="BoazMain Mobile"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 bg-black/20 mix-blend-overlay"></div>
      </motion.div>

      {/* Content container with improved positioning */}
      <motion.div 
        className="mx-auto max-w-2xl py-8 sm:py-16 md:py-24 lg:py-32 px-3 sm:px-6 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <div className="text-center">
          {/* Heading with Wabi-Sabi styling and motion */}
          <motion.h1 
            className="text-3xl sm:text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white"
            style={{ 
              textShadow: "0 2px 4px rgba(0,0,0,0.3)",
              letterSpacing: "0.02em"
            }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            הסטודיו המקוון של בועז נחייסי
          </motion.h1>
          
          {/* Subheading with Wabi-Sabi styling and motion */}
          <motion.p 
            className="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-[#F7F3EB] font-light max-w-lg mx-auto px-1 sm:px-0"
            style={{ 
              textShadow: "0 1px 3px rgba(0,0,0,0.2)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
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
          
          {/* CTA Button with Wabi-Sabi styling and motion */}
          <motion.div 
            className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            {loading ? (
              <p className="text-white opacity-80">טעינה...</p>
            ) : subscriptionStatus === "ACTIVE" ? (
              <Link href="/explore" className="w-full sm:w-auto">
                <span
                  className="inline-block rounded-full bg-[#D5C4B7] px-5 sm:px-8 py-3 sm:py-4 text-base sm:text-lg text-[#3D3D3D] shadow-md hover:bg-[#B8A99C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8A99C] transition-all duration-300 ease-in-out border border-[#B8A99C]/30 w-full sm:w-auto text-center font-medium"
                >
                  חיפוש
                </span>
              </Link>
            ) : (
              <Link href="/register" className="w-full sm:w-auto">
                <span
                  className="inline-block rounded-full bg-[#D5C4B7] px-5 sm:px-8 py-3 sm:py-4 text-base sm:text-lg text-[#3D3D3D] shadow-md hover:bg-[#B8A99C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8A99C] transition-all duration-300 ease-in-out border border-[#B8A99C]/30 w-full sm:w-auto text-center font-medium"
                >
                  הרשמו כמנויים חדשים וקבלו 3 ימי נסיון חינם
                </span>
              </Link>
            )}
          </motion.div>
        </div>
      </motion.div>

    </div>
  );
};

export default WabiSabiHero;
