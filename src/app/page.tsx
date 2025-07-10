"use client";

import {
  WabiSabiHero,
  WabiSabiFeature,
  WabiSabiVideoCarousel,
  WabiSabiPricing,
} from "./components";
import ExploreVideos from "./components/ExploreVideos";
import { motion } from "framer-motion";
import { ParallaxLayer } from "./styles/wabiSabiMotion";

import WabiSabiHeading from "./components/WabiSabiHeading";
import WabiSabiPaperTexture from "./components/WabiSabiPaperTexture";
import { wabiSabiColors } from "./styles/wabiSabiTheme";
import { standardEasing } from "./styles/standardAnimations";

export default function HomePage() {
  return (
    <motion.main 
      className="bg-[#F7F3EB] relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: standardEasing.slow }}
    >
      {/* Enhanced paper texture for the entire page */}
      <WabiSabiPaperTexture type="washi" opacity={0.06} animate={true} />
      
      {/* Enhanced floating elements with more organic shapes */}
      {/* Removed floating elements */}

      
      {/* Additional decorative accent in top-right */}
      <motion.div 
        className="absolute top-[5%] right-[3%] w-32 h-32 opacity-[0.15] md:opacity-[0.08] hidden md:block"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.08, scale: 1 }}
        transition={{ 
          duration: 1.5, 
          ease: standardEasing.slow,
          delay: 0.5
        }}
      >
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <motion.circle 
            cx="50" 
            cy="50" 
            r="40" 
            fill="none" 
            stroke={wabiSabiColors.rust.DEFAULT}
            strokeWidth="0.5"
            strokeDasharray="1,3"
            animate={{ 
              rotate: [0, 360],
            }}
            transition={{ 
              duration: 120, 
              ease: "linear", 
              repeat: Infinity 
            }}
          />
        </svg>
      </motion.div>
      
      {/* Main content sections */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: standardEasing.slow }}
      >
        <WabiSabiHero />
      </motion.div>
      
      {/* Section transition with enhanced organic divider */}
      <div className="relative">
        <motion.div 
          className="absolute top-0 left-0 w-full h-16 overflow-hidden z-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <svg className="w-full h-full" viewBox="0 0 1200 64" preserveAspectRatio="none">
            <motion.path 
              d="M0,0 C150,35 300,15 450,25 C600,35 750,10 900,30 C1050,50 1150,20 1200,35 L1200,64 L0,64 Z" 
              fill="#F7F3EB" 
              fillOpacity="0.9"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.8, ease: standardEasing.slow }}
              viewport={{ once: true, margin: "-100px" }}
            />
            <motion.path 
              d="M0,15 C200,45 400,25 600,40 C800,55 1000,30 1200,45 L1200,64 L0,64 Z" 
              fill={wabiSabiColors.clay.light} 
              fillOpacity="0.3"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 0.3 }}
              transition={{ duration: 2, delay: 0.3, ease: standardEasing.slow }}
              viewport={{ once: true, margin: "-100px" }}
            />
          </svg>
        </motion.div>
        
        {/* Feature section with paper texture */}
        <div className="relative">
          <WabiSabiPaperTexture type="rice" opacity={0.04} animate={true} />
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, ease: standardEasing.slow }}
            viewport={{ once: true, margin: "-50px" }}
          >
            <WabiSabiFeature />
          </motion.div>
          
          {/* Decorative accent element */}
          <motion.div 
            className="absolute bottom-[5%] left-[3%] w-24 h-24 opacity-[0.12] hidden md:block"
            initial={{ opacity: 0, rotate: -15 }}
            whileInView={{ opacity: 0.12, rotate: 0 }}
            transition={{ duration: 1.8, ease: standardEasing.slow }}
            viewport={{ once: true }}
          >
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M30,20 Q50,10 70,20 Q90,30 80,50 Q70,70 50,80 Q30,90 20,70 Q10,50 30,20 Z"
                fill="none"
                stroke={wabiSabiColors.clay.DEFAULT}
                strokeWidth="0.8"
                strokeDasharray="2,4"
              />
            </svg>
          </motion.div>
        </div>
      </div>
      
      {/* Section transition with enhanced organic divider */}
      <div className="relative">
        <motion.div 
          className="absolute top-0 left-0 w-full h-16 overflow-hidden z-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <svg className="w-full h-full" viewBox="0 0 1200 64" preserveAspectRatio="none">
            <motion.path 
              d="M0,10 C200,0 400,30 600,15 C800,0 1000,20 1200,5 L1200,64 L0,64 Z" 
              fill={wabiSabiColors.sand.DEFAULT}
              fillOpacity="0.7"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 0.7 }}
              transition={{ duration: 1.8, ease: standardEasing.slow }}
              viewport={{ once: true, margin: "-100px" }}
            />
            <motion.path 
              d="M0,25 C300,10 600,35 900,20 C1000,15 1100,25 1200,15 L1200,64 L0,64 Z" 
              fill={wabiSabiColors.sand.light}
              fillOpacity="0.5"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 0.5 }}
              transition={{ duration: 2, delay: 0.4, ease: standardEasing.slow }}
              viewport={{ once: true, margin: "-100px" }}
            />
          </svg>
        </motion.div>
        
        {/* Video carousel section */}
        <div className="relative py-16 bg-[#F7F3EB] overflow-hidden">
          <WabiSabiPaperTexture type="natural" opacity={0.05} animate={true} />
          
          {/* Subtle floating elements specific to this section */}
          <div className="absolute inset-0 pointer-events-none opacity-30">
          </div>
          
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: standardEasing.slow }}
              viewport={{ once: true, margin: "-50px" }}
            >
              <WabiSabiVideoCarousel />
            </motion.div>
          </div>
        </div>
        
        {/* Section transition with enhanced organic divider */}
        <motion.div 
          className="absolute top-0 left-0 w-full h-16 overflow-hidden z-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <svg className="w-full h-full" viewBox="0 0 1200 64" preserveAspectRatio="none">
            <motion.path 
              d="M0,5 C150,25 300,10 450,20 C600,30 750,15 900,25 C1050,35 1150,15 1200,25 L1200,64 L0,64 Z" 
              fill={wabiSabiColors.paper.DEFAULT}
              fillOpacity="0.9"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 0.9 }}
              transition={{ duration: 1.8, ease: standardEasing.slow }}
              viewport={{ once: true, margin: "-100px" }}
            />
            <motion.path 
              d="M0,20 C250,40 500,25 750,35 C900,40 1050,30 1200,40 L1200,64 L0,64 Z" 
              fill={wabiSabiColors.moss.light}
              fillOpacity="0.2"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 0.2 }}
              transition={{ duration: 2, delay: 0.3, ease: standardEasing.slow }}
              viewport={{ once: true, margin: "-100px" }}
            />
          </svg>
        </motion.div>
        
        {/* Explore Videos Section with enhanced paper texture */}
        <div className="relative">
          <WabiSabiPaperTexture type="natural" opacity={0.04} />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: standardEasing.slow }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <ExploreVideos 
              title=""
              subtitle=""
              className="py-8"
            />
          </motion.div>
        </div>
      </div>
      
      {/* Section transition with enhanced organic divider */}
      <div className="relative">
        <motion.div 
          className="absolute top-0 left-0 w-full h-16 overflow-hidden z-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <svg className="w-full h-full" viewBox="0 0 1200 64" preserveAspectRatio="none">
            <motion.path 
              d="M0,15 C200,0 400,25 600,10 C800,0 1000,15 1200,5 L1200,64 L0,64 Z" 
              fill={wabiSabiColors.paper.DEFAULT}
              fillOpacity="0.9"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 0.9 }}
              transition={{ duration: 1.8, ease: standardEasing.slow }}
              viewport={{ once: true, margin: "-100px" }}
            />
            <motion.path 
              d="M0,30 C250,15 500,35 750,20 C900,15 1050,25 1200,15 L1200,64 L0,64 Z" 
              fill={wabiSabiColors.clay.light}
              fillOpacity="0.3"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 0.3 }}
              transition={{ duration: 2, delay: 0.4, ease: standardEasing.slow }}
              viewport={{ once: true, margin: "-100px" }}
            />
          </svg>
        </motion.div>
        
        {/* Pricing section with enhanced paper texture */}
        <div className="relative">
          <WabiSabiPaperTexture type="washi" opacity={0.05} animate={true} />
          
          {/* Subtle floating elements specific to pricing section */}
          <div className="absolute inset-0 pointer-events-none opacity-30">
          </div>
          
          {/* Decorative accent element */}
          <motion.div 
            className="absolute top-[15%] left-[5%] w-20 h-20 opacity-[0.1] hidden md:block"
            initial={{ opacity: 0, scale: 0.9, rotate: 15 }}
            whileInView={{ opacity: 0.1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.5, ease: standardEasing.slow }}
            viewport={{ once: true }}
          >
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M30,20 Q55,5 70,20 Q95,35 80,60 Q65,85 40,80 Q15,75 20,50 Q25,25 30,20 Z"
                fill="none"
                stroke={wabiSabiColors.moss.DEFAULT}
                strokeWidth="0.6"
                strokeDasharray="1,2"
              />
            </svg>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: standardEasing.slow }}
            viewport={{ once: true, margin: "-50px" }}
          >
            <WabiSabiPricing />
          </motion.div>
        </div>
      </div>
      
      {/* Footer decorative element with enhanced Wabi-Sabi styling */}
      <motion.div
        className="w-full h-32 relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        {/* Subtle paper texture overlay */}
        <WabiSabiPaperTexture type="rice" opacity={0.04} animate={true} />
        
        {/* Decorative floating elements */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
        </div>
        
        {/* Decorative accent element */}
        <motion.div 
          className="absolute bottom-[30%] right-[8%] w-16 h-16 opacity-[0.08] hidden md:block"
          initial={{ opacity: 0, scale: 0.9, rotate: -10 }}
          whileInView={{ opacity: 0.08, scale: 1, rotate: 0 }}
          transition={{ duration: 1.5, ease: standardEasing.slow }}
          viewport={{ once: true }}
        >
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle
              cx="50"
              cy="50"
              r="30"
              fill="none"
              stroke={wabiSabiColors.rust.DEFAULT}
              strokeWidth="0.5"
              strokeDasharray="2,4"
            />
          </svg>
        </motion.div>
        
        <motion.div
          className="absolute bottom-0 left-0 w-full h-32"
          initial={{ y: 32 }}
          whileInView={{ y: 0 }}
          transition={{ duration: 1.2, ease: standardEasing.slow }}
          viewport={{ once: true }}
        >
          <svg className="w-full h-full" viewBox="0 0 1200 128" preserveAspectRatio="none">
            <motion.path
              d="M0,128 L1200,128 L1200,40 C1000,60 800,30 600,45 C400,60 200,35 0,50 L0,128 Z"
              fill={wabiSabiColors.clay.DEFAULT}
              fillOpacity="0.15"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 0.15 }}
              transition={{ duration: 1.8, ease: standardEasing.slow }}
              viewport={{ once: true }}
            />
            <motion.path
              d="M0,128 L1200,128 L1200,60 C1050,75 900,55 750,65 C600,75 450,60 300,70 C150,80 50,65 0,75 L0,128 Z"
              fill={wabiSabiColors.moss.light}
              fillOpacity="0.1"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 0.1 }}
              transition={{ duration: 2, delay: 0.3, ease: standardEasing.slow }}
              viewport={{ once: true }}
            />
          </svg>
        </motion.div>
      </motion.div>
    </motion.main>
  );
}
