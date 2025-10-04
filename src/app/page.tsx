import { Suspense } from "react";
import {
  WabiSabiHero,
  WabiSabiFeature,
  WabiSabiVideoCarousel,
  WabiSabiPricing,
  WabiSabiContact,
} from "./components";
import ExploreVideos from "./components/ExploreVideos";
import SeriesPromotion from "./components/SeriesPromotion";
import StructuredDataHome from "./components/StructuredDataHome";
import Image from "next/image";
import desertImage from "../../public/Boaznewback.jpg";
import { motion } from "framer-motion";
import type { Metadata } from "next";

// SEO metadata specifically optimized for "Studio Boaz Online" and "בועז און לין" searches
export const metadata: Metadata = {
  title: "Studio Boaz Online - בועז סטודיו און לין | סטודיו בועז אונליין",
  description: "Studio Boaz Online - בועז סטודיו און לין. בועז נחייסי מציע אימונים אישיים, פלייסטיק ותנועה מרפאה. סטודיו בועז אונליין עם שיעורי וידאו מקצועיים לחיבור גוף ונפש.",
  keywords: [
    "Studio Boaz Online", "בועז און לין", "בועז סטודיו", "studio boaz", "boaz studio",
    "סטודיו בועז", "בועז נחייסי", "סטודיו בועז אונליין", "boaz nahaissi",
    "אימונים אישיים", "פלייסטיק", "תנועה מרפאה", "יוגה", "פילאטיס",
    "אימון אונליין", "שיעורי וידאו", "כושר", "בריאות", "חיבור גוף נפש",
    "online fitness", "movement therapy", "personal training", "flyastic"
  ],
  openGraph: {
    title: "Studio Boaz Online - בועז סטודיו און לין",
    description: "Studio Boaz Online - בועז סטודיו און לין. המקום שלכם לאימונים אישיים ותנועה מרפאה עם בועז נחייסי",
    url: "https://www.studioboazonline.com/",
    type: "website",
    siteName: "Studio Boaz Online",
    locale: "he_IL"
  },
  alternates: {
    canonical: "https://www.studioboazonline.com/"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  }
};

export default function HomePage() {
  
  return (
    <>
      <StructuredDataHome />
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
        {/* Enhanced overlay for better text readability with studio background */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/40" />
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
        
        {/* Series Promotion */}
        <section id="series-promotion">
          <SeriesPromotion />
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
    </>
  );
}
