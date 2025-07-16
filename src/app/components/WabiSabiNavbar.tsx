"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Logo from "../../../public/Flystick_logo.svg";
import { AiOutlineMenu, AiOutlineClose, AiOutlineInstagram, AiOutlineFacebook, AiOutlineYoutube, AiOutlineHome, AiOutlineInfoCircle, AiOutlinePhone, AiOutlineDollar, AiOutlineLogin } from "react-icons/ai";
import * as FramerMotion from "framer-motion";
const { motion, AnimatePresence } = FramerMotion;
type Variants = FramerMotion.Variants;

import DropdownMenu from "./DropdownMenu";
import { useVideoPlayer } from "../context/VideoPlayerContext";

interface WabiSabiNavbarProps {}

type NavigationLink = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
};

type SocialLink = {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const WabiSabiNavbar = () => {
  // State management
  const [isTransparent, setIsTransparent] = useState(true);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Get video player state from context
  const { isVideoOpen } = useVideoPlayer();
  
  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (!session?.user?.email) return;
      
      try {
        const response = await fetch("/api/check-admin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: session.user.email }),
        });
        
        const data = await response.json();
        // Only show admin link if user is actually an admin (not free or trial_30)
        setIsAdmin(data.isAdmin && data.subscriptionId === "Admin");
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    };
    
    if (session?.user) {
      checkAdmin();
    }
  }, [session]);

  // Navigation links with icons for improved UX
  const navigationLinks: NavigationLink[] = [
    { href: "/", label: "בית", icon: AiOutlineHome },
    { href: "/about", label: "אודות", icon: AiOutlineInfoCircle },
    { href: "/contact", label: "צור קשר", icon: AiOutlinePhone },
    { href: "/", label: "מחיר", icon: AiOutlineDollar },
    ...(isAdmin ? [{ href: "/admin", label: "ניהול", icon: AiOutlineLogin }] : [])
  ];
  
  // Social media links
  const socialLinks: SocialLink[] = [
    {
      name: "Facebook",
      href: "https://www.facebook.com/groups/boazit",
      icon: AiOutlineFacebook
    },
    {
      name: "Instagram",
      href: "https://www.instagram.com/theflystick/",
      icon: AiOutlineInstagram
    },
    {
      name: "YouTube",
      href: "https://www.youtube.com/channel/UCYnB2VBZ3AwwzFTPETNZYmQ",
      icon: AiOutlineYoutube
    }
  ];

  // Page title mapping for header display
  const pageTitles: Record<string, string> = {
    "/explore": "חיפוש אישי",
    "/styles": "טכניקות",
    "/dashboard": "איזור אישי",
    "/user": "הספרייה שלי",
  };

  // Determine current page title
  const isUserFolder = pathname.startsWith("/user/");
  let pageTitle = pageTitles[pathname] || "";

  if (isUserFolder && pathname !== "/user") {
    const folderName = decodeURIComponent(pathname.split("/")[2] || "");
    const folderMap: Record<string, string> = {
      favorites: "המועדפים שלי",
      watched: "השיעורים שצפית",
    };
    pageTitle = folderMap[folderName] || folderName;
  }

  if (!pageTitle && session?.user?.name) {
    pageTitle = session.user.name;
  }

  const currentPath = usePathname();

  // Check if current path matches link path
  const isActiveLink = (path: string) => path === pathname;

  // Always show navbar background
  useEffect(() => {
    // Set navbar to always be non-transparent
    setIsTransparent(false);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownVisible(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownRef]);

  // Toggle user dropdown menu
  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  // Close mobile menu
  const closeMobileMenu = () => {
    setMenuOpen(false);
  };
  
  // Animation variants for navbar elements
  const navItemVariants: Variants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 }
  };
  
  // Animation variants for mobile menu
  const mobileMenuVariants: Variants = {
    closed: { x: "100%" },
    open: { x: 0 }
  };
  
  // Animation transition for staggered children
  const staggerTransition = {
    duration: 0.3,
    ease: "easeInOut" // Using string easing that framer-motion supports
  };

  // Don't render navbar when video is open
  if (isVideoOpen) {
    return null;
  }
  
  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 bg-[#F7F3EB]/95 backdrop-blur-sm shadow-sm`}
    >
      {/* Texture overlay */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-10" style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23D5C4B7' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px'
        }}></div>
      </div>
      
      {/* Decorative border - organic wabi-sabi style */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#D0C8B0]/40 overflow-hidden">
        <svg width="100%" height="3" viewBox="0 0 1200 3" preserveAspectRatio="none">
          <path 
            d="M0,1 C100,2 200,0.5 300,1.5 C400,2.5 500,0 600,1 C700,2 800,0.5 900,1.5 C1000,2.5 1100,0 1200,1" 
            stroke="#8E9A7C" 
            strokeWidth="0.5" 
            fill="none"
          />
        </svg>
      </div>

      <div className="max-w-[1240px] mx-auto flex justify-between items-center h-full px-3 sm:px-4 dir-rtl">
        {/* Logo and Page Title */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center"
        >
          <Link href="/">
            <div className="relative">
              <Image 
                src={Logo} 
                width={32} 
                height={1} 
                alt="Logo" 
                priority 
                className="hover:opacity-80 transition-opacity duration-300 sm:w-[35px]"
              />
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-[#D9845E]/10 blur-md rounded-full opacity-0 hover:opacity-30 transition-opacity duration-500"></div>
            </div>
          </Link>
          {pageTitle && (
            <motion.h1 
              initial={{ opacity: 0, x: 10 }} 
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mr-3 sm:mr-4 text-lg sm:text-xl text-[#5D5D5D]"
            >
              {pageTitle}
            </motion.h1>
          )}
        </motion.div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center">
          {/* Navigation Links */}
          <ul className="flex items-center">
            {navigationLinks.map((link, i) => (
              <motion.li 
                key={link.href} 
                className="ml-8"
                initial="hidden"
                animate="visible"
                variants={navItemVariants}
                transition={{ delay: i * 0.1, duration: 0.3 }}
              >
                <Link 
                  href={link.label === "מחיר" ? "/#Pricing" : link.href}
                  onClick={(e) => {
                    if (link.label === "מחיר") {
                      e.preventDefault();
                      const pricingSection = document.getElementById('Pricing');
                      if (pricingSection) {
                        pricingSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }
                  }}
                >
                  <div className="flex items-center">
                    <span className={`text-lg ${
                      isActiveLink(link.href)
                        ? "text-[#B56B4A] border-b border-[#B56B4A]"
                        : "text-[#5D5D5D] hover:text-[#B56B4A]"
                      } transition-colors duration-300`}
                    >
                      {link.label}
                    </span>
                  </div>
                </Link>
              </motion.li>
            ))}
            
            {/* User Menu or Login Button */}
            <motion.div 
              className="mr-6 relative"
              initial="hidden"
              animate="visible"
              variants={navItemVariants}
              transition={{ delay: navigationLinks.length * 0.1, duration: 0.3 }}
            >
              {session?.user ? (
                <div className="relative" ref={dropdownRef}>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    onClick={toggleDropdown}
                    className="text-[#5D5D5D] bg-[#E5DFD0] hover:bg-[#D5C4B7] border border-[#D0C8B0]/50 rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm px-3 sm:px-4 py-1.5 sm:py-2 transition duration-300 ease-in-out flex items-center"
                  >
                    <span className="ml-2">
                      תפריט
                    </span>
                    <span className="text-sm">▼</span>
                  </motion.button>
                  
                  <AnimatePresence>
                    {dropdownVisible && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-0 mt-2 w-44 sm:w-48 bg-[#FFFCF7] border border-[#D0C8B0]/30 rounded-tl-lg rounded-br-lg rounded-tr-sm rounded-bl-sm shadow-lg overflow-hidden z-10"
                      >
                        <DropdownMenu onClose={() => setDropdownVisible(false)} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link href="/login">
                  <motion.span
                    whileHover={{ y: -2 }}
                    className="text-[#B56B4A] bg-transparent border border-[#B56B4A]/50 hover:bg-[#F7F3EB] rounded-tl-lg rounded-br-lg rounded-tr-sm rounded-bl-sm px-3 sm:px-4 py-1.5 sm:py-2 transition duration-300 ease-in-out text-base sm:text-lg"
                  >
                    התחבר
                  </motion.span>
                </Link>
              )}
            </motion.div>
          </ul>
        </div>

        {/* Mobile Menu Button */}
        <motion.div 
          onClick={toggleMobileMenu}
          whileTap={{ scale: 0.95 }}
          className="md:hidden cursor-pointer bg-[#E5DFD0]/70 p-2.5 rounded-full shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center"
        >
          <AiOutlineMenu size={20} className="text-[#8E9A7C] hover:text-[#B56B4A] transition-colors duration-300" />
        </motion.div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={mobileMenuVariants}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-0 right-0 h-screen w-[85%] sm:w-3/4 md:hidden bg-[#F7F3EB] p-4 sm:p-6 z-[101] shadow-lg overflow-y-auto dir-rtl rounded-l-lg"
          >
            {/* Texture overlay for mobile menu */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {/* Texture removed */}
            </div>
            
            {/* Decorative element */}
            <div className="absolute top-0 left-0 w-32 h-32 opacity-10 -rotate-12">
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <path
                  fill="#B8A99C"
                  d="M47.7,-51.2C59.5,-37.7,65.5,-19.9,65.2,-2.6C64.9,14.7,58.3,31.8,46.5,43.9C34.7,56,17.3,63.1,0.2,62.9C-17,62.7,-34,55.2,-47.2,43C-60.5,30.8,-70,14.4,-70.3,-2.5C-70.6,-19.4,-61.8,-36.8,-48.4,-50.3C-35,-63.8,-17.5,-73.4,0.5,-74C18.5,-74.6,36.9,-64.7,47.7,-51.2Z"
                />
              </svg>
            </div>
            
            {/* Decorative element bottom */}
            <div className="absolute bottom-0 right-0 w-40 h-40 opacity-10 rotate-45">
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <path
                  fill="#D5C4B7"
                  d="M39.5,-65.3C50.2,-55.1,57.2,-42.1,63.4,-28.8C69.6,-15.5,74.9,-1.9,73.1,10.7C71.3,23.3,62.3,34.8,51.6,42.8C40.9,50.8,28.5,55.3,15.3,60.5C2.2,65.7,-11.7,71.7,-24.4,69.9C-37.1,68.1,-48.5,58.6,-57.4,47C-66.3,35.4,-72.6,21.7,-74.3,7.2C-76,-7.3,-73,-22.5,-65.3,-34.2C-57.6,-45.9,-45.2,-54,-32.5,-63.8C-19.8,-73.6,-6.6,-85.1,5.2,-83.3C17,-81.5,28.8,-75.5,39.5,-65.3Z"
                />
              </svg>
            </div>
            
            {/* Mobile menu header with close button */}
            <div className="flex justify-end mb-6">
              <motion.button
                onClick={closeMobileMenu}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full bg-[#E5DFD0]/70 hover:bg-[#D5C4B7]/70 transition-colors duration-300 focus:outline-none"
              >
                <AiOutlineClose size={18} className="text-[#8E9A7C]" />
              </motion.button>
            </div>
            
            {/* User info if logged in */}
            {session?.user && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 sm:mb-8 p-4 sm:p-5 bg-gradient-to-l from-[#E5DFD0]/70 to-[#E5DFD0]/40 rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm border border-[#D0C8B0]/30 shadow-sm"
              >
                <div className="flex flex-col items-start">
                  <div className="flex justify-end mb-2">
                    <div className="text-right">
                      <p className="text-[#5D5D5D] text-base sm:text-lg font-medium">
                        שלום, <span className="text-[#B56B4A]">{session.user.name?.split(" ")[0] || "משתמש"}</span>
                      </p>
                      <p className="text-xs sm:text-sm text-[#8E9A7C]">{session.user.email}</p>
                    </div>
                  </div>
                  <div className="w-full h-0.5 bg-gradient-to-l from-[#B56B4A]/30 to-transparent rounded-full"></div>
                </div>
              </motion.div>
            )}
            
            {/* Additional menu items for logged in users */}
            {session?.user && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-8 space-y-4"
              >
                <h3 className="text-[#8E9A7C] font-medium mb-3 sm:mb-4 pr-1 text-base sm:text-lg">האיזור האישי שלך</h3>
                <motion.div className="space-y-4">
                  <Link href="/dashboard" onClick={closeMobileMenu}>
                    <motion.div 
                      className="flex items-center justify-end py-2 border-b border-[#D0C8B0]/20"
                      whileHover={{ x: -5, transition: { duration: 0.2 } }}
                    >
                      <span className="text-lg text-[#5D5D5D] hover:text-[#B56B4A] transition-colors duration-300 text-right w-full">
                        איזור אישי
                      </span>
                      <div className="mr-2 p-1.5 rounded-full bg-[#8E9A7C]/5">
                        <svg className="h-4 w-4 text-[#8E9A7C]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                        </svg>
                      </div>
                    </motion.div>
                  </Link>
                  <Link href="/user" onClick={closeMobileMenu}>
                    <motion.div 
                      className="flex items-center justify-end py-2 border-b border-[#D0C8B0]/20"
                      whileHover={{ x: -5, transition: { duration: 0.2 } }}
                    >
                      <span className="text-lg text-[#5D5D5D] hover:text-[#B56B4A] transition-colors duration-300 text-right w-full">
                        הספרייה שלי
                      </span>
                      <div className="mr-2 p-1.5 rounded-full bg-[#8E9A7C]/5">
                        <svg className="h-4 w-4 text-[#8E9A7C]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z" />
                        </svg>
                      </div>
                    </motion.div>
                  </Link>
                  <Link href="/styles" onClick={closeMobileMenu}>
                    <motion.div 
                      className="flex items-center justify-end py-2 border-b border-[#D0C8B0]/20"
                      whileHover={{ x: -5, transition: { duration: 0.2 } }}
                    >
                      <span className="text-lg text-[#5D5D5D] hover:text-[#B56B4A] transition-colors duration-300 text-right w-full">
                        טכניקות
                      </span>
                      <div className="mr-2 p-1.5 rounded-full bg-[#8E9A7C]/5">
                        <svg className="h-4 w-4 text-[#8E9A7C]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-2V9h-2V7h4v10z" />
                        </svg>
                      </div>
                    </motion.div>
                  </Link>
                  <Link href="/explore" onClick={closeMobileMenu}>
                    <motion.div 
                      className="flex items-center justify-end py-2 border-b border-[#D0C8B0]/20"
                      whileHover={{ x: -5, transition: { duration: 0.2 } }}
                    >
                      <span className="text-lg text-[#5D5D5D] hover:text-[#B56B4A] transition-colors duration-300 text-right w-full">
                        חיפוש אישי
                      </span>
                      <div className="mr-2 p-1.5 rounded-full bg-[#8E9A7C]/5">
                        <svg className="h-4 w-4 text-[#8E9A7C]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                        </svg>
                      </div>
                    </motion.div>
                  </Link>
                  <button onClick={() => signOut()}>
                    <motion.div 
                      className="flex items-center justify-end py-2 border-b border-[#D0C8B0]/20"
                      whileHover={{ x: -5, transition: { duration: 0.2 } }}
                    >
                      <span className="text-lg text-[#5D5D5D] hover:text-[#B56B4A] transition-colors duration-300 text-right w-full">
                        החלף משתמש
                      </span>
                      <div className="mr-2 p-1.5 rounded-full bg-[#B56B4A]/10">
                        <svg className="h-4 w-4 text-[#B56B4A]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                        </svg>
                      </div>
                    </motion.div>
                  </button>
                </motion.div>
              </motion.div>
            )}
            
            {/* Login button for non-authenticated users */}
            {!session?.user && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-8 flex justify-center"
              >
                <Link href="/login" onClick={closeMobileMenu}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="text-[#B56B4A] bg-transparent border-2 border-[#B56B4A]/50 hover:bg-[#F7F3EB] rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm px-5 sm:px-6 py-2.5 sm:py-3 transition duration-300 ease-in-out flex items-center"
                  >
                    <AiOutlineLogin className="ml-2" size={20} />
                    <span className="text-base sm:text-lg font-medium">התחבר</span>
                  </motion.div>
                </Link>
              </motion.div>
            )}
            
            {/* Navigation Links */}
            <div className="flex-col mb-8">
              <h3 className="text-[#8E9A7C] font-medium mb-3 sm:mb-4 pr-1 text-base sm:text-lg">תפריט ראשי</h3>
              <ul className="text-lg sm:text-xl space-y-3 sm:space-y-4">
                {navigationLinks.map((link, index) => (
                  <motion.li 
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }} 
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    className={`py-2 cursor-pointer border-b ${isActiveLink(link.href) ? 'border-[#B56B4A]/30' : 'border-[#D0C8B0]/20'}`}
                    whileHover={{ x: -5, transition: { duration: 0.2 } }}
                  >
                    <Link 
                      href={link.label === "מחיר" ? "/#Pricing" : link.href} 
                      onClick={(e) => {
                        closeMobileMenu();
                        if (link.label === "מחיר") {
                          e.preventDefault();
                          const pricingSection = document.getElementById('Pricing');
                          if (pricingSection) {
                            setTimeout(() => {
                              pricingSection.scrollIntoView({ behavior: 'smooth' });
                            }, 300);
                          }
                        }
                      }}
                    >
                      <div className="flex items-center justify-end py-1.5 sm:py-2"> 
                        <span className={`text-base sm:text-lg ${
                          isActiveLink(link.href)
                            ? "text-[#B56B4A] font-medium"
                            : "text-[#5D5D5D] hover:text-[#B56B4A]"
                        } transition-colors duration-300 text-right w-full`}>
                          {link.label}
                        </span>
                        <div className={`mr-2 p-1.5 rounded-full ${isActiveLink(link.href) ? 'bg-[#B56B4A]/10' : 'bg-[#8E9A7C]/5'}`}>
                          <link.icon className={isActiveLink(link.href) ? 'text-[#B56B4A]' : 'text-[#8E9A7C]'} size={18} />
                        </div>
                      </div>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Social Links */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-10 pt-4"
            >
              <h3 className="text-[#8E9A7C] text-sm font-medium mb-4 text-center">בואו לעקוב אחרינו</h3>
              <div className="flex space-x-6 space-x-reverse justify-center">
                {socialLinks.map((item, index) => (
                  <motion.a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#8E9A7C] hover:text-[#B56B4A] transition-colors duration-300 p-1.5"
                    whileHover={{ scale: 1.1 }}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + (index * 0.1) }}
                  >
                    <span className="sr-only">{item.name}</span>
                    <item.icon className="h-5 sm:h-6 w-5 sm:w-6" aria-hidden="true" />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Logo in mobile menu */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex justify-center items-center mt-12 mb-6"
            >
              <div className="relative">
                <Image src={Logo} width={40} height={1} alt="Logo" priority className="hover:opacity-80 transition-opacity duration-300" />
                {/* Subtle glow effect */}
                <motion.div 
                  className="absolute inset-0 bg-[#D9845E]/10 blur-md rounded-full opacity-30"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity,
                    repeatType: "reverse" as const
                  }}
                ></motion.div>
              </div>
            </motion.div>
            
            {/* Copyright */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center text-xs text-[#8E9A7C]/70 mt-4"
            >
              {new Date().getFullYear()} Studio Boaz. כל הזכויות שמורות.
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default WabiSabiNavbar;
