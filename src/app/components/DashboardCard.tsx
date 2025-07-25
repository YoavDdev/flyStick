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
    <Link href={link} className="block h-full">
      <motion.div 
        whileHover={{ y: -3, boxShadow: "0 4px 8px -2px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.05)" }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="bg-[#F7F3EB] p-4 sm:p-6 rounded-xl shadow-md border border-[#D5C4B7]/30 relative overflow-hidden h-full flex flex-col cursor-pointer"
      > 
        {/* Card content */}
        <div className="relative flex flex-col flex-grow">
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
          <p className="text-sm sm:text-base text-gray-600 flex-grow">{description}</p>
        </div>
      </motion.div>
    </Link>
  );
};

export default DashboardCard;