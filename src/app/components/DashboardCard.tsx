import React from "react";
import Link from "next/link";

interface DashboardCardProps {
  title: string;
  description: string;
  link: string;
  icon?: React.ReactNode;
}

const DashboardCard = ({ title, description, link, icon }: DashboardCardProps) => {
  return (
    <div className="bg-[#F7F3EB] p-6 rounded-xl shadow-md border border-[#D5C4B7]/30 relative overflow-hidden hover:shadow-lg">
      {/* Decorative element removed */}
      
      {/* Card content */}
      <div className="relative z-10">
        {icon && <div className="mb-4 text-[#2D3142]">{icon}</div>}
        <h3 className="text-xl font-bold text-[#2D3142] mb-3">{title}</h3>
        <p className="text-gray-600 mb-5">{description}</p>
        <Link href={link}>
          <span className="inline-block text-[#B8A99C] hover:text-[#D5C4B7] font-medium transition-all duration-300">
            גלה עוד
            <span className="mr-1 relative top-[1px]">→</span>
          </span>
        </Link>
      </div>
    </div>
  );
};

export default DashboardCard;
