"use client";

import React from "react";

const WabiSabiVideoCarousel = () => {
  return (
    <section className="py-20 md:py-28 relative">
      {/* Semi-transparent overlay for this section */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/10 to-black/5" />
      


      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-4xl text-center mb-16">
          <h1 
            className="text-4xl md:text-5xl lg:text-6xl font-light mb-8 leading-tight"
            style={{ 
              color: '#F5F1EB',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.5), 0 4px 16px rgba(0, 0, 0, 0.3)'
            }}
          >
            קחו מקל ובואו נצלול לרגע להעיר את הנמר
          </h1>
          
          <div 
            className="inline-block px-6 py-3 rounded-full text-base font-medium backdrop-blur-md border mb-8"
            style={{ 
              backgroundColor: 'rgba(212, 165, 116, 0.2)',
              color: '#F5F1EB',
              border: '1px solid rgba(212, 165, 116, 0.4)',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
            }}
          >
            ✨ תרגול חינם לטעימה ✨
          </div>
        </div>
        
        <div className="max-w-5xl mx-auto">
          {/* Modern video container */}
          <div className="relative group">
            {/* Glow effect */}
            <div 
              className="absolute -inset-4 rounded-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-500 blur-xl"
              style={{ background: 'linear-gradient(135deg, #8FA68E 0%, #A8B5A1 100%)' }}
            />
            
            <div
              className="relative rounded-3xl overflow-hidden transition-all duration-500 group-hover:opacity-90 bg-white/10"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                boxShadow: '0 4px 12px -4px rgba(143, 166, 142, 0.25)',
                border: '1px solid rgba(143, 166, 142, 0.2)'
              }}
            >
              {/* Video frame with modern styling */}
              <div className="p-2 md:p-4">
                <div className="relative overflow-hidden rounded-2xl">
                  {/* Responsive video container */}
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' /* 16:9 aspect ratio */ }}>
                    <iframe
                      id="ytplayer"
                      className="absolute top-0 left-0 w-full h-full rounded-2xl"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      src="https://www.youtube.com/embed/G2QMpNsnUxk?start=4&autoplay=0&mute=0"
                      loading="lazy"
                    ></iframe>
                  </div>
                </div>
              </div>
              
              {/* Bottom accent */}
              <div 
                className="h-1 w-full"
                style={{ background: 'linear-gradient(90deg, #D4A574 0%, #C4956A 50%, #B8860B 100%)' }}
              />
            </div>
          </div>
          

        </div>
      </div>
    </section>
  );
};

export default WabiSabiVideoCarousel;
