import WabiSabiPricing from "@/app/components/WabiSabiPricing";
import { Metadata } from "next";
import Image from "next/image";
import desertImage from "../../../../public/Boaznewback.jpg";

export const metadata: Metadata = {
  title: "מחירון | Studio Boaz Online",
  description: "הצטרפו למנוי סטודיו בועז אונליין וקבלו גישה למאות שיעורים מקצועיים",
};

export default function PricingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Desert landscape background - same as home page */}
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
        {/* Enhanced overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/40" />
      </div>

      {/* Content with relative positioning over the background */}
      <div className="relative z-10 pt-24 pb-16">
        <WabiSabiPricing />
      </div>
    </div>
  );
}
