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
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [menuOpen, setMenuopen] = useState(false);
  const { data: session } = useSession();

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

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleNav = () => {
    setMenuopen(!menuOpen);
  };

  const navigation = {
    social: [
      {
        name: "Facebook",
        href: "https://www.facebook.com/groups/boazit",
        icon: (
          props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>,
        ) => (
          <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
            <path
              fillRule="evenodd"
              d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
              clipRule="evenodd"
            />
          </svg>
        ),
      },
      {
        name: "Instagram",
        href: "https://www.instagram.com/",
        icon: (
          props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>,
        ) => (
          <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
            <path
              fillRule="evenodd"
              d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
              clipRule="evenodd"
            />
          </svg>
        ),
      },

      {
        name: "YouTube",
        href: "https://www.youtube.com/@BoazNahaissi",
        icon: (
          props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>,
        ) => (
          <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
            <path
              fillRule="evenodd"
              d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z"
              clipRule="evenodd"
            />
          </svg>
        ),
      },
    ],
  };

  return (
    <nav
      className={`w-full fixed top-0 left-0 h-20 shadow-xl z-50 ${
        !isTransparent ? " bg-[#FCF6F5] bg-opacity-75 " : "bg-[#FCF6F5] "
      }`}
    >
      <div className="flex justify-between items-center h-full w-full px-4 lg:px-16">
        <Link href="/">
          <Image
            src={Logo}
            width={25}
            // Set the height to "auto" to maintain aspect ratio
            alt="Logo"
            className="cursor-pointer ml-11"
            priority
          />
        </Link>

        <div className="hidden sm:flex">
          <ul className="hidden sm:flex">
            <li>
              <Link href="/" className="ml-10 hover:text-[#EF8354] text-xl">
                Home
              </Link>
            </li>
            <div
              className="ml-10 hover:text-[#EF8354] text-xl"
              onMouseEnter={toggleDropdown}
              onMouseLeave={toggleDropdown}
            >
              {session?.user ? (
                <>
                  <div className="relative inline-block group">
                    <button className=" text-[#EF8354] hover:text-[#990011] group-hover:text-black focus:outline-none">
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
                      <div className="absolute  flex flex-col gap-2">
                        <Link href="/user">
                          <li
                            className="block px-10 py-2 text-[#990011] hover:bg-[#990011] hover:text-white text-left focus:outline-none rounded-lg shadow-lg bg-[#FCF6F5]"
                            onClick={toggleDropdown}
                          >
                            Library
                          </li>
                        </Link>
                        <Link href="/styles">
                          <li
                            className="block px-10 py-2 text-[#990011] hover:bg-[#990011] hover:text-white text-left focus:outline-none rounded-lg shadow-lg bg-[#FCF6F5]"
                            onClick={toggleDropdown}
                          >
                            Styles
                          </li>
                        </Link>
                        <Link href="/explore">
                          <li
                            className="block px-10 py-2 text-[#990011] hover:bg-[#990011] hover:text-white text-left focus:outline-none rounded-lg shadow-lg bg-[#FCF6F5]"
                            onClick={toggleDropdown}
                          >
                            Explore
                          </li>
                        </Link>
                        <Link
                          href={"/"}
                          className="block px-10 py-2 text-[#990011] hover:bg-[#990011] hover:text-white  text-left focus:outline-none rounded-lg shadow-lg bg-[#FCF6F5] "
                          onClick={() => {
                            signOut();
                            toggleDropdown();
                          }}
                        >
                          Logout
                        </Link>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <Link href="/login" className="">
                  Log In
                </Link>
              )}
            </div>
            <li>
              <Link
                href="/about"
                className="ml-10 hover:text-[#EF8354] text-xl"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="ml-10 hover:text-[#EF8354] text-xl"
              >
                Contact Me
              </Link>
            </li>
            <li>
              <Link
                href="/#Pricing"
                className="ml-10 hover:text-[#EF8354] text-xl"
              >
                Pricing
              </Link>
            </li>
          </ul>
        </div>
        <div onClick={handleNav} className="sm:hidden cursor-pointer pl-20">
          <AiOutlineMenu size={25} className="hover:text-[#EF8354]" />
        </div>
      </div>
      <div
        className={`fixed top-0 left-0 h-screen w-2/3 sm:hidden bg-[#FCF6F5] p-10 ease-in-out duration-500 ${
          menuOpen ? "" : "transform -translate-x-full"
        }`}
      >
        <div className="flex justify-end items-center">
          <div onClick={handleNav} className="cursor-pointer">
            <AiOutlineClose size={25} className="hover:text-[#EF8354]" />
          </div>
        </div>
        <div className="flex-col pt-5">
          <ul className="text-xl">
            <li className="py-4 cursor-pointer hover:text-[#EF8354]">
              <Link href="/" onClick={() => setMenuopen(false)}>
                Home
              </Link>
            </li>
            {session?.user ? (
              <>
                <div className="relative inline-block group">
                  <button
                    className="text-[#EF8354] hover:text-[#990011] group-hover:text-black focus:outline-none py-4"
                    onClick={() => {
                      toggleDropdown();
                    }}
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
                    <ul className=" mt-2 flex flex-col gap-2">
                      <li>
                        <Link href="/user">
                          <span
                            className="block px-10 py-2 text-[#EF8354] hover:bg-[#990011] hover:text-white text-left focus:outline-none rounded-lg shadow-lg bg-[#FCF6F5] "
                            onClick={() => {
                              setMenuopen(false);
                              toggleDropdown();
                            }}
                          >
                            Library
                          </span>
                        </Link>
                      </li>
                      <li>
                        <Link href="/styles">
                          <span
                            className="block px-10 py-2 text-[#EF8354] hover:bg-[#990011] hover:text-white text-left focus:outline-none rounded-lg shadow-lg bg-[#FCF6F5] "
                            onClick={() => {
                              setMenuopen(false);
                              toggleDropdown();
                            }}
                          >
                            Styles
                          </span>
                        </Link>
                      </li>
                      <li>
                        <Link href="/explore">
                          <span
                            className="block px-10 py-2 text-[#990011] hover:bg-[#990011] hover:text-white text-left focus:outline-none rounded-lg shadow-lg bg-[#FCF6F5] "
                            onClick={() => {
                              setMenuopen(false);
                              toggleDropdown();
                            }}
                          >
                            Explore
                          </span>
                        </Link>
                      </li>
                      <li>
                        <Link href="/">
                          <span
                            className="block px-10 py-2 text-[#990011] hover:bg-[#990011] hover:text-white text-left focus:outline-none rounded-lg shadow-lg bg-[#FCF6F5] "
                            onClick={() => {
                              signOut();
                              setMenuopen(false);
                              toggleDropdown();
                            }}
                          >
                            Logout
                          </span>
                        </Link>
                      </li>
                    </ul>
                  )}
                </div>
              </>
            ) : (
              <li className="py-4 cursor-pointer hover:text-[#EF8354]">
                <Link
                  href="/login"
                  onClick={() => {
                    setMenuopen(false);
                  }}
                >
                  Log In
                </Link>
              </li>
            )}
            <li className="py-4 cursor-pointer hover:text-[#EF8354]">
              <Link href="/about" onClick={() => setMenuopen(false)}>
                About
              </Link>
            </li>
            <li className="py-4 cursor-pointer hover:text-[#EF8354]">
              <Link href="/contact" onClick={() => setMenuopen(false)}>
                Contact Me
              </Link>
            </li>
            <li className="py-4 cursor-pointer hover:text-[#EF8354]">
              <Link href="/#Pricing" onClick={() => setMenuopen(false)}>
                Pricing
              </Link>
            </li>
          </ul>
        </div>

        <div className="mt-8 border-t border-gray-900/10 pt-8 md:flex items-center justify-between">
          <div className="flex space-x-6 md:order-2 justify-between px-10">
            {navigation.social.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">{item.name}</span>
                <item.icon className="h-6 w-6" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        <div className="flex justify-center items-center pt-20">
          <Image src={Logo} width={45} height={1} alt="Logo" priority />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
