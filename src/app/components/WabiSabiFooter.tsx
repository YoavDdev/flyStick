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
    <footer className="relative overflow-hidden" aria-labelledby="footer-heading" style={{ background: 'linear-gradient(135deg, #F7F3EB 0%, #E8DDD0 50%, #D5C4B7 100%)' }}>
      {/* Desert-inspired subtle background pattern */}
      <div className="absolute inset-0 opacity-10">
        {/* Removed extremely GPU-intensive blur filter to prevent overheating */}
        {/* Removed extremely GPU-intensive blur filter to prevent overheating */}
      </div>
      
      {/* Floating cards approach */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        {/* Floating Cards Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          
          {/* Brand Card */}
          <motion.div 
            className="bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300"
            whileHover={{ y: -5, opacity: 0.9 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <Image 
                  src={Logo} 
                  width={50} 
                  height={50} 
                  alt="סטודיו בועז אונליין" 
                  priority 
                  className="h-auto"
                />
              </div>
              <p className="text-sm leading-relaxed" style={{ color: '#2D3142' }}>
                סטודיו אונליין של בועז נחייסי - המקום שלך לפילאטיס, יוגה ותנועה מכל מקום ובכל זמן.
              </p>
              <div className="flex justify-center space-x-4 rtl:space-x-reverse mt-6">
                {socialLinks.map((item) => (
                  <motion.a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    className="transition-colors duration-200 p-2 rounded-full"
                    style={{ color: '#B8A99C' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#2D3142';
                      e.currentTarget.style.backgroundColor = 'rgba(213, 196, 183, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#B8A99C';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    whileHover={{ opacity: 0.9 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="sr-only">{item.name}</span>
                    <item.icon size={20} aria-hidden="true" />
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Quick Links Card */}
          <motion.div 
            className="bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300"
            whileHover={{ y: -5, opacity: 0.9 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-white font-semibold text-lg mb-4 text-center">
              ניווט מהיר
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <motion.li 
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <Link 
                    href={link.href}
                    className="transition-colors duration-200 block py-2 px-3 rounded-lg text-center"
                    style={{ color: '#2D3142' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#B8A99C';
                      e.currentTarget.style.backgroundColor = 'rgba(213, 196, 183, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#2D3142';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {link.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Newsletter Card */}
          <motion.div 
            className="bg-white/10 rounded-2xl p-6 border transition-all duration-300"
            style={{ 
              background: 'linear-gradient(135deg, rgba(213, 196, 183, 0.3) 0%, rgba(184, 169, 156, 0.3) 100%)',
              borderColor: '#B8A99C',
              boxShadow: '0 2px 8px rgba(181, 169, 156, 0.15)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(213, 196, 183, 0.5) 0%, rgba(184, 169, 156, 0.5) 100%)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(181, 169, 156, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(213, 196, 183, 0.3) 0%, rgba(184, 169, 156, 0.3) 100%)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(181, 169, 156, 0.15)';
            }}
            whileHover={{ y: -5, opacity: 0.9 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-white font-semibold text-lg mb-4 text-center">
              הירשמו לניוזלטר שלנו
            </h3>
            <p className="text-sm mb-4 text-center leading-relaxed" style={{ color: '#2D3142', opacity: '0.8' }}>
              עדכון ארועים, חדשות, שיעורים חדשים העולים לאתר ישלחו לתיבת הדואר שלכם.
            </p>
            <div className="rounded-xl p-4 bg-white/10" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', border: '1px solid #D5C4B7' }}>
              <NewsletterSignUpForm />
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div 
          className="pt-8 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0"
          style={{ borderTop: '1px solid #D5C4B7' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="text-center md:text-right">
            <p className="text-sm" style={{ color: '#2D3142', opacity: '0.7' }}>
              &copy; {new Date().getFullYear()} סטודיו בועז אונליין. כל הזכויות שמורות.
            </p>
          </div>
          <div className="flex flex-wrap justify-center md:justify-start space-x-6 rtl:space-x-reverse">
            {legalLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm transition-colors duration-200 hover:underline"
                style={{ color: '#2D3142', opacity: '0.7' }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default WabiSabiFooter;
