import WabiSabiPricing from "@/app/components/WabiSabiPricing";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "מחירון | Studio Boaz Online",
  description: "הצטרפו למנוי סטודיו בועז אונליין וקבלו גישה למאות שיעורים מקצועיים",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#F7F3EB]">
      <div className="pt-24 pb-16">
        <WabiSabiPricing />
      </div>
    </div>
  );
}
