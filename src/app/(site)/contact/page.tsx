"use client";

import React from "react";
import Image from "next/image";
import contactMe4 from "../../../../public/contactMe4.jpeg";
import contactMePhone4 from "../../../../public/contactMePhone4.jpeg";
import Link from "next/link";
import * as FramerMotion from "framer-motion";


const { motion } = FramerMotion;

const WabiSabiContact = () => {
  return (
    <div className="relative h-screen overflow-hidden">
      {/* Background Texture Layer */}
      <div className="absolute inset-0 z-0">
        {/* Background texture removed */}
      </div>

      {/* Background Image for Desktop */}
      <div className="absolute inset-0 z-1 hidden md:block">
        <div className="relative w-full h-full">
          <div className="absolute inset-0 bg-[#B56B4A] mix-blend-color opacity-10 z-10"></div>
          <Image
            src={contactMe4}
            alt="Contact Background"
            fill
            style={{ objectFit: 'cover' }}
            className="w-full h-full object-cover"
            priority
            quality={90}
          />
        </div>
      </div>

      {/* Background Image for Mobile */}
      <div className="absolute inset-0 z-1 block md:hidden">
        <div className="relative w-full h-full">
          <div className="absolute inset-0 bg-[#B56B4A] mix-blend-color opacity-10 z-10"></div>
          <Image
            src={contactMePhone4}
            alt="Contact Background Mobile"
            fill
            style={{ objectFit: 'cover' }}
            className="w-full h-full object-cover"
            priority
            quality={90}
          />
        </div>
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

      {/* Text Overlay */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
        className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6"
      >
        <div className="bg-[#F5F2EB]/80 backdrop-blur-sm p-8 rounded-lg shadow-sm border border-[#D9C5B3]/30 max-w-xl">
          <h2 className="mb-6 text-3xl md:text-4xl font-medium text-[#B56B4A] text-right">
            צור קשר
          </h2>
          <div className="space-y-4 text-[#5D5D5D] text-right">
            <p className="leading-relaxed">
              אל תהססו לפנות בשאלות, בקשות מיוחדות או סתם להגיד שלום.  
            </p>
            <p className="leading-relaxed">
              אני כאן
              כדי לדייק ולעזור עם כל מידע שאתם צריכים.
            </p>
            <p className="leading-relaxed">
              בין אם זה שאלות שעלו מהשיעורים, או שיתוף פעולה והגעה אליכם. שלחו אלי הודעת וואטצאפ ואעשה את כל המאמצים לשוב אליכם בהקדם.
            </p>
            <p className="leading-relaxed">
              המשוב והתקשורת ביננו חשובים לי מאד. בואו נהיה בקשר!
            </p>
          </div>
          
          <div className="mt-8 flex justify-center">
            <motion.div
              whileHover={{ opacity: 0.9 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <Link
                href="https://wa.me/972527061212"
                className="flex items-center bg-green-500 text-white py-4 px-8 rounded-lg transition duration-300 hover:bg-green-600 shadow-md"
              >
                <span className="mr-2 text-lg">וואטסאפ</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
              </Link>
              <div className="absolute -bottom-2 -right-2 w-full h-full border-2 border-[#D9C5B3] rounded-lg z-0"></div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default WabiSabiContact;
