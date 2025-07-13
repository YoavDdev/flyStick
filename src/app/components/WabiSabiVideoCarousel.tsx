"use client";

import React, { useEffect, useRef } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import { CursorResponsiveElement, InkFlowBorder } from "../styles/wabiSabiMotion";

const WabiSabiVideoCarousel = () => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);

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

  return (
    <div className="relative overflow-hidden" ref={ref}>
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#F7F3EB] via-[#E5DFD0] to-[#F7F3EB] opacity-50"></div>
      <div className="absolute -left-32 bottom-20 w-72 h-72 rounded-full bg-[#D5C4B7]/10 blur-xl"></div>
      <div className="absolute -right-20 top-40 w-64 h-64 rounded-full bg-[#B8A99C]/10 blur-lg"></div>

      <div className="container mx-auto px-6 sm:px-8 lg:px-10 relative z-10">
        <motion.div 
          className="mx-auto max-w-2xl lg:text-center mb-16"
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          {/* Decorative element above heading */}
          <motion.div 
            className="w-16 h-1 bg-[#5C6A85]/30 rounded-full mx-auto mb-6"
            initial={{ width: 0 }}
            animate={{ width: 64, transition: { delay: 0.5, duration: 0.8 } }}
          />
          
          <motion.h2 
            className="text-base font-semibold leading-7 text-[#5C6A85]"
            variants={itemVariants}
          >
            צפו בנו
          </motion.h2>
          <motion.p 
            className="mt-2 text-3xl font-bold tracking-tight text-[#3D3D3D] sm:text-4xl"
            variants={itemVariants}
          >
            טעימה מהסטודיו
          </motion.p>
        </motion.div>
        
        <motion.div 
          className="max-w-[900px] mx-auto relative"
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          {/* Enhanced decorative frame with Wabi-Sabi aesthetic */}
          <motion.div
            className="absolute -inset-3 rounded-tl-2xl rounded-br-2xl rounded-tr-lg rounded-bl-lg bg-gradient-to-br from-[#D5C4B7] to-[#B8A99C] opacity-80"
            variants={itemVariants}
            style={{ boxShadow: "0 20px 40px -15px rgba(184, 169, 156, 0.5)" }}
          />
          
          <InkFlowBorder 
            color="#D5C4B7" 
            thickness={3}
            duration={2.5}
            delay={0.3}
            className="absolute -inset-1 rounded-tl-xl rounded-br-xl rounded-tr-lg rounded-bl-lg transform rotate-0.5"
          >
            <div className="absolute inset-0 bg-[#D5C4B7] rounded-tl-xl rounded-br-xl rounded-tr-lg rounded-bl-lg transform rotate-0.5"></div>
          </InkFlowBorder>
          
          {/* Video container with enhanced styling */}
          <CursorResponsiveElement 
            sensitivity={10} 
            className="relative p-1 bg-[#F7F3EB] rounded-tl-lg rounded-br-lg rounded-tr-sm rounded-bl-sm overflow-hidden shadow-inner"
          >
            <motion.div 
              className="relative overflow-hidden rounded-tl-lg rounded-br-lg rounded-tr-sm rounded-bl-sm"
              variants={itemVariants}
              whileHover={{ scale: 1.01, transition: { duration: 0.3 } }}
            >
              <iframe
                id="ytplayer"
                width="50%"
                height="500"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                src="https://www.youtube.com/embed/VmxL_n52jPA?autoplay=1&loop=1&mute=1&si=r7sh91q0pP3U0mKG&playlist=VmxL_n52jPA"
                className="w-full h-full object-cover rounded-tl-lg rounded-br-lg rounded-tr-sm rounded-bl-sm"
                style={{ aspectRatio: "16/9" }}
              ></iframe>
            </motion.div>
          </CursorResponsiveElement>
          
          {/* Decorative element below video */}
          <motion.div 
            className="w-24 h-1 bg-[#D5C4B7]/50 rounded-full mx-auto mt-8"
            initial={{ width: 0 }}
            animate={{ width: 96, transition: { delay: 1, duration: 0.8 } }}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default WabiSabiVideoCarousel;
