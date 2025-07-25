"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Logo from "../../../public/Flystick_logo.svg";
import { AiOutlineMenu, AiOutlineClose, AiOutlineInstagram, AiOutlineFacebook, AiOutlineYoutube, AiOutlineHome, AiOutlineInfoCircle, AiOutlinePhone, AiOutlineDollar, AiOutlineLogin } from "react-icons/ai";
import { motion, AnimatePresence, Variants } from "framer-motion";

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
  const { data: session } = useSession();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Get video player state from context
  const { isVideoOpen } = useVideoPlayer();

  // Handle pricing navigation - scroll to pricing section or navigate to home page with anchor
  const handlePricingClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // If we're on the home page, scroll to pricing section
    if (pathname === '/') {
      const pricingElement = document.getElementById('Pricing');
      if (pricingElement) {
        pricingElement.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    } else {
      // If we're on another page, navigate to home page with pricing anchor
      window.location.href = '/#Pricing';
    }
    
    // Close mobile menu if open
    closeMobileMenu();
  };

  // Handle contact navigation - scroll to contact section or navigate to home page with anchor
  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // If we're on the home page, scroll to contact section
    if (pathname === '/') {
      const contactElement = document.getElementById('Contact');
      if (contactElement) {
        contactElement.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    } else {
      // If we're on another page, navigate to home page with contact anchor
      window.location.href = '/#Contact';
    }
    
    // Close mobile menu if open
    closeMobileMenu();
  };

  // Navigation links with icons for improved UX
  const navigationLinks: NavigationLink[] = [
    { href: "/", label: "בית", icon: AiOutlineHome },
    { href: "/styles", label: "טכניקות", icon: AiOutlineInfoCircle },
    { href: "/about", label: "אודות", icon: AiOutlineInfoCircle },
    { href: "/#Contact", label: "צור קשר", icon: AiOutlinePhone },
    { href: "/#Pricing", label: "מחיר", icon: AiOutlineDollar }
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

  // Always show navbar background - no scroll listener needed for performance
  useEffect(() => {
    // Set navbar to always be non-transparent to avoid scroll calculations
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

      
      {/* Decorative border - organic wabi-sabi style */}


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
                  href={link.href}
                  onClick={(e) => {
                    // Handle pricing navigation specially
                    if (link.label === "מחיר") {
                      handlePricingClick(e);
                    }
                    // Handle contact navigation specially
                    if (link.label === "צור קשר") {
                      handleContactClick(e);
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
                    whileHover={{ opacity: 0.9 }}
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
                        className="absolute left-0 mt-2 w-44 sm:w-48 bg-[#FFFCF7] border border-[#D0C8B0]/30 rounded-tl-lg rounded-br-lg rounded-tr-sm rounded-bl-sm shadow-md overflow-hidden z-10"
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
            className="fixed top-0 right-0 h-screen w-[85%] sm:w-3/4 md:hidden bg-[#F7F3EB] p-4 sm:p-6 z-[101] shadow-md overflow-y-auto dir-rtl rounded-l-lg"
          >
            {/* Texture overlay for mobile menu */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {/* Texture removed */}
            </div>
            
            {/* Decorative element */}
    

            
            {/* Decorative element bottom */}

            
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
                    whileHover={{ opacity: 0.9 }}
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
                      href={link.href} 
                      onClick={(e) => {
                        // Handle pricing navigation specially
                        if (link.label === "מחיר") {
                          e.preventDefault();
                          // Close mobile menu first
                          closeMobileMenu();
                          
                          // If we're on the home page, scroll to pricing section
                          if (pathname === '/') {
                            setTimeout(() => {
                              const pricingElement = document.getElementById('Pricing');
                              if (pricingElement) {
                                pricingElement.scrollIntoView({ 
                                  behavior: 'smooth',
                                  block: 'start'
                                });
                              }
                            }, 100);
                          } else {
                            // If we're on another page, navigate to home page with pricing anchor
                            window.location.href = '/#Pricing';
                          }
                        }
                        // Handle contact navigation specially
                        else if (link.label === "צור קשר") {
                          e.preventDefault();
                          // Close mobile menu first
                          closeMobileMenu();
                          
                          // If we're on the home page, scroll to contact section
                          if (pathname === '/') {
                            setTimeout(() => {
                              const contactElement = document.getElementById('Contact');
                              if (contactElement) {
                                contactElement.scrollIntoView({ 
                                  behavior: 'smooth',
                                  block: 'start'
                                });
                              }
                            }, 100);
                          } else {
                            // If we're on another page, navigate to home page with contact anchor
                            window.location.href = '/#Contact';
                          }
                        } else {
                          closeMobileMenu();
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
                    whileHover={{ opacity: 0.9 }}
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
                    // Removed infinite animation to prevent CPU/GPU overheating
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