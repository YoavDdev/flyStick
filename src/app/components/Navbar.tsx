"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  AiOutlineMenu,
  AiOutlineClose,
  AiOutlineInstagram,
  AiOutlineFacebook,
  AiOutlineYoutube,
} from "react-icons/ai";
import Logo from "../../../public/Flystick_logo.svg";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

const Navbar = () => {
  const [isTransparent, setIsTransparent] = useState(true);

  useEffect(() => {
    // Add a scroll event listener to toggle transparency
    function handleScroll() {
      if (window.scrollY > 0) {
        setIsTransparent(false);
      } else {
        setIsTransparent(true);
      }
    }

    window.addEventListener("scroll", handleScroll);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const [dropdownVisible, setDropdownVisible] = useState(false);

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const { data: session } = useSession();
  const [menuOpen, setMenuopen] = useState(false);
  const handleNav = () => {
    setMenuopen(!menuOpen);
  };

  return (
    <nav
      className={`w-full fixed top-0 left-0 h-20 shadow-xl z-50 ${
        !isTransparent ? " bg-[#FCF6F5] bg-opacity-75 " : "bg-[#FCF6F5] "
      }`}
    >
      <div className="flex justify-between items-center h-full w-full px-4 lg:px-16  ">
        <Link href="/">
          <Image
            src={Logo}
            width={25}
            height={1}
            alt="Logo"
            className="cursor-pointer ml-11"
            priority
          />
        </Link>

        <div className="hidden sm:flex">
          <ul className="hidden sm:flex">
            <Link href="/about">
              <li className="ml-10 uppercase hover:text-[#990011]  text-xl">
                About
              </li>
            </Link>
            <Link href="/contact">
              <li className="ml-10 uppercase hover:text-[#990011]  text-xl">
                Contact Me
              </li>
            </Link>
            <Link href="/#Pricing ">
              <li className="ml-10 uppercase hover:text-[#990011]  text-xl">
                Pricing
              </li>
            </Link>

            <div className="ml-10 hover:text-[#990011] text-xl">
              {session?.user ? (
                <>
                  <div className="relative inline-block group">
                    <button
                      className="uppercase text-[#990011] hover:text-[#990011] group-hover:text-black focus:outline-none"
                      onClick={toggleDropdown}
                    >
                      {session.user.name}
                      <span
                        className={`${
                          dropdownVisible ? "rotate-180" : "rotate-0"
                        } transition-transform inline-block ml-2`}
                      >
                        &#9660;
                      </span>
                    </button>

                    {dropdownVisible && (
                      <div className="absolute mt-2 flex flex-col gap-2">
                        <Link href="/user">
                          <li className="block px-10 py-2 text-[#990011] hover:bg-[#990011] hover:text-white text-left focus:outline-none rounded-lg shadow-lg bg-[#FCF6F5]">
                            User
                          </li>
                        </Link>
                        <Link href="/styles">
                          <li className="block px-10 py-2 text-[#990011] hover:bg-[#990011] hover:text-white text-left focus:outline-none rounded-lg shadow-lg bg-[#FCF6F5]">
                            Styles
                          </li>
                        </Link>
                        <Link href="/explore">
                          <li className="block px-10 py-2 text-[#990011] hover:bg-[#990011] hover:text-white text-left focus:outline-none rounded-lg shadow-lg bg-[#FCF6F5]">
                            Explore
                          </li>
                        </Link>
                        <button
                          className="block px-10 py-2 text-[#990011] hover:bg-[#990011] hover:text-white  text-left focus:outline-none rounded-lg shadow-lg bg-[#FCF6F5] "
                          onClick={() => {
                            signOut();
                            toggleDropdown();
                          }}
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <Link href="/login" className="uppercase">
                  Log In
                </Link>
              )}
            </div>
          </ul>
        </div>
        <div onClick={handleNav} className="sm:hidden cursor-pointer pl-20">
          <AiOutlineMenu size={25} className="hover:text-[#990011]" />
        </div>
      </div>
      <div
        className={
          menuOpen
            ? "fixed left-0 top-0 w-[65%] sm:hidden h-screen bg-[#ecf0f3] p-10 ease-in duration-500"
            : "fixed left-[100%] top-0 p-10 "
        }
      >
        <div className="flex w-full items-center justify-end">
          <div onClick={handleNav} className="cursor-pointer">
            <AiOutlineClose size={25} className="hover:text-[#990011]" />
          </div>
        </div>
        <div className="flex-col py-4">
          <ul>
            <Link href="/Login">
              <li
                onClick={() => setMenuopen(false)}
                className="py-4 cursor-pointer hover:text-[#990011]"
              >
                Login
              </li>
            </Link>
            <Link href="/">
              <li
                onClick={() => setMenuopen(false)}
                className="py-4 cursor-pointer hover:text-[#990011]"
              >
                Home
              </li>
            </Link>
            <Link href="/About">
              <li
                onClick={() => setMenuopen(false)}
                className="py-4 cursor-pointer hover:text-[#990011]"
              >
                About
              </li>
            </Link>
            <Link href="/ContactMe">
              <li
                onClick={() => setMenuopen(false)}
                className="py-4 cursor-pointer hover:text-[#990011]"
              >
                Contact Me
              </li>
            </Link>
            <Link href="/Pricing">
              <li
                onClick={() => setMenuopen(false)}
                className="py-4 cursor-pointer hover:text-[#990011]"
              >
                Pricing
              </li>
            </Link>
          </ul>
        </div>
        <div className="flex flex-row justify-around pt-10 items-center">
          <AiOutlineFacebook
            size={30}
            className="cursor-pointer hover:text-[#990011]"
          />
          <AiOutlineInstagram
            size={30}
            className="cursor-pointer hover:text-[#990011]"
          />
          <AiOutlineYoutube
            size={30}
            className="cursor-pointer hover:text-[#990011]"
          />
        </div>
        <div className="flex justify-center items-center pt-20">
          <Image src={Logo} width={45} height={1} alt="Logo" priority />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
