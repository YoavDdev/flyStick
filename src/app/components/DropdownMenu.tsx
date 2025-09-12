"use client";

import React from "react";
import { AiOutlineLogout, AiOutlineUser, AiOutlineBook, AiOutlineCompass, AiOutlineExperiment, AiOutlineSearch, AiOutlinePlayCircle } from "react-icons/ai";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
// Removed framer-motion imports

const DropdownMenu = ({ onClose }: { onClose: () => void }) => {
  const { data: session } = useSession();

  const menuItems = [
    { href: "/dashboard", label: "איזור אישי", icon: AiOutlineUser },
    { href: "/user", label: "הספרייה שלי", icon: AiOutlineBook },
    { href: "/styles", label: "טכניקות", icon: AiOutlineExperiment },
    { href: "/series", label: "סדרות", icon: AiOutlinePlayCircle },
    { href: "/explore", label: "חיפוש אישי", icon: AiOutlineCompass },
  ];

  // Removed animation delay function

  return (
    <div className="py-2">
      {menuItems.map((item, i) => (
        <div key={item.href}>
          <Link href={item.href} onClick={onClose}>
            <div className="relative flex items-center gap-2 px-4 py-3 hover:bg-[#E5DFD0] text-[#5D5D5D] hover:text-[#B56B4A] transition-colors duration-300">
              <item.icon className="ml-2" size={18} />
              <span>{item.label}</span>
              {item.label === "סדרות" && (
                <span className="w-2 h-2 bg-green-500 rounded-full ml-1 flex-shrink-0"></span>
              )}
            </div>
          </Link>
        </div>
      ))}
      
      <div className="mt-2 pt-2 border-t border-[#D0C8B0]/30">
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
      </div>
    </div>
  );
};

export default DropdownMenu;
