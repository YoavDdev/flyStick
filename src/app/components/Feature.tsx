import React from "react";
import {
  ArrowPathIcon,
  CloudArrowUpIcon,
  LockClosedIcon,
} from "@heroicons/react/20/solid";

const Feature = () => {
  const features = [
    {
      name: "מתחילים או מתרגלים מנוסים:",
      description:
        "למידה מותאמת אישית: עקוב אחר מסלול מובנה בתוכנית האימון הייחודית שלנו, עם אתגרים מותאמים וטכניקות נשימה מיוחדות בכל שיעור.",
      href: "#",
    },
    {
      name: "אם יש לך סקרנות ורצון להתפתח:",
      description:
        "חקירות מעמיקות: גלה את מבני התנועה עם תובנות אנטומיות מעמיקות, היכנס להרמוניה פנימית והבין את הקשר העמוק בין התנועה החיצונית והעצמי הפנימי.",
      href: "#",
    },
    {
      name: "כמדריך וכמתרגל:",
      description:
        "שדרג והנחה: הגבר את הידע, היצירתיות והערך שלך כמדריך וכמתרגל עם המשאבים של הסטודיו שלנו.",
      href: "#",
    },
  ];
  
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-[#2D3142]">
            ברוכים הבאים
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-[#EF8354] sm:text-4xl">
            המסע שלך למיומנות בתנועה מתחיל כאן
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            למידה מסודרת לכל הרמות: צלול לעומק סודות התנועה, גלה את הקשר בין
            החיצוני לפנימי כמתרגל, ועצם את כישורי ההוראה שלך כמדריך עם משאבי
            הסטודיו שלנו.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-[#2D3142]">
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">{feature.description}</p>
                  {/* <p className="mt-6">
                    <a
                      href={feature.href}
                      className="text-sm font-semibold leading-6 text-[#EF8354]"
                    >
                      Learn more <span aria-hidden="true">→</span>
                    </a>
                  </p> */}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
    /*  <div className="bg-white p-5 sm:p-10 ">
      <section className="text-center">
        <div className="grid gap-x-5 sm:gap-x-10 md:grid-cols-1 lg:grid-cols-3 ">
          <div className="mb-5 sm:mb-10">
            <h5 className="mb-2  text-[#990011] text-2xl sm:text-4xl">
              Whether a beginner or an experienced practitioner:
            </h5>
            <p className="text-gray-600 sm:text-xl">
              Streamlined Learning: Follow a guided path in our training
              program, with tailored challenges at every step.
            </p>
          </div>
          <div className="mb-5 sm:mb-10">
            <h5 className="mb-2  text-[#990011] text-2xl sm:text-4xl">
              If you have curiosity and drive for more, our studio offers:
            </h5>
            <p className="text-gray-600 sm:text-xl">
              Deep Dives: Explore movement intricacies with in-depth insights.
              Inner Harmony: Unearth the profound connection between outer
              movement and inner self.
            </p>
          </div>
          <div>
            <h5 className="mb-2  text-[#990011] text-2xl sm:text-4xl">
              For those who have already walked a path or are teachers and
              mentors:
            </h5>
            <p className="text-gray-600 sm:text-xl">
              Enhance and Inspire: Boost your knowledge, creativity, and value
              as an instructor with our studio's resources.
            </p>
          </div>
        </div>
      </section>
    </div> */
  );
};

export default Feature;
