"use client";

import React from "react";
import { AiOutlineLogout, AiOutlineUser, AiOutlineBook, AiOutlineCompass, AiOutlineExperiment } from "react-icons/ai";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
// Use specific imports from framer-motion
import * as FramerMotion from "framer-motion";
const { motion } = FramerMotion;

const DropdownMenu = ({ onClose }: { onClose: () => void }) => {
  const { data: session } = useSession();

  const menuItems = [
    { href: "/dashboard", label: "איזור אישי", icon: AiOutlineUser },
    { href: "/user", label: "הספרייה שלי", icon: AiOutlineBook },
    { href: "/styles", label: "טכניקות", icon: AiOutlineExperiment },
    { href: "/explore", label: "חיפוש אישי", icon: AiOutlineCompass },
  ];

  // Animation stagger delay for menu items
  const getAnimationDelay = (i: number) => i * 0.05;

  return (
    <motion.div 
      className="py-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {menuItems.map((item, i) => (
        <motion.div
          key={item.href}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: getAnimationDelay(i), duration: 0.3 }}
        >
          <Link href={item.href} onClick={onClose}>
            <div className="flex items-center gap-2 px-4 py-3 hover:bg-[#E5DFD0] text-[#5D5D5D] hover:text-[#B56B4A] transition-colors duration-300">
              <item.icon className="ml-2" size={18} />
              <span>{item.label}</span>
            </div>
          </Link>
        </motion.div>
      ))}
      
      <motion.div
        className="mt-2 pt-2 border-t border-[#D0C8B0]/30"
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: getAnimationDelay(menuItems.length), duration: 0.3 }}
      >
        <button
          onClick={() => {
            signOut();
            onClose();
          }}
          className="w-full flex items-center gap-2 px-4 py-3 hover:bg-[#E5DFD0] text-[#5D5D5D] hover:text-[#B56B4A] transition-colors duration-300"
        >
          <AiOutlineLogout className="ml-2" size={18} />
          <span>החלף משתמש</span>
        </button>
      </motion.div>
    </motion.div>
  );
};

export default DropdownMenu;
