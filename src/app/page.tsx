import { Suspense } from "react";
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
import type { Metadata } from "next";

// SEO metadata specifically for homepage to rank better for "בועז סטודיו"
export const metadata: Metadata = {
  title: "בועז סטודיו - סטודיו בועז אונליין | אימונים אישיים ותנועה מרפאה",
  description: "ברוכים הבאים לבועז סטודיו - סטודיו בועז אונליין. בועז נחייסי מציע אימונים אישיים, פלייסטיק ותנועה מרפאה. שיעורי וידאו מקצועיים לחיבור גוף ונפש.",
  keywords: [
    "בועז סטודיו", "סטודיו בועז", "בועז נחייסי", "סטודיו בועז אונליין",
    "אימונים אישיים", "פלייסטיק", "תנועה מרפאה", "יוגה", "פילאטיס",
    "אימון אונליין", "שיעורי וידאו", "כושר", "בריאות", "חיבור גוף נפש"
  ],
  openGraph: {
    title: "בועז סטודיו - סטודיו בועז אונליין",
    description: "ברוכים הבאים לבועז סטודיו - המקום שלכם לאימונים אישיים ותנועה מרפאה עם בועז נחייסי",
    url: "https://www.studioboazonline.com/",
    type: "website"
  },
  alternates: {
    canonical: "https://www.studioboazonline.com/"
  }
};

export default function HomePage() {
  
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
