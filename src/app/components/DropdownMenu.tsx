// DropdownMenu.jsx

import React from "react";
import { AiOutlineLogout } from "react-icons/ai";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

const DropdownMenu = ({ toggleDropdown }: any) => {
  const { data: session } = useSession();

  return (
    <div className="absolute flex flex-col gap-2">
      <Link href="/dashboard">
        <li
          className="block px-10 py-2 hover:bg-[#EF8354] hover:text-white text-left focus:outline-none rounded-lg shadow-lg bg-[#FCF6F5] text-[#2D3142]"
          onClick={toggleDropdown}
        >
          איזור אישי
        </li>
      </Link>
      <Link href="/user">
        <li
          className="block px-10 py-2 hover:bg-[#EF8354] hover:text-white text-left focus:outline-none rounded-lg shadow-lg bg-[#FCF6F5] text-[#2D3142]"
          onClick={toggleDropdown}
        >
          הספרייה שלי
        </li>
      </Link>
      <Link href="/styles">
        <li
          className="block px-10 py-2 hover:bg-[#EF8354] hover:text-white text-left focus:outline-none rounded-lg shadow-lg bg-[#FCF6F5] text-[#2D3142]"
          onClick={toggleDropdown}
        >
          סגנונות
        </li>
      </Link>
      <Link href="/explore">
        <li
          className="block px-10 py-2 hover:bg-[#EF8354] hover:text-white text-left focus:outline-none rounded-lg shadow-lg bg-[#FCF6F5] text-[#2D3142]"
          onClick={toggleDropdown}
        >
          חקור
        </li>
      </Link>
      <Link
        href={"/"}
        className="block px-10 py-2 hover:bg-[#EF8354] hover:text-white text-left focus:outline-none rounded-lg shadow-lg bg-[#FCF6F5] text-[#2D3142]"
        onClick={() => {
          signOut();
          toggleDropdown();
        }}
      >
        <div className="flex items-center">
          <span>התנתק</span>
          <AiOutlineLogout className="ml-2" />
        </div>
      </Link>
    </div>
  );
};

export default DropdownMenu;
