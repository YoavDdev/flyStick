"use client";

import {
  WabiSabiHero,
  WabiSabiFeature,
  WabiSabiVideoCarousel,
  WabiSabiPricing,
} from "./components";
import ExploreVideos from "./components/ExploreVideos";

export default function HomePage() {
  return (
    <main className=" relative overflow-hidden">
      <WabiSabiHero />
      
      <div className="relative">
        <section className="relative">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <WabiSabiFeature />
          </div>
        </section>
        
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="container mx-auto px-4">
            <WabiSabiVideoCarousel />
            
            <div className="mt-12 text-center">
              <ExploreVideos />
            </div>
          </div>
        </section>
        
        <section className="relative py-16 md:py-24" id="Pricing">
          <WabiSabiPricing />
        </section>
      </div>
      
      <div className="w-full h-32 relative overflow-hidden"></div>
    </main>
  );
}
