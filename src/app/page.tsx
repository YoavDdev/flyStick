"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from 'next/navigation';
import {
  WabiSabiHero,
  WabiSabiFeature,
  WabiSabiVideoCarousel,
  WabiSabiPricing,
  WabiSabiContact,
} from "./components";
import ExploreVideos from "./components/ExploreVideos";
import Image from "next/image";
import desertImage from "../../public/contacMe2.jpeg";
import { motion } from "framer-motion";

// Custom hook to handle hash-based scrolling
function useHashScroll() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if we're on the home page and there's a hash in the URL
    if (pathname === '/' && window.location.hash) {
      const hash = window.location.hash;
      
      // Small delay to ensure the page has fully rendered
      const timer = setTimeout(() => {
        const element = document.getElementById(hash.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);
}

export default function HomePage() {
  // Use the hash scroll hook
  useHashScroll();
  
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Desert landscape background for entire page - optimized for performance */}
      <div className="fixed inset-0 z-0">
        <Image 
          src={desertImage}
          alt="Desert landscape meditation background"
          fill
          className="object-cover"
          priority
          quality={75}
          placeholder="blur"
          sizes="100vw"
        />
        {/* Static overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40" />
      </div>

      {/* All content with relative positioning over the background */}
      <div className="relative z-10">
        {/* Hero section */}
        <WabiSabiHero />
        
        {/* Features section */}
        <section id="features">
          <WabiSabiFeature />
        </section>
        
        {/* Video carousel section */}
        <section id="videos">
          <WabiSabiVideoCarousel />
        </section>
        
        {/* Explore videos */}
        <section id="explore" className="py-16">
          <div className="container mx-auto px-6">
            <ExploreVideos />
          </div>
        </section>
        
        {/* Pricing section */}
        <section id="pricing">
          <WabiSabiPricing />
        </section>
        
        {/* Contact section */}
        <section id="contact">
          <WabiSabiContact />
        </section>
      </div>
    </main>
  );
}
