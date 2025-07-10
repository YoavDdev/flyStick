"use client";

import React from "react";
import { motion } from "framer-motion";
import WabiSabiTexture from "./WabiSabiTexture";
import { standardEasing } from "../styles/standardAnimations";
import { FloatingElement, BreathingElement, CursorResponsiveElement, InkFlowBorder } from "../styles/wabiSabiMotion";

const WabiSabiVideoCarousel = () => {
  return (
    <div className="relative bg-[#E5DFD0] py-16 sm:py-24 overflow-hidden">
      {/* Wabi-Sabi texture background */}
      <WabiSabiTexture type="clay" opacity={0.07} animate={true} />
      
      {/* Asymmetrical decorative elements with enhanced motion */}
      <FloatingElement 
        className="absolute -left-20 top-1/2 transform -translate-y-1/2 w-64 h-64 opacity-10"
        amplitude={8}
        duration={6}
      >
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <motion.path
            fill="#7D8FAF"
            d="M47.7,-51.2C59.5,-37.7,65.5,-19.9,65.2,-2.6C64.9,14.7,58.3,31.8,46.5,43.9C34.7,56,17.3,63.1,0.2,62.9C-17,62.7,-34,55.2,-47.2,43C-60.5,30.8,-70,14.4,-70.3,-2.5C-70.6,-19.4,-61.8,-36.8,-48.4,-50.3C-35,-63.8,-17.5,-73.4,0.5,-74C18.5,-74.6,36.9,-64.7,47.7,-51.2Z"
            initial={{ pathLength: 0, rotate: 0 }}
            animate={{ 
              pathLength: 1, 
              rotate: -3,
              transition: { 
                pathLength: { duration: 2, ease: "easeInOut" },
                rotate: { duration: 30, ease: "linear", repeat: Infinity, repeatType: "reverse" }
              }
            }}
          />
        </svg>
      </FloatingElement>
      
      {/* Additional decorative element */}
      <FloatingElement 
        className="absolute -right-16 top-20 w-40 h-40 opacity-10"
        amplitude={6}
        duration={7}
        delay={1.5}
      >
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <motion.path
            fill="#B8A99C"
            d="M42.7,-65.4C53.9,-55.9,60.8,-41.5,65.8,-27.1C70.8,-12.7,73.9,1.7,71.2,15.3C68.5,28.9,60,41.8,48.5,51.7C37,61.7,22.5,68.8,6.7,72.3C-9.1,75.8,-26.2,75.7,-39.7,68.5C-53.2,61.3,-63.1,47,-69.8,31.4C-76.5,15.8,-80,-0.9,-76.2,-15.8C-72.4,-30.6,-61.3,-43.5,-48,-53.1C-34.7,-62.7,-19.2,-69,-2.8,-65.7C13.6,-62.4,31.5,-74.9,42.7,-65.4Z"
            initial={{ pathLength: 0, rotate: 0 }}
            animate={{ 
              pathLength: 1, 
              rotate: 5,
              transition: { 
                pathLength: { duration: 2.5, ease: "easeInOut" },
                rotate: { duration: 25, ease: "linear", repeat: Infinity, repeatType: "reverse" }
              }
            }}
          />
        </svg>
      </FloatingElement>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center mb-12">
          <h2 className="text-base font-semibold leading-7 text-[#5C6A85]">
            צפו בנו
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-[#3D3D3D] sm:text-4xl">
            טעימה מהסטודיו
          </p>
        </div>
        
        <motion.div 
          className="max-w-[900px] mx-auto relative"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: standardEasing.gentle }}
        >
          {/* Decorative frame with Wabi-Sabi aesthetic and ink flow border */}
          <InkFlowBorder 
            color="#D5C4B7" 
            thickness={3}
            duration={2.5}
            delay={0.3}
            className="absolute -inset-1 rounded-tl-xl rounded-br-xl rounded-tr-lg rounded-bl-lg transform rotate-0.5"
          >
            <div className="absolute inset-0 bg-[#D5C4B7] rounded-tl-xl rounded-br-xl rounded-tr-lg rounded-bl-lg transform rotate-0.5"></div>
          </InkFlowBorder>
          
          {/* Video container with cursor responsive effect */}
          <CursorResponsiveElement 
            sensitivity={10} 
            className="relative p-1 bg-[#F7F3EB] rounded-tl-lg rounded-br-lg rounded-tr-sm rounded-bl-sm overflow-hidden"
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
            
            {/* Subtle texture overlay with breathing effect */}
            <BreathingElement 
              scale={1.02} 
              duration={8} 
              className="absolute inset-0 pointer-events-none"
            >
              <WabiSabiTexture type="paper" opacity={0.03} />
            </BreathingElement>
          </CursorResponsiveElement>
          
          {/* Decorative element with floating animation */}
          <FloatingElement 
            className="absolute -bottom-3 -right-3 w-24 h-24 opacity-20"
            amplitude={5}
            duration={5}
            delay={0.8}
          >
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <motion.path
                fill="#B3BBA3"
                d="M47.7,-51.2C59.5,-37.7,65.5,-19.9,65.2,-2.6C64.9,14.7,58.3,31.8,46.5,43.9C34.7,56,17.3,63.1,0.2,62.9C-17,62.7,-34,55.2,-47.2,43C-60.5,30.8,-70,14.4,-70.3,-2.5C-70.6,-19.4,-61.8,-36.8,-48.4,-50.3C-35,-63.8,-17.5,-73.4,0.5,-74C18.5,-74.6,36.9,-64.7,47.7,-51.2Z"
                initial={{ scale: 1 }}
                animate={{ 
                  scale: [1, 1.05, 1],
                  transition: { 
                    duration: 8, 
                    ease: "easeInOut", 
                    repeat: Infinity,
                    repeatType: "reverse" 
                  }
                }}
              />
            </svg>
          </FloatingElement>
        </motion.div>
      </div>
    </div>
  );
};

export default WabiSabiVideoCarousel;
