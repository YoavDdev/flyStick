"use client";

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';

interface PreviewOverlayProps {
  onClose: () => void;
  onReplay?: () => void;
}

const PreviewOverlay = ({ onClose, onReplay }: PreviewOverlayProps) => {
  const messageBoxRef = useRef<HTMLDivElement>(null);
  
  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscKey);
    
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);
  
  // Handle click outside the message box
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  return (
    <div 
      className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-90 z-[10000] flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      <div className="bg-[#F7F3EB] p-8 rounded-lg max-w-lg w-full mx-4 text-center relative overflow-hidden">
        

        <p className="text-[#3D3D3D] mb-6">
          לצפייה בהמשך השיעור ושפע תכנים נוספים, אנו מזמינים אותך להירשם כמנוי הכולל גישה בלתי מוגבלת לכל הסרטונים באתר.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/#Pricing" className="w-full sm:w-auto" onClick={onClose}>
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
