"use client";

import React from 'react';
import Link from 'next/link';

interface PreviewOverlayProps {
  onClose: () => void;
  onReplay?: () => void;
}

const PreviewOverlay = ({ onClose, onReplay }: PreviewOverlayProps) => {
  return (
    <div 
      className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-90 z-[10000] flex items-center justify-center"
    >
      <div className="bg-[#F7F3EB] p-8 rounded-lg max-w-lg w-full mx-4 text-center relative overflow-hidden">
        {/* Decorative elements in Wabi-Sabi style */}
        <div className="absolute -top-10 -right-10 w-40 h-40 opacity-10">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path
              fill="#D5C4B7"
              d="M39.5,-65.3C50.2,-55.1,57.2,-42.1,63.4,-28.8C69.6,-15.5,74.9,-1.9,73.1,10.7C71.3,23.3,62.3,34.8,51.6,42.8C40.9,50.8,28.5,55.3,15.3,60.5C2.2,65.7,-11.7,71.7,-24.4,69.9C-37.1,68.1,-48.5,58.6,-57.4,47C-66.3,35.4,-72.6,21.7,-74.3,7.2C-76,-7.3,-73,-22.5,-65.3,-34.2C-57.6,-45.9,-45.2,-54,-32.5,-63.8C-19.8,-73.6,-6.6,-85.1,5.2,-83.3C17,-81.5,28.8,-75.5,39.5,-65.3Z"
            />
          </svg>
        </div>
        
        <div className="absolute -bottom-10 -left-10 w-40 h-40 opacity-10 rotate-45">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path
              fill="#B8A99C"
              d="M39.5,-65.3C50.2,-55.1,57.2,-42.1,63.4,-28.8C69.6,-15.5,74.9,-1.9,73.1,10.7C71.3,23.3,62.3,34.8,51.6,42.8C40.9,50.8,28.5,55.3,15.3,60.5C2.2,65.7,-11.7,71.7,-24.4,69.9C-37.1,68.1,-48.5,58.6,-57.4,47C-66.3,35.4,-72.6,21.7,-74.3,7.2C-76,-7.3,-73,-22.5,-65.3,-34.2C-57.6,-45.9,-45.2,-54,-32.5,-63.8C-19.8,-73.6,-6.6,-85.1,5.2,-83.3C17,-81.5,28.8,-75.5,39.5,-65.3Z"
            />
          </svg>
        </div>
        
        <h2 className="text-3xl font-bold text-[#2D3142] mb-4 relative">
          <span className="relative inline-block">
            <span className="absolute -bottom-2 left-0 w-full h-1 bg-[#EF8354] rounded-full opacity-70"></span>
            הגעת לסוף הצפייה החינמית של שתי דקות
          </span>
        </h2>
        <p className="text-[#3D3D3D] mb-6">
          כדי להמשיך לצפות בתוכן האיכותי שלנו, אנא הירשמו למנוי.
          המנוי מאפשר גישה בלתי מוגבלת לכל הסרטונים באתר.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/#Pricing" className="w-full sm:w-auto">
            <button 
              className="bg-[#B56B4A] text-white px-8 py-4 rounded-full text-xl font-bold hover:bg-[#A25539] transition-all duration-300 w-full shadow-lg relative overflow-hidden"
            >
              <span className="relative z-10">הירשם עכשיו</span>
              <span className="absolute inset-0 bg-white opacity-20 transform -skew-x-12"></span>
            </button>
          </Link>
          
          <div className="flex flex-row gap-2 mt-4 sm:mt-0">
            {onReplay && (
              <button 
                className="bg-[#D5C4B7] text-[#2D3142] px-3 py-2 rounded-full text-sm font-medium hover:bg-[#C5B4A7] transition-colors duration-300"
                onClick={onReplay}
              >
                צפה שוב בקטע הראשון
              </button>
            )}
            
            <button 
              className="bg-transparent border border-[#B8A99C] text-[#3D3D3D] px-4 py-2 rounded-full text-sm font-medium hover:bg-[#E5DFD0] transition-colors duration-300"
              onClick={onClose}
            >
              חזרה לעמוד הסרטים
            </button>
          </div>
        </div>
        
        <p className="mt-6 text-sm text-[#5D5D5D]">
          המנוי כולל גישה לכל התכנים, עדכונים שוטפים ותמיכה מלאה.
        </p>
      </div>
    </div>
  );
};

export default PreviewOverlay;
