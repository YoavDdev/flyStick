import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface DashboardCardProps {
  title: string;
  description: string;
  link: string;
  icon?: React.ReactNode;
}

const DashboardCard = ({ title, description, link, icon }: DashboardCardProps) => {
  return (
    <motion.div 
      className="bg-[#F7F3EB] p-6 rounded-xl shadow-md border border-[#D5C4B7]/30 relative overflow-hidden"
      whileHover={{ 
        y: -5,
        boxShadow: "0 10px 15px rgba(0, 0, 0, 0.07), 0 15px 30px rgba(0, 0, 0, 0.1)"
      }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] }}
    >
      {/* Decorative element */}
      <div className="absolute top-0 right-0 w-24 h-24 opacity-10 -mt-8 -mr-8">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path
            fill="#B8A99C"
            d="M45.7,-58.2C58.9,-48.3,69.2,-33.5,73.2,-16.9C77.2,-0.3,74.9,18.1,66.4,32.6C57.9,47.1,43.2,57.7,27.1,64.9C11,72.1,-6.5,75.9,-22.6,71.3C-38.7,66.7,-53.4,53.7,-62.3,37.8C-71.2,21.9,-74.3,3.1,-70.9,-14.1C-67.5,-31.3,-57.6,-46.9,-44.1,-56.8C-30.6,-66.7,-13.6,-70.8,1.5,-72.7C16.6,-74.6,32.5,-68.2,45.7,-58.2Z"
          />
        </svg>
      </div>
      
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
    </motion.div>
  );
};

export default DashboardCard;
