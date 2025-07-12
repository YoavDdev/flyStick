"use client";

import React from "react";
import Image from "next/image";
import boazAbout from "../../../../public/BoazAbout.jpeg";
import * as FramerMotion from "framer-motion";


const { motion } = FramerMotion;

const WabiSabiAbout = () => {
  return (
    <div className="relative overflow-hidden pt-20 pb-16">
      {/* Background texture */}
      <div className="absolute inset-0 z-0">
        {/* Background texture removed */}
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-40 right-10 w-32 h-32 opacity-10 hidden lg:block">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#B56B4A" strokeWidth="1" strokeDasharray="5,3" />
        </svg>
      </div>
      
      <div className="absolute bottom-20 left-10 w-24 h-24 opacity-10 hidden lg:block">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <path d="M20,20 Q40,5 60,20 T80,40 T60,60 T40,80 T20,60 Z" fill="none" stroke="#B56B4A" strokeWidth="1" />
        </svg>
      </div>
      
      <div className="container relative z-10 mx-auto px-6 md:px-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-medium text-[#B56B4A] mb-4">אודות</h1>
          <div className="w-24 h-1 bg-[#D9C5B3] mx-auto rounded-full"></div>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Image section - right side on desktop (RTL) */}
          <motion.div 
            className="lg:col-span-5 lg:order-3 relative"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative">
              {/* Image with color overlay */}
              <div className="relative rounded-lg overflow-hidden shadow-xl">
                <div className="absolute inset-0 bg-[#B56B4A] mix-blend-color opacity-20 z-10"></div>
                <Image
                  src={boazAbout}
                  alt="בועז נחייסי"
                  className="w-full h-auto object-cover rounded-lg"
                  placeholder="blur"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              
              {/* Decorative border */}
              <div className="absolute -bottom-4 -right-4 w-full h-full border-2 border-[#D9C5B3] rounded-lg z-0"></div>
              
              {/* Subtle texture overlay */}
              <div className="absolute inset-0 z-20 opacity-30 overflow-hidden rounded-lg">
                {/* Texture overlay removed */}
              </div>
            </div>
          </motion.div>
          
          {/* Content section - left side on desktop (RTL) */}
          <motion.div 
            className="lg:col-span-7 lg:order-1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="bg-[#F5F2EB]/80 backdrop-blur-sm p-8 rounded-lg shadow-sm text-right border border-[#D9C5B3]/30">
              <h2 className="text-3xl md:text-4xl font-medium text-[#B56B4A] mb-6">
                מנויים יקרים.
              </h2>
              
              <div className="space-y-4 text-[#5D5D5D]">
                <p className="leading-relaxed">
                  שמח שהגעתם לסטודיו המקוון שלי ואני מקווה שהוא גורם לכם לעונג
                  ובריאות גופניים. דרכי בעולם התנועה החלה בגיל 38 כשאני חסר
                  נסיון תרגולי וכמובן, חסר גמישות ומודעות סומאטית. התשוקה לחקור
                  ולדעת הובילו אותי לדרך שלא ידעתי בתחילתה לאן היא תוביל אותי
                  וכמה תובנות היא תעניק לי אותם אני מגיש לכם באהבה בכל שיעור כאן
                  בסטודיו. הידע והנסיון שלי התפתחו דרך תהליך אישי ומעמיק כך שכל
                  המידע בסטודיו הוא ממקור ראשון ואינו העתקה והדבקה.
                </p>
                
                <p className="leading-relaxed">
                  אני המייסד של ׳בית הספר של בועז נחייסי׳ מאז 2012, מקום של
                  חדשנות, יזמות ועידוד לחיבור ושינוי. החוויה הגופנית הביאה אותי
                  להמציא את שיטת הפלייסטיק ב-2013 ומאז ועד היום אני מלמד
                  בפסטיבלים, כנסים, קהל אולימפי, קבוצות, קורסי מורים, הכשרות,
                  השתלמויות, חברות וועדי עובדים. מלמד גם בארץ וגם בעולם.
                </p>
                
                <p className="leading-relaxed">
                  אני מאמין באהבת הגוף וטיפוח הנפש. לתנועה יש כח עצום בהבראה.
                  היא מקדמת איזון בין הגוף לנפש הפועלת בתוכו, היא מעודדת גילוי
                  עצמי כפי שמתגלים שרירים וסיבים חדשים כך גם תפיסות המציאות
                  נהיות עשירות, מגוונות ומרווחות ללא מתח וסטרס. דרך התנועה אנו
                  גוברים על אתגרי החיים ואם נלמד לטפח את הזרימה שלה בגוף, כמו
                  שמים זורמים, נשוט ביתר קלות בנהר חיינו.
                </p>
                
                <p className="leading-relaxed">
                  כיישות מים אני פונה אליכם בחיבוק גדול יישויות מים יקרות ומבקש
                  שלא תעצרו לעולם את הכח המרפא והגדול שיש לנו-- נשימה ותנועה יחד
                  וכאן בסטודיו אני מרחיב את הלימוד וצולל לעומקים שיובילו בסופו
                  של דבר לסנכרון בין השתיים ואלו, יחזירו את הגוף שלכם להיות רענן
                  וטהור כבימי ילדותינו. הצטרפו אלי ויחד נשפר ונשדרג את מערכת
                  הגופנפש שלכם במסע החיים הפגיע והמשתנה הזה.
                </p>
              </div>
              
              <div className="mt-8 text-left">
                <div className="inline-block relative">
                  <p className="text-xl text-[#B56B4A] font-medium">בועז.</p>
                  <div className="absolute -bottom-2 right-0 w-full h-1 bg-[#D9C5B3]/50 rounded-full"></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default WabiSabiAbout;
