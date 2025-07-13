"use client";

import {
  WabiSabiHero,
  WabiSabiFeature,
  WabiSabiVideoCarousel,
  WabiSabiPricing,
} from "./components";
import ExploreVideos from "./components/ExploreVideos";
import Image from "next/image";

export default function HomePage() {
  return (
    <main className="relative overflow-hidden bg-[#F7F3EB]">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Top-right decorative circle */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#D5C4B7]/10"></div>
        
        {/* Bottom-left decorative shape */}
        <div className="absolute -bottom-40 -left-20 w-80 h-80 rounded-full bg-[#B8A99C]/10"></div>
        
        {/* Center decorative element */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#F0E9DF]/30 blur-3xl"></div>
        
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 bg-[url('/paper-texture.png')] opacity-5 mix-blend-overlay"></div>
      </div>
      
      {/* Hero section */}
      <div className="relative z-10">
        <WabiSabiHero />
      </div>
      
      {/* Main content sections */}
      <div className="relative z-10">
        {/* Features section with enhanced spacing */}
        <section className="relative">
          <div className="container mx-auto px-6 py-20 md:py-28">
            <WabiSabiFeature />
          </div>
        </section>
        
        {/* Video carousel section with divider */}
        <section className="relative py-20 md:py-28 overflow-hidden">
          {/* Subtle divider */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-[#D5C4B7]/30 rounded-full"></div>
          
          <div className="container mx-auto px-6">
            <WabiSabiVideoCarousel />
            
            <div className="mt-16 text-center">
              <ExploreVideos />
            </div>
          </div>
        </section>
        
        {/* Pricing section with divider */}
        <section className="relative py-20 md:py-28" id="Pricing">
          {/* Subtle divider */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-[#D5C4B7]/30 rounded-full"></div>
          
          <WabiSabiPricing />
        </section>
      </div>
      
      {/* Footer spacing */}
      <div className="w-full h-40 relative overflow-hidden"></div>
    </main>
  );
}
