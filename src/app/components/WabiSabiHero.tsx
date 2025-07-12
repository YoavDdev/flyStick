"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import SubscriptionDetails from "./../api/SubscriptionDetails";
import new_main from "../../../public/new_main.png";
import new_mainPhone from "../../../public/new_mainPhone.png";

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
      {/* Background Image with Wabi-Sabi texture overlay (static version) */}
      <div
        className={`absolute inset-0 -z-10 h-full w-full object-cover transition-opacity ${
          visible ? "opacity-100" : "opacity-0"
        } hidden md:block`}
      >
        <Image
          src={new_main}
          alt="BoazMain"
          fill
          sizes="100vw"
          className="object-cover mt-20"
          priority
        />
      </div>

      {/* Background Image for Mobile with texture (static version) */}
      <div
        className={`absolute inset-0 -z-10 h-full w-full object-cover transition-opacity ${
          visible ? "opacity-100" : "opacity-0"
        } block md:hidden`}
      >
        <Image
          src={new_mainPhone}
          alt="BoazMain Mobile"
          fill
          sizes="100vw"
          className="object-cover mt-20"
          priority
        />
      </div>

      {/* Content container (static version) */}
      <div 
        className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56"
      >
        <div className="text-center">
          {/* Heading with Wabi-Sabi styling (static version) */}
          <h1 
            className="text-3xl font-bold tracking-tight text-white sm:text-6xl"
            style={{ 
              textShadow: "0 2px 4px rgba(0,0,0,0.2)",
              letterSpacing: "0.02em"
            }}
          >
            הסטודיו המקוון של בועז נחייסי
          </h1>
          
          {/* Subheading with Wabi-Sabi styling (static version) */}
          <p 
            className="mt-6 text-lg leading-8 text-[#F7F3EB] font-light max-w-lg mx-auto"
            style={{ 
              textShadow: "0 1px 2px rgba(0,0,0,0.1)",
            }} 
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
          </p>
          
          {/* CTA Button with Wabi-Sabi styling (static version) */}
          <div 
            className="mt-8 flex flex-col sm:flex-row items-center justify-center"
          >
            {loading ? (
              <p className="text-white opacity-80">טעינה...</p>
            ) : subscriptionStatus === "ACTIVE" ? (
              <Link href="/explore">
                <span
                  className="inline-block rounded-full bg-[#D5C4B7] px-8 py-4 text-lg text-[#3D3D3D] shadow-md hover:bg-[#B8A99C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8A99C] transition-all duration-300 ease-in-out border border-[#B8A99C]/30"
                >
                  חיפוש
                </span>
              </Link>
            ) : (
              <Link href="/register">
                <span
                  className={`inline-block rounded-full bg-[#D5C4B7] px-8 py-4 text-lg text-[#3D3D3D] shadow-md hover:bg-[#B8A99C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8A99C] transition-all duration-300 ease-in-out border border-[#B8A99C]/30 ${
                    visible ? "opacity-100" : "opacity-0"
                  }`}
                >
                  הרשמו כמנויים חדשים וקבלו 3 ימי נסיון חינם
                  </span>
              </Link>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default WabiSabiHero;
