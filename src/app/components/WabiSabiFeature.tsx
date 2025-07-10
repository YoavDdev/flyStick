"use client";

import React from "react";
import { motion } from "framer-motion";
import WabiSabiTexture from "./WabiSabiTexture";
import { standardEasing, staggerChildrenVariants } from "../styles/standardAnimations";

const WabiSabiFeature = () => {
  const features = [
    {
      name: "מתחילים ומתרגלים מנוסים",
      description:
        "למידה מותאמת אישית. עיקבו אחר מסלול מובנה בתוכניות אימון מגוונות המעוררים אתגרי חקירה וגילוי ואף משלבים טכניקות נשימה תרגוליות וייחודיות לשיטת בועז נחייסי.",  
      href: "#",
    },
    {
      name: "אם יש לכם סקרנות פנימית ורצון לגלות ולהתפתח",
      description:
        "מחכות לכן חקירות מעמיקות, סדר תרגולי ותנועתי מלווה בתובנות נדירות, זו הזמנה לחוות את ההרמוניה הטבעית בין התנועה החיצונית והתנועה הפנימית המתרחשות בסנכרון מופלא.",
      href: "#",
    },
    {
      name: "מורים|ת, מדריכים|ת ומטפלים|ת",
      description:
        "שדרגו את הידע ולימדו כיצד לתווך אותו למתאמנים בקלות ויצירתיות. עיקבו אחר סילבוס חכם בתוכנית האימון הייחודית שלנו המבוססת על חקירה אישית ויצירת פתרונות מדויקים יותר עבור הלקוח. שדרגו את גופכם ואת המקצועיות שלכם באותו זמן.",
      href: "#",
    },
  ];
  
  return (
    <div className="relative bg-[#F7F3EB] py-24 sm:py-32 overflow-hidden">
      {/* Wabi-Sabi texture background */}
      <WabiSabiTexture type="paper" opacity={0.07} animate={true} />
      
      {/* Asymmetrical decorative element */}
      <div className="absolute -left-16 top-20 w-64 h-64 opacity-10">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <motion.path
            fill="#B3BBA3"
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
      </div>
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div 
          className="mx-auto max-w-2xl lg:text-center"
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
            ברוכים הבאים
          </motion.h2>
          <motion.p 
            className="mt-2 text-3xl font-bold tracking-tight text-[#B56B4A] sm:text-4xl"
            variants={staggerChildrenVariants}
          >
            מסע התנועה והריפוי מתחיל עכשיו
          </motion.p>
          <motion.p 
            className="mt-6 text-lg leading-8 text-[#3D3D3D]"
            variants={staggerChildrenVariants}
          >
            לימוד והעמקה בהתאם לצורך והיכולת האישית. לכל אדם בכל שלב.
            העצמת כישורי ההוראה ושדרוג המקצוענות בתחום התנועה.
          </motion.p>
        </motion.div>
        
        <motion.div 
          className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            initial: { opacity: 0 },
            animate: { 
              opacity: 1,
              transition: { 
                staggerChildren: 0.15,
                delayChildren: 0.3
              }
            }
          }}
        >
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div 
                key={feature.name} 
                className="flex flex-col"
                variants={{
                  initial: { 
                    opacity: 0,
                    y: 20,
                  },
                  animate: { 
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.7,
                      ease: standardEasing.gentle,
                    }
                  }
                }}
              >
                <motion.div 
                  className="relative"
                  whileHover={{ 
                    y: -5,
                    transition: { 
                      duration: 0.5, 
                      ease: standardEasing.gentle 
                    }
                  }}
                >
                  {/* Asymmetrical card background */}
                  <div className="absolute inset-0 bg-[#E5DFD0] rounded-tl-lg rounded-br-lg rounded-tr-sm rounded-bl-sm -z-10 transform rotate-0.5"></div>
                  
                  {/* Card content with natural border */}
                  <div className="relative p-6 border border-[#D0C8B0]/40 rounded-tl-lg rounded-br-lg rounded-tr-sm rounded-bl-sm bg-[#F7F3EB]/80">
                    <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-[#3D3D3D]">
                      {feature.name}
                    </dt>
                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-[#5D5D5D]">
                      <p className="flex-auto">{feature.description}</p>
                    </dd>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </dl>
        </motion.div>
      </div>
      
      {/* Asymmetrical decorative element - bottom right */}
      <div className="absolute -right-16 bottom-20 w-64 h-64 opacity-10">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <motion.path
            fill="#D9845E"
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
};

export default WabiSabiFeature;
