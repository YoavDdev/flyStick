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
    <div className="relative overflow-hidden" dir="rtl" ref={ref}>
      {/* Decorative elements */}
      <div className="absolute -left-32 top-20 w-64 h-64 rounded-full bg-[#D5C4B7]/10 blur-md"></div>
      <div className="absolute -right-20 bottom-20 w-80 h-80 rounded-full bg-[#B8A99C]/10 blur-md"></div>
      
      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="mx-auto max-w-2xl lg:text-center"
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          {/* Decorative element above heading */}
          <motion.div 
            className="w-16 h-1 bg-[#B56B4A]/30 rounded-full mx-auto mb-6"
            initial={{ width: 0 }}
            animate={{ width: 64, transition: { delay: 0.5, duration: 0.8 } }}
          />
          
          <motion.h2
            className="text-base font-semibold leading-6 sm:leading-7 text-[#5C6A85]"
            variants={itemVariants}
          >
            ברוכים הבאים
          </motion.h2>
          <motion.p
            className="mt-2 text-xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#B56B4A]"
            variants={itemVariants}
          >
            מסע התנועה והריפוי מתחיל עכשיו
          </motion.p>
          <motion.p
            className="mt-4 sm:mt-6 text-base sm:text-lg leading-6 sm:leading-8 text-[#3D3D3D] max-w-3xl mx-auto px-1 sm:px-0"
            variants={itemVariants}
          >
            לימוד והעמקה בהתאם לצורך והיכולת האישית. לכל אדם בכל שלב.
            העצמת כישורי ההוראה ושדרוג המקצוענות בתחום התנועה.
          </motion.p>
        </motion.div>

        {/* Feature circles with enhanced styling */}
        <motion.div
          className="mx-auto mt-10 sm:mt-16 lg:mt-20 max-w-5xl"
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          <div className="flex flex-wrap justify-center gap-5 sm:gap-8 md:gap-10 lg:gap-20">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                className="flex flex-col items-center text-center max-w-xs"
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.3 } }}
              >
                {/* Enhanced circular icon with subtle shadow and border */}
                <motion.div 
                  className="w-18 h-18 sm:w-24 sm:h-24 rounded-full flex items-center justify-center shadow-lg mb-3 sm:mb-6 border border-white/20"
                  style={{ 
                    backgroundColor: feature.color,
                    boxShadow: `0 8px 25px -5px ${feature.color}40`
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: `0 15px 30px -10px ${feature.color}60`,
                    transition: { duration: 0.3 }
                  }}
                >
                  <span className="text-3xl text-[#F7F3EB]">{feature.icon}</span>
                </motion.div>
                
                {/* Feature name with enhanced typography */}
                <h3 className="text-base sm:text-xl font-semibold text-[#2D3142] mt-2">
                  {feature.name}
                </h3>
                
                {/* Decorative divider */}
                <div className="w-10 sm:w-12 h-0.5 bg-[#D5C4B7] my-2 sm:my-3 rounded-full"></div>
                
                {/* Feature description with improved readability */}
                <p className="mt-1 sm:mt-2 text-sm sm:text-base text-[#3D3D3D]">
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