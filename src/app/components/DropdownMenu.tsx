import React from "react";
import { AiOutlineLogout } from "react-icons/ai";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

const DropdownMenu = ({ toggleDropdown }: any) => {
  const { data: session } = useSession();

  const itemClass =
    "block px-8 py-2 hover:bg-[#EF8354] hover:text-white text-center focus:outline-none rounded-lg shadow-lg bg-[#FCF6F5] text-[#2D3142] whitespace-nowrap";

  return (
    <div className="absolute flex flex-col gap-2 z-50">
      <Link href="/dashboard" onClick={toggleDropdown}>
        <div className={itemClass}>איזור אישי</div>
      </Link>
      <Link href="/user" onClick={toggleDropdown}>
        <div className={itemClass}>הספרייה שלי</div>
      </Link>
      <Link href="/styles" onClick={toggleDropdown}>
        <div className={itemClass}>טכניקות</div>
      </Link>
      <Link href="/explore" onClick={toggleDropdown}>
        <div className={itemClass}>חיפוש אישי</div>
      </Link>
      <button
        onClick={() => {
          signOut();
          toggleDropdown();
        }}
        className={`${itemClass} flex items-center justify-center gap-2`}
      >
        <AiOutlineLogout />
        <span>החלף משתמש</span>
      </button>
    </div>
  );
};

export default DropdownMenu;
