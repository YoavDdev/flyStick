"use client";

import React from "react";

import { CursorResponsiveElement, InkFlowBorder } from "../styles/wabiSabiMotion";

const WabiSabiVideoCarousel = () => {
  return (
    <div className="relative bg-[#E5DFD0] py-16 sm:py-24 overflow-hidden">

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center mb-12">
          <h2 className="text-base font-semibold leading-7 text-[#5C6A85]">
            צפו בנו
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-[#3D3D3D] sm:text-4xl">
            טעימה מהסטודיו
          </p>
        </div>
        
        <div 
          className="max-w-[900px] mx-auto relative"
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
            

          </CursorResponsiveElement>
          
        </div>
      </div>
    </div>
  );
};

export default WabiSabiVideoCarousel;
