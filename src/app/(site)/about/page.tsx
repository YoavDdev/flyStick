"use client";

import React from "react";
import Image from "next/image";
import newBoazAbout from "../../../../public/newAboutboaz.jpg";
import * as FramerMotion from "framer-motion";

const { motion } = FramerMotion;

const WabiSabiAbout = () => {
  // Animation variants for Wabi-Sabi style
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 12,
      },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 80,
        damping: 15,
        delay: 0.2,
      },
    },
  };

  const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 6,
      // Removed infinite animation to prevent CPU/GPU overheating
      repeatType: "reverse" as const,
      ease: "easeInOut" as const,
    },
  };

  return (
    <div className="relative overflow-hidden pt-20 pb-16 bg-[#F7F3EB]">
      {/* Background decorative elements */}
      <div className="absolute top-20 right-10 w-64 h-64 opacity-5 hidden lg:block">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <path d="M25,25 Q40,10 60,25 T80,50 T60,75 T40,90 T25,75 Z" fill="none" stroke="#D5C4B7" strokeWidth="2" />
        </svg>
      </div>
      
      <motion.div 
        className="absolute top-40 left-10 w-40 h-40 opacity-5 hidden lg:block"
        animate={floatingAnimation}
      >
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#D5C4B7" strokeWidth="2" strokeDasharray="5,3" />
        </svg>
      </motion.div>
      
      <motion.div 
        className="absolute bottom-20 right-10 w-32 h-32 opacity-5 hidden lg:block"
        animate={{
          rotate: [0, 360],
          // Removed 40-second infinite animation to prevent CPU/GPU overheating
        }}
      >
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <path d="M20,20 Q40,5 60,20 T80,40 T60,60 T40,80 T20,60 Z" fill="none" stroke="#B8A99C" strokeWidth="2" />
        </svg>
      </motion.div>
      
      <div className="container relative z-10 mx-auto px-6 md:px-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-medium text-[#2D3142] mb-4">אודות</h1>
          <div className="w-32 h-1 bg-[#D5C4B7] mx-auto rounded-full"></div>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Image section - right side on desktop (RTL), bottom on mobile */}
          <motion.div 
            className="lg:col-span-5 lg:order-3 order-2 relative mt-8 lg:mt-0 h-full"
            variants={imageVariants}
          >
            <div className="relative">
              {/* Main image with styling */}
              <motion.div 
                className="relative rounded-2xl overflow-hidden shadow-md"
                whileHover={{ opacity: 0.9 }}
                transition={{ type: "spring" as const, stiffness: 300, damping: 20 }}
              >
                {/* Subtle color overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#2D3142]/30 to-transparent z-10"></div>
                
                <Image
                  src={newBoazAbout}
                  alt="בועז נחייסי"
                  className="w-full h-auto object-cover rounded-2xl"
                  width={600}
                  height={800}
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </motion.div>
              
              {/* Decorative elements */}
            </div>
          </motion.div>
          
          {/* Content section - left side on desktop (RTL), top on mobile */}
          <motion.div 
            className="lg:col-span-7 lg:order-1 order-1 h-full flex"
            variants={itemVariants}
          >
            <motion.div 
              className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-md text-right border border-[#D5C4B7]/30 h-full flex flex-col justify-between w-full"
              whileHover={{ boxShadow: "0 4px 8px -2px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.05)" }}
              transition={{ type: "spring" as const, stiffness: 300, damping: 20 }}
            >
              <h2 className="text-3xl md:text-4xl font-medium text-[#2D3142] mb-6">
                מנויים יקרים.
              </h2>
              
              <div className="space-y-6 text-[#3D3D3D]">
                <motion.p 
                  className="leading-relaxed"
                  variants={itemVariants}
                >
                  שמח שהגעתם לסטודיו המקוון שלי ואני מקווה שהוא גורם לכם לעונג
                  ובריאות גופניים. דרכי בעולם התנועה החלה בגיל 38 כשאני חסר
                  נסיון תרגולי וכמובן, חסר גמישות ומודעות סומאטית. התשוקה לחקור
                  ולדעת הובילו אותי לדרך שלא ידעתי בתחילתה לאן היא תוביל אותי
                  וכמה תובנות היא תעניק לי אותם אני מגיש לכם באהבה בכל שיעור כאן
                  בסטודיו. הידע והנסיון שלי התפתחו דרך תהליך אישי ומעמיק כך שכל
                  המידע בסטודיו הוא ממקור ראשון ואינו העתקה והדבקה.
                </motion.p>
                
                <motion.p 
                  className="leading-relaxed"
                  variants={itemVariants}
                >
                  אני המייסד של ׳בית הספר של בועז נחייסי׳ מאז 2012, מקום של
                  חדשנות, יזמות ועידוד לחיבור ושינוי. החוויה הגופנית הביאה אותי
                  להמציא את שיטת הפלייסטיק ב-2013 ומאז ועד היום אני מלמד
                  בפסטיבלים, כנסים, קהל אולימפי, קבוצות, קורסי מורים, הכשרות,
                  השתלמויות, חברות וועדי עובדים. מלמד גם בארץ וגם בעולם.
                </motion.p>
                
                <motion.p 
                  className="leading-relaxed"
                  variants={itemVariants}
                >
                  אני מאמין באהבת הגוף וטיפוח הנפש. לתנועה יש כח עצום בהבראה.
                  היא מקדמת איזון בין הגוף לנפש הפועלת בתוכו, היא מעודדת גילוי
                  עצמי כפי שמתגלים שרירים וסיבים חדשים כך גם תפיסות המציאות
                  נהיות עשירות, מגוונות ומרווחות ללא מתח וסטרס. דרך התנועה אנו
                  גוברים על אתגרי החיים ואם נלמד לטפח את הזרימה שלה בגוף, כמו
                  שמים זורמים, נשוט ביתר קלות בנהר חיינו.
                </motion.p>
                
                <motion.p 
                  className="leading-relaxed"
                  variants={itemVariants}
                >
                  כיישות מים אני פונה אליכם בחיבוק גדול יישויות מים יקרות ומבקש
                  שלא תעצרו לעולם את הכח המרפא והגדול שיש לנו-- נשימה ותנועה יחד
                  וכאן בסטודיו אני מרחיב את הלימוד וצולל לעומקים שיובילו בסופו
                  של דבר לסנכרון בין השתיים ואלו, יחזירו את הגוף שלכם להיות רענן
                  וטהור כבימי ילדותינו. הצטרפו אלי ויחד נשפר ונשדרג את מערכת
                  הגופנפש שלכם במסע החיים הפגיע והמשתנה הזה.
                </motion.p>
              </div>
              
              <motion.div 
                className="mt-10 text-left"
                variants={itemVariants}
              >
                <motion.div 
                  className="inline-block relative"
                  whileHover={{ opacity: 0.9 }}
                  transition={{ type: "spring" as const, stiffness: 400, damping: 10 }}
                >
                  <p className="text-xl text-[#D9713C] font-medium">בועז.</p>
                  <div className="absolute -bottom-2 right-0 w-full h-1 bg-[#D5C4B7] rounded-full"></div>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Decorative floating elements */}
          <motion.div
            className="absolute -z-10 top-1/4 right-1/4 w-64 h-64 opacity-5"
            animate={{
              y: [0, -15, 0],
              // Removed infinite reverse animation to prevent CPU/GPU overheating
            }}
          >
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <path d="M30,30 Q45,15 60,30 T75,45 T60,60 T45,75 T30,60 Z" fill="none" stroke="#D5C4B7" strokeWidth="1" />
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default WabiSabiAbout;
