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
      whileHover={{ y: -3, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="bg-[#F7F3EB] p-4 sm:p-6 rounded-xl shadow-md border border-[#D5C4B7]/30 relative overflow-hidden h-full flex flex-col"
    >
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-[#D5C4B7]/10 rounded-full -mt-12 -mr-12"></div>
      
      {/* Card content */}
      <div className="relative z-10 flex flex-col flex-grow">
        {icon && (
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="mb-3 sm:mb-4 text-[#2D3142] text-2xl sm:text-3xl p-2 -ml-2"
          >
            {icon}
          </motion.div>
        )}
        <h3 className="text-lg sm:text-xl font-bold text-[#2D3142] mb-2 sm:mb-3">{title}</h3>
        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-5 flex-grow">{description}</p>
        <Link href={link} className="mt-auto">
          <motion.span 
            whileHover={{ x: 5 }}
            className="inline-block text-[#B8A99C] hover:text-[#D5C4B7] font-medium py-1 px-1 -ml-1 rounded-md"
          >
            גלה עוד
            <motion.span 
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
              className="mr-1 inline-block"
            >
              →
            </motion.span>
          </motion.span>
        </Link>
      </div>
    </motion.div>
  );
};

export default DashboardCard;
