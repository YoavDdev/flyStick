"use client";

import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "framer-motion";

const WabiSabiFeature = () => {
  const features = [
    {
      name: "טכניקות מדריכות ומטפלות",
      description: "שיטות מתקדמות לשיפור תנועה ובריאות",
      icon: "✦",
      color: "#B56B4A",
    },
    {
      name: "אם יש לכם סקרנות פנימית",
      description: "סקרנות פנימית ורצון לגלות",
      icon: "❋",
      color: "#5C6A85",
    },
    {
      name: "מתחילים ומתרגלים מנוסים",
      description: "למידה מותאמת אישית לכל רמה",
      icon: "✧",
      color: "#B8A99C",
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 50,
        damping: 10,
      },
    },
  };

  // Custom hook for section animation
  const controls = useAnimation();
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);

  return (
    <div className="relative bg-[#F7F3EB] py-16 sm:py-24 overflow-hidden" dir="rtl" ref={ref}>
      {/* Paper texture overlay */}
      <div className="absolute inset-0 bg-[url('/paper-texture.png')] opacity-5 mix-blend-overlay pointer-events-none"></div>
      
      {/* Decorative blob */}
      <div className="absolute -left-20 top-20 w-64 h-64 opacity-10 pointer-events-none">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <motion.path
            fill="#D5C4B7"
            d="M39.5,-65.3C50.2,-55.1,57.2,-42.1,63.4,-28.8C69.6,-15.5,74.9,-1.9,73.1,10.7C71.3,23.3,62.3,34.8,51.6,42.8C40.9,50.8,28.5,55.3,15.3,60.5C2.2,65.7,-11.7,71.7,-24.4,69.9C-37.1,68.1,-48.5,58.6,-57.4,47C-66.3,35.4,-72.6,21.7,-74.3,7.2C-76,-7.3,-73,-22.5,-65.3,-34.2C-57.6,-45.9,-45.2,-54,-32.5,-63.8C-19.8,-73.6,-6.6,-85.1,5.2,-83.3C17,-81.5,28.8,-75.5,39.5,-65.3Z"
            initial={{ pathLength: 0 }}
            animate={{ 
              pathLength: 1,
              transition: { duration: 2, ease: "easeInOut" }
            }}
          />
        </svg>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
        <motion.div
          className="mx-auto max-w-2xl lg:text-center"
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          <motion.h2
            className="text-base font-semibold leading-7 text-[#5C6A85]"
            variants={itemVariants}
          >
            ברוכים הבאים
          </motion.h2>
          <motion.p
            className="mt-2 text-3xl font-bold tracking-tight text-[#B56B4A] sm:text-4xl"
            variants={itemVariants}
          >
            מסע התנועה והריפוי מתחיל עכשיו
          </motion.p>
          <motion.p
            className="mt-6 text-lg leading-8 text-[#3D3D3D]"
            variants={itemVariants}
          >
            לימוד והעמקה בהתאם לצורך והיכולת האישית. לכל אדם בכל שלב.
            העצמת כישורי ההוראה ושדרוג המקצוענות בתחום התנועה.
          </motion.p>
        </motion.div>

        {/* Feature circles */}
        <motion.div
          className="mx-auto mt-16 max-w-5xl sm:mt-20 lg:mt-24"
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          <div className="flex flex-wrap justify-center gap-8 lg:gap-16">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                className="flex flex-col items-center text-center max-w-xs"
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.3 } }}
              >
                {/* Circular icon */}
                <motion.div 
                  className="w-20 h-20 rounded-full flex items-center justify-center shadow-md mb-4"
                  style={{ 
                    backgroundColor: feature.color,
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 10px 25px -10px rgba(0,0,0,0.3)",
                    transition: { duration: 0.3 }
                  }}
                >
                  <span className="text-2xl text-[#F7F3EB]">{feature.icon}</span>
                </motion.div>
                
                {/* Feature name and description */}
                <h3 className="text-lg font-semibold text-[#2D3142] mt-2">
                  {feature.name}
                </h3>
                <p className="mt-2 text-sm text-[#3D3D3D]">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default WabiSabiFeature;
