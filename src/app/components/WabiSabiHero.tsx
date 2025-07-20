"use client";

import React from "react";
import SubscriptionDetails from "../api/SubscriptionDetails";
import Link from "next/link";
import { motion } from "framer-motion";

const WabiSabiHero = () => {
  const { subscriptionStatus, loading } = SubscriptionDetails();

  return (
    <section className="min-h-screen flex items-center justify-center py-20">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          
          <div className="text-center">
            <motion.h1 
              className="text-5xl md:text-6xl lg:text-7xl font-light mb-6 leading-tight tracking-tight"
              style={{ 
                color: '#F5F1EB',
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.5), 0 4px 16px rgba(0, 0, 0, 0.3)'
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <span>
                סטודיו בועז
              </span>
              <br />
              <span className="text-4xl md:text-5xl lg:text-6xl opacity-90">
                אונליין
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-lg md:text-xl font-light mb-10 max-w-4xl mx-auto leading-relaxed"
              style={{ 
                color: '#F5F1EB',
                textShadow: '0 1px 4px rgba(0, 0, 0, 0.6)'
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8, ease: "easeOut" }}
            >
              לצלול אל אוסף עצום נדיר של שיעורים ותרגולי גוף, שנבחרו בקפידה ומוגשים לכם בכדי לחזק בכם את הקשר בין הנפש לגוף ולהעצים את הרווחה האישית בעזרת טכניקות אימון מגוונות ורמות קושי מותאמות. אני מזמין אתכם להצטרף אל דרכי הייחודית להבין את החיים.
            </motion.p>
            
            {!loading && (
              <motion.div 
                className="flex flex-col sm:flex-row gap-6 justify-center items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
              >
                {subscriptionStatus === "ACTIVE" ? (
                  <Link href="/explore">
                    <motion.button
                      className="group px-10 py-4 rounded-2xl text-white font-medium text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl relative overflow-hidden backdrop-blur-md"
                      style={{ 
                        background: 'linear-gradient(135deg, rgba(139, 115, 85, 0.9) 0%, rgba(107, 91, 71, 0.9) 100%)',
                        boxShadow: '0 8px 32px -8px rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="relative z-10">המשיכו לחקור</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </motion.button>
                  </Link>
                ) : (
                  <Link href="/register">
                    <motion.button
                      className="group px-10 py-4 rounded-2xl text-white font-medium text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl relative overflow-hidden backdrop-blur-md"
                      style={{ 
                        background: 'linear-gradient(135deg, rgba(139, 115, 85, 0.9) 0%, rgba(107, 91, 71, 0.9) 100%)',
                        boxShadow: '0 8px 32px -8px rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="relative z-10">
הצטרפו לדרכי הייחודית
                        <br />
                        <span className="text-sm opacity-90">3 ימי חקירה ללא עלות</span>
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </motion.button>
                  </Link>
                )}
                
                <Link href="#features">
                  <motion.button
                    className="px-10 py-4 rounded-2xl font-medium text-lg border-2 transition-all duration-300 hover:scale-105 backdrop-blur-md"
                    style={{ 
                      color: '#F5F1EB',
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    למדו עוד על הדרך
                  </motion.button>
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WabiSabiHero;
