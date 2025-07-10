"use client";

import React from "react";
import { motion } from "framer-motion";

interface WabiSabiPaperTextureProps {
  type?: "rice" | "washi" | "handmade" | "natural";
  opacity?: number;
  color?: string;
  animate?: boolean;
  className?: string;
}

const WabiSabiPaperTexture: React.FC<WabiSabiPaperTextureProps> = ({
  type = "washi",
  opacity = 0.08,
  color = "#000000",
  animate = true,
  className = "",
}) => {
  // Define texture patterns for different paper types
  const texturePatterns = {
    rice: {
      pattern: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.3'/%3E%3C/svg%3E")`,
      backgroundSize: "200px 200px",
    },
    washi: {
      pattern: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.04' numOctaves='5' seed='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noise)' opacity='0.25'/%3E%3C/svg%3E")`,
      backgroundSize: "400px 400px",
    },
    handmade: {
      pattern: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.05' numOctaves='2' seed='3'/%3E%3C/filter%3E%3Crect width='150' height='150' filter='url(%23noise)' opacity='0.2'/%3E%3C/svg%3E")`,
      backgroundSize: "300px 300px",
    },
    natural: {
      pattern: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.15' numOctaves='4' seed='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.15'/%3E%3C/svg%3E")`,
      backgroundSize: "250px 250px",
    },
  };

  const selectedTexture = texturePatterns[type];

  // Animation variants for subtle movement
  const textureVariants = {
    initial: {
      backgroundPosition: "0% 0%",
    },
    animate: animate
      ? {
          backgroundPosition: ["0% 0%", "2% 1%", "0% 2%", "-1% 1%", "0% 0%"],
          transition: {
            duration: 20,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse",
          },
        }
      : {},
  };

  return (
    <motion.div
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{
        backgroundImage: selectedTexture.pattern,
        backgroundSize: selectedTexture.backgroundSize,
        opacity: opacity,
        mixBlendMode: "multiply",
      }}
      initial="initial"
      animate="animate"
      variants={textureVariants}
    />
  );
};

export default WabiSabiPaperTexture;
