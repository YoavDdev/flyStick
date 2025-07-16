"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import Logo from "../../../public/Flystick_logo.svg";
import { AiOutlineInstagram, AiOutlineFacebook, AiOutlineYoutube } from "react-icons/ai";
import { motion } from "framer-motion";

import NewsletterSignUpForm from "./NewsletterSignUpForm";

type SocialLink = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
};

const WabiSabiFooter = () => {
  // Social media links with icons
  const socialLinks: SocialLink[] = [
    {
      name: "Instagram",
      href: "https://www.instagram.com/boaznahaissi?igsh=azQ0MXQxaHgxM2hy",
      icon: AiOutlineInstagram
    },
    {
      name: "Facebook",
      href: "https://www.facebook.com/boazpilates?mibextid=qi2Omg&rdid=ejgWCR8hCZbauwaZ&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2FQUc7icEH6EzScMN9%2F%3Fmibextid%3Dqi2Omg",
      icon: AiOutlineFacebook
    },
    {
      name: "YouTube",
      href: "https://www.youtube.com/@BoazNahaissi",
      icon: AiOutlineYoutube
    }
  ];

  // Quick links for footer navigation
  const quickLinks = [
    { name: "אודות", href: "/about" },
    { name: "צור קשר", href: "/contact" },
    { name: "מחיר", href: "/#Pricing" },
    { name: "המדריך לסטודיו", href: "/navigation" }
  ];

  // Legal links
  const legalLinks = [
    { name: "תקנון אתר", href: "/terms" },
    { name: "מדיניות פרטיות", href: "/privacyPolicy" },
    { name: "הצהרת נגישות", href: "/accessibility" }
  ];

  return (
    <footer className="relative overflow-hidden bg-[#F5F2EB] text-right shadow-sm pt-1" aria-labelledby="footer-heading">
      {/* Wabi-Sabi Texture Background */}
      <div className="absolute inset-0 z-0 opacity-20">
      </div>
      
      {/* Decorative wavy line at the top */}
      <div className="relative z-10">
        <svg className="w-full h-3 fill-[#E5DFD0]" viewBox="0 0 1200 24" preserveAspectRatio="none">
          <path 
            d="M0,0 C300,20 600,10 900,15 C1000,18 1100,22 1200,16 L1200,24 L0,24 Z" 
            className="text-[#E5DFD0]"
          />
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-3 sm:px-6 pt-6 pb-8 sm:pt-10 sm:pb-12 lg:px-8 lg:pt-12 lg:pb-16">        
        {/* Additional decorative element for medium+ screens */}
        <div className="absolute right-12 bottom-24 w-20 h-20 opacity-10 hidden md:block">
          <motion.svg 
            viewBox="0 0 100 100" 
            xmlns="http://www.w3.org/2000/svg"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
          >
            <circle cx="50" cy="50" r="40" fill="none" stroke="#D9845E" strokeWidth="1.5" strokeDasharray="5,5" />
          </motion.svg>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8 md:gap-12 border-b border-[#D9C5B3]/70 pb-5 sm:pb-8 md:pb-10 md:items-start md:justify-items-center">
          {/* Logo and About Section - Always first in DOM for semantics but visually ordered for RTL */}
          <div className="flex flex-col items-center order-1 md:order-3 md:w-full md:max-w-xs">
            <Link href="/" className="hidden md:block">
              <div className="relative mb-4">
                <Image 
                  src={Logo} 
                  width={35} 
                  height={1} 
                  alt="סטודיו בועז אונליין" 
                  priority 
                  className="h-auto"
                />
                {/* Subtle glow effect */}
                <div className="absolute inset-0 bg-[#D9845E]/10 blur-md rounded-full opacity-30"></div>
              </div>
            </Link>
            <p className="text-xs sm:text-sm text-[#5D5D5D] mb-2 sm:mb-4 text-center md:text-right">
              סטודיו אונליין של בועז נחייסי - המקום שלך לפילאטיס, יוגה ותנועה מכל מקום ובכל זמן.
            </p>
            <div className="flex justify-center space-x-5 rtl:space-x-reverse mt-2 sm:mt-4">
              {socialLinks.map((item) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  className="text-[#B56B4A] hover:text-[#D9845E] transition-colors duration-300 p-1"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon size={26} aria-hidden="true" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center md:text-center order-2 md:order-2 md:w-full md:max-w-xs">
            <h3 className="text-xs sm:text-sm font-medium text-[#B56B4A] mb-3 sm:mb-4 md:text-base md:relative md:inline-flex md:items-center md:justify-center md:gap-2">
              <span className="md:w-2 md:h-2 md:bg-[#D9845E]/50 md:rounded-full md:inline-block"></span>
              ניווט מהיר
              <span className="md:w-2 md:h-2 md:bg-[#D9845E]/50 md:rounded-full md:inline-block"></span>
            </h3>
            <ul className="space-y-1 sm:space-y-2 md:space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-sm text-[#5D5D5D] hover:text-[#B56B4A] transition-colors duration-300 md:hover:pr-1 py-1 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div className="text-center order-3 md:order-1 md:w-full md:max-w-xs">
            <h3 className="text-xs sm:text-sm font-medium text-[#B56B4A] mb-3 sm:mb-4 md:text-base md:relative md:inline-flex md:items-center md:justify-center md:gap-2">
              <span className="md:w-2 md:h-2 md:bg-[#D9845E]/50 md:rounded-full md:inline-block"></span>
              הירשמו לניוזלטר שלנו
              <span className="md:w-2 md:h-2 md:bg-[#D9845E]/50 md:rounded-full md:inline-block"></span>
            </h3>
            <p className="text-xs sm:text-sm text-[#5D5D5D] mb-2 sm:mb-4 md:leading-relaxed px-2 sm:px-0">
              עדכון ארועים, חדשות, שיעורים חדשים העולים לאתר ישלחו לתיבת הדואר שלכם.
            </p>
            <div className="mt-3 sm:mt-4 md:mt-6">
              <div className="newsletter-wabisabi md:bg-[#F7F3EB]/60 md:p-3 md:rounded-lg md:shadow-sm">
                <NewsletterSignUpForm />
              </div>
            </div>
          </div>
        </div>

        {/* Copyright and Legal */}
        <div className="pt-3 sm:pt-6 flex flex-col md:flex-row md:items-center md:justify-between md:pt-8 md:mt-2">
          <div className="text-xs text-[#5D5D5D] text-center md:text-right md:order-2">
            <div className="flex flex-wrap justify-center md:justify-end gap-x-2 gap-y-1">
              {legalLinks.map((link, idx) => (
                <React.Fragment key={link.name}>
                  <Link 
                    href={link.href}
                    className="hover:text-[#B56B4A] transition-colors duration-300 md:relative md:hover:opacity-80"
                  >
                    <motion.span 
                      className="relative md:after:absolute md:after:w-0 md:after:h-px md:after:bg-[#B56B4A] md:after:bottom-0 md:after:right-0 md:hover:after:w-full md:after:transition-all md:after:duration-300"
                      whileHover={{ y: -1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {link.name}
                    </motion.span>
                  </Link>
                  {idx < legalLinks.length - 1 && <span className="text-[#D9C5B3] mx-1 md:mx-2">|</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
          <p className="text-xs text-[#5D5D5D] mt-4 md:mt-0 text-center md:text-right md:order-1 md:bg-[#F7F3EB]/50 md:py-1 md:px-3 md:rounded-full md:shadow-sm">
            &copy; {new Date().getFullYear()} סטודיו אונליין של בועז נחייסי, בע&quot;מ. כל הזכויות שמורות.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default WabiSabiFooter;
