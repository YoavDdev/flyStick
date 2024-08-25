"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import SubscriptionDetails from "./../api/SubscriptionDetails";
import new_main from "../../../public/new_main.png";

const Hero = () => {
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
      <div
        className={`absolute inset-0 -z-10 h-full w-full object-cover transition-opacity ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        <Image
          src={new_main}
          alt="BoazMain"
          layout="fill"
          className="object-cover mt-20"
          priority
        />
      </div>
      <div
        className={`absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80`}
        aria-hidden="true"
      >
        <div />
      </div>
      <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56 ">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-6xl">
            הסטודיו המקוון של בועז נחייסי
          </h1>
          <p className="mt-6 text-gray-700 sm:text-xl mx-5">
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
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-center transition-all duration-500 ease-in-out">
            {loading ? (
              <p>טעינה...</p>
            ) : subscriptionStatus === "ACTIVE" ? (
              <Link
                href="/explore"
                className="rounded-full bg-[#2D3142] px-6 py-3 text-lg text-white shadow-lg hover:bg-[#4F5D75] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-transform transform hover:scale-105"
              >
                חיפוש
              </Link>
            ) : (
              <Link
                href="/register"
                className={`rounded-full bg-[#2D3142] px-6 py-3 text-lg text-white shadow-lg hover:bg-[#4F5D75] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-opacity transform hover:scale-105 ${
                  visible ? "opacity-100" : "opacity-0"
                }`}
              >
                לרישום לחצו כאן וקבל 3 ימי נסיון חינם
              </Link>
            )}
          </div>
        </div>
      </div>
      <div
        className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>
    </div>
  );
};

export default Hero;
