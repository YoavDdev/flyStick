"use client";

import React, { useEffect, useState, ReactNode, RefObject, useRef } from 'react';
import { motion, useAnimation, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { standardEasing } from './standardAnimations';

// Parallax component that creates depth effect on scroll
export const ParallaxLayer = ({ 
  children, 
  speed = 0.5, 
  className = "",
  direction = "vertical" // "vertical" or "horizontal"
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
  direction?: "vertical" | "horizontal";
}) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 500 * speed]);
  const x = useTransform(scrollY, [0, 1000], [0, 300 * speed]);
  
  return (
    <motion.div 
      className={`${className}`}
      style={{ 
        y: direction === "vertical" ? y : 0,
        x: direction === "horizontal" ? x : 0,
      }}
    >
      {children}
    </motion.div>
  );
};

// Animated brush stroke reveal effect
export const BrushStrokeReveal = ({ 
  children, 
  delay = 0, 
  duration = 0.8, 
  direction = "rtl", // rtl or ltr
  className = ""
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  direction?: "rtl" | "ltr";
  className?: string;
}) => {
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (ref.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            controls.start("visible");
          }
        },
        { threshold: 0.1 }
      );
      
      observer.observe(ref.current);
      return () => observer.disconnect();
    }
  }, [controls]);
  
  const variants = {
    hidden: { 
      clipPath: direction === "rtl" 
        ? "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)" 
        : "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)" 
    },
    visible: { 
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      transition: {
        duration: duration,
        ease: standardEasing.standard,
        delay: delay
      }
    }
  };
  
  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div
        initial="hidden"
        animate={controls}
        variants={variants}
      >
        {children}
      </motion.div>
    </div>
  );
};

// Floating animation for decorative elements
export const FloatingElement = ({ 
  children, 
  amplitude = 10, // pixels to move
  duration = 4, // seconds for one complete cycle
  delay = 0,
  className = ""
}: {
  children: ReactNode;
  amplitude?: number;
  duration?: number;
  delay?: number;
  className?: string;
}) => {
  return (
    <motion.div
      className={className}
      animate={{
        y: [0, -amplitude, 0, amplitude, 0],
      }}
      transition={{
        duration: duration,
        ease: "easeInOut",
        times: [0, 0.25, 0.5, 0.75, 1],
        repeat: Infinity,
        repeatDelay: 0,
        delay: delay
      }}
    >
      {children}
    </motion.div>
  );
};

// Interactive element that responds to cursor proximity
export const CursorResponsiveElement = ({ 
  children, 
  sensitivity = 20, // how much the element moves
  className = "",
  perspective = 1000, // perspective value for 3D effect
  resetOnLeave = true // whether to reset position when cursor leaves
}: {
  children: ReactNode;
  sensitivity?: number;
  className?: string;
  perspective?: number;
  resetOnLeave?: boolean;
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [elementPosition, setElementPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const ref = useRef<HTMLDivElement>(null);
  
  const springConfig = { damping: 15, stiffness: 150 };
  const xMotion = useSpring(0, springConfig);
  const yMotion = useSpring(0, springConfig);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  useEffect(() => {
    if (ref.current) {
      const updateElementPosition = () => {
        const rect = ref.current?.getBoundingClientRect();
        if (rect) {
          setElementPosition({
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
            width: rect.width,
            height: rect.height
          });
        }
      };
      
      updateElementPosition();
      window.addEventListener('resize', updateElementPosition);
      window.addEventListener('scroll', updateElementPosition);
      
      return () => {
        window.removeEventListener('resize', updateElementPosition);
        window.removeEventListener('scroll', updateElementPosition);
      };
    }
  }, []);
  
  useEffect(() => {
    if (elementPosition.width) {
      const dx = mousePosition.x - elementPosition.x;
      const dy = mousePosition.y - elementPosition.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 200) {
        const factor = 1 - distance / 200;
        xMotion.set(dx * factor * sensitivity / 200);
        yMotion.set(dy * factor * sensitivity / 200);
      } else {
        xMotion.set(0);
        yMotion.set(0);
      }
    }
  }, [mousePosition, elementPosition, sensitivity, xMotion, yMotion]);
  
  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        x: xMotion,
        y: yMotion,
      }}
    >
      {children}
    </motion.div>
  );
};

// Animated ink flow effect
export const InkFlowBorder = ({ 
  children, 
  color = "#D5C4B7", 
  thickness = 2, 
  duration = 4,
  delay = 0,
  className = ""
}: {
  children: ReactNode;
  color?: string;
  thickness?: number;
  duration?: number;
  delay?: number;
  className?: string;
}) => {
  const pathLength = useMotionValue(0);
  const springPathLength = useSpring(pathLength, { stiffness: 100, damping: 30 });
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      pathLength.set(1);
    }, delay * 1000);
    
    return () => clearTimeout(timeout);
  }, [delay, pathLength]);
  
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 pointer-events-none">
        <svg
          className="w-full h-full"
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            overflow: 'visible'
          }}
        >
          <motion.rect
            x={thickness/2}
            y={thickness/2}
            width={`calc(100% - ${thickness}px)`}
            height={`calc(100% - ${thickness}px)`}
            rx="8"
            ry="8"
            fill="transparent"
            stroke={color}
            strokeWidth={thickness}
            strokeLinecap="round"
            style={{ pathLength: springPathLength }}
            initial={{ pathLength: 0 }}
          />
        </svg>
      </div>
      {children}
    </div>
  );
};

// Breathing animation effect (subtle scale)
export const BreathingElement = ({ 
  children, 
  scale = 1.03, // maximum scale
  duration = 4, // seconds for one complete cycle
  delay = 0,
  className = ""
}: {
  children: ReactNode;
  scale?: number;
  duration?: number;
  delay?: number;
  className?: string;
}) => {
  return (
    <motion.div
      className={className}
      animate={{
        scale: [1, scale, 1],
      }}
      transition={{
        duration: duration,
        ease: "easeInOut",
        times: [0, 0.5, 1],
        repeat: Infinity,
        repeatDelay: 0,
        delay: delay
      }}
    >
      {children}
    </motion.div>
  );
};

// Section transition with staggered children reveals
export const SectionTransition = ({ 
  children, 
  staggerChildren = 0.1, // delay between each child animation
  duration = 0.5, // duration of each child animation
  distance = 50, // distance to travel
  direction = "up", // up, down, left, right
  className = ""
}: {
  children: ReactNode;
  staggerChildren?: number;
  duration?: number;
  distance?: number;
  direction?: "up" | "down" | "left" | "right";
  className?: string;
}) => {
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (ref.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            controls.start('visible');
          }
        },
        { threshold: 0.1 }
      );
      
      observer.observe(ref.current);
      return () => observer.disconnect();
    }
  }, [controls]);
  
  const variants = {
    hidden: { 
      opacity: 0,
      y: direction === 'up' ? distance : direction === 'down' ? -distance : 0,
      x: direction === 'left' ? distance : direction === 'right' ? -distance : 0
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        duration: duration,
        ease: standardEasing.gentle,
        staggerChildren: staggerChildren
      }
    }
  };
  
  const childVariants = {
    hidden: { 
      opacity: 0,
      y: direction === 'up' ? distance : direction === 'down' ? -distance : 0,
      x: direction === 'left' ? distance : direction === 'right' ? -distance : 0
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        duration: duration,
        ease: standardEasing.gentle
      }
    }
  };
  
  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={controls}
      variants={variants}
    >
      {React.Children.map(children, child => (
        <motion.div variants={childVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

// Update the wabiSabiEasing object with new easing functions
export const extendedWabiSabiEasing = {
  ...standardEasing,
  brush: [0.25, 0.1, 0.25, 1], // Custom easing for brush stroke effects
  water: [0, 0.65, 0.35, 1], // Water-like motion
  bamboo: [0.37, 0, 0.63, 1], // Bamboo swaying motion
  clay: [0.68, -0.6, 0.32, 1.6] // Clay-like organic movement
};
