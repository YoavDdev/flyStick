'use client';

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaHome, FaArrowLeft } from "react-icons/fa";
import Image from "next/image";
import Logo from "../../../../public/Flystick_logo.svg";

export default function SeriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Hide main app navbar and footer with CSS
  const hideMainAppElements = `
    nav:not(.series-nav),
    footer:not(.series-footer),
    header:not(.series-header) {
      display: none !important;
    }
    
    /* Hide specific navbar/footer components */
    [data-component="navbar"],
    [data-component="footer"] {
      display: none !important;
    }
  `;

  return (
    <SessionProvider>
      <style jsx global>{hideMainAppElements}</style>
      {/* Override main app layout - no navbar/footer from main app */}
      <div className="min-h-screen bg-gradient-to-br from-[#F7F3EB] to-white" style={{ isolation: 'isolate' }}>
        {/* Custom Header for Series Page Only */}
        <header className="series-header fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#D5C4B7]/20">
          <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              {/* Logo/Brand */}
              <div className="flex items-center gap-2 sm:gap-3">
                <Image
                  src={Logo}
                  alt="Studio Boaz Logo"
                  width={50}
                  height={50}
                  className="object-contain w-[50px] h-[50px] sm:w-[40px] sm:h-[40px]"
                />
                <div>
                  <h1 className="text-base sm:text-xl font-bold text-[#2D3142]">Studio Boaz Online</h1>
                  <p className="text-xs sm:text-sm text-[#5D5D5D]">סדרות אימונים מקצועיות</p>
                </div>
              </div>

              {/* Navigation to Main Site */}
              <div className="flex items-center gap-4">
                <Link href="/">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1 sm:gap-2 bg-[#D5C4B7] text-[#2D3142] px-3 py-1.5 sm:px-6 sm:py-2 rounded-lg hover:bg-[#B8A99C] transition-colors font-medium text-xs sm:text-base"
                  >
                    <FaHome className="text-xs sm:text-sm" />
                    <span>לאתר הראשי</span>
                  </motion.button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content with top padding for fixed header */}
        <main className="pt-20">
          {children}
        </main>

        {/* Custom Series Footer */}
        <footer className="series-footer bg-gradient-to-br from-[#2D3142] via-[#4A4E69] to-[#6B5B95] text-white">
          {/* Main CTA Section */}
          <div className="py-16">
            <div className="container mx-auto px-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center max-w-4xl mx-auto"
              >
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  מוכנים לחקור עוד?
                </h2>
                <p className="text-xl text-white/90 mb-8 leading-relaxed">
                  הסדרות הן רק התחלה! גלו את האתר המלא שלנו עם מגוון רחב של שיעורים, טכניקות מתקדמות, 
                  תכנים מקצועיים ותמיכה אישית שתלווה בכל שלב במסע.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-[#D5C4B7] text-[#2D3142] px-10 py-4 rounded-xl font-bold hover:bg-white transition-colors text-lg shadow-lg w-full sm:w-[240px] border-2 border-transparent"
                    >
                      🏠 כנסו לאתר המלא
                    </motion.button>
                  </Link>
                  <Link href="/#pricing">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="border-2 border-white text-white px-10 py-4 rounded-xl font-bold hover:bg-white/10 transition-colors text-lg w-full sm:w-[240px]"
                    >
                      💎 הפעילו מנוי
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/20 py-6">
            <div className="container mx-auto px-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Image
                    src={Logo}
                    alt="Studio Boaz Logo"
                    width={32}
                    height={32}
                    className="object-contain"
                    style={{ width: 'auto', height: '32px' }}
                  />
                  <div>
                    <p className="font-bold text-white">Studio Boaz</p>
                    <p className="text-xs text-white/70">המסע מתחיל כאן</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 text-sm text-white/70">
                  <Link href="/contact" className="hover:text-white transition-colors">
                    צור קשר
                  </Link>
                  <Link href="/about" className="hover:text-white transition-colors">
                    אודות
                  </Link>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    תנאי שימוש
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </footer>

        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#2D3142',
              color: '#fff',
              borderRadius: '8px',
            },
          }}
        />
      </div>
    </SessionProvider>
  );
}
