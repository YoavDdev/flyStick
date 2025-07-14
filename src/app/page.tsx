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
        <section className="relative" id="Pricing">
          
          <WabiSabiPricing />
        </section>
      </div>
    </main>
  );
}
