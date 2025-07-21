"use client";

import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "framer-motion";

const WabiSabiFeature = () => {
  const [expandedFeature, setExpandedFeature] = React.useState<number | null>(null);
  
  const features = [
    {
      name: "מתחילים ומתרגלים מנוסים",
      description: "למידה מותאמת אישית. עיקבו אחר מסלול מובנה בתוכניות אימון מגוונות המעוררים אתגרי חקירה וגילוי ואף משלבים טכניקות נשימה תרגוליות וייחודיות לשיטת בועז נחייסי.",
      icon: "✦",
      color: "rgba(212, 165, 116, 0.9)",
    },
    {
      name: "אם יש לכם סקרנות פנימית ורצון לגלות ולהתפתח",
      description: "מחכות לכן חקירות מעמיקות, סדר תרגולי ותנועתי מלווה בתובנות נדירות, זו הזמנה לחוות את ההרמוניה הטבעית בין התנועה החיצונית והתנועה הפנימית המתרחשות בסנכרון מופלא.",
      icon: "✿",
      color: "rgba(184, 160, 130, 0.9)",
    },
    {
      name: "מורים|ת, מדריכים|ת ומטפלים|ת",
      description: "שדרגו את הידע ולימדו כיצד לתווך אותו למתאמנים בקלות ויצירתיות. עיקבו אחר סילבוס חכם בתוכנית האימון הייחודית שלנו המבוססת על חקירה אישית ויצירת פתרונות מדויקים יותר עבור הלקוח. שדרגו את גופכם ואת המקצועיות שלכם באותו זמן.",
      icon: "✧",
      color: "rgba(181, 107, 74, 0.9)",
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
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
        stiffness: 50,
        damping: 10,
      },
    },
  };

  // Custom hook for section animation
  const controls = useAnimation();
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);

  return (
    <div className="relative overflow-hidden py-20 md:py-32" dir="rtl" ref={ref}>
      {/* Subtle overlay for readability over desert background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/10 to-black/5" />
      
      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="mx-auto max-w-2xl lg:text-center"
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          {/* Decorative element above heading */}
          <motion.div 
            className="w-16 h-1 rounded-full mx-auto mb-6"
            style={{ backgroundColor: 'rgba(212, 165, 116, 0.6)' }}
            initial={{ width: 0 }}
            animate={{ width: 64, transition: { delay: 0.5, duration: 0.8 } }}
          />
          
          <motion.h2
            className="text-base font-semibold leading-6 sm:leading-7"
            style={{ 
              color: '#F5F1EB',
              textShadow: '0 1px 4px rgba(0, 0, 0, 0.6)'
            }}
            variants={itemVariants}
          >
            ברוכים הבאים
          </motion.h2>
          <motion.p
            className="mt-2 text-xl sm:text-3xl md:text-4xl font-bold tracking-tight"
            style={{ 
              color: '#F5F1EB',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.5), 0 4px 16px rgba(0, 0, 0, 0.3)'
            }}
            variants={itemVariants}
          >
            מסע התנועה והריפוי מתחיל עכשיו
          </motion.p>
          <motion.p
            className="mt-4 sm:mt-6 text-base sm:text-lg leading-6 sm:leading-8 max-w-3xl mx-auto px-1 sm:px-0"
            style={{ 
              color: '#F5F1EB',
              textShadow: '0 1px 4px rgba(0, 0, 0, 0.6)'
            }}
            variants={itemVariants}
          >
            לימוד והעמקה בהתאם לצורך והיכולת האישית. לכל אדם בכל שלב.
            העצמת כישורי ההוראה ושדרוג המקצוענות בתחום התנועה.
          </motion.p>
        </motion.div>

        {/* Feature circles with enhanced styling */}
        <motion.div
          className="mx-auto mt-10 sm:mt-16 lg:mt-20 max-w-5xl"
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          <div className="flex flex-col sm:flex-row justify-center items-start gap-8 md:gap-12 lg:gap-16">
            {features.map((feature, index) => {
              const isExpanded = expandedFeature === index;
              
              return (
                <motion.div
                  key={feature.name}
                  className="flex flex-col items-center text-center w-full sm:max-w-xs cursor-pointer"
                  variants={itemVariants}
                  whileHover={{ y: -5, transition: { duration: 0.3 } }}
                  onClick={() => setExpandedFeature(isExpanded ? null : index)}
                  onMouseEnter={() => setExpandedFeature(index)}
                  onMouseLeave={() => setExpandedFeature(null)}
                >
                  {/* Enhanced circular icon with subtle shadow and border */}
                  <motion.div 
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center shadow-lg mb-3 sm:mb-6 border border-white/20"
                    style={{ 
                      backgroundColor: feature.color,
                      boxShadow: `0 2px 8px -2px ${feature.color}40`,
                      borderRadius: '50%' // Ensure perfect circle on all devices
                    }}
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: `0 4px 12px -4px ${feature.color}60`,
                      transition: { duration: 0.3 }
                    }}
                  >
                    <span className="text-3xl sm:text-3xl text-white">{feature.icon}</span>
                  </motion.div>
                  
                  {/* Feature name with enhanced typography */}
                  <h3 
                    className="text-base sm:text-xl font-semibold mt-2"
                    style={{ 
                      color: '#F5F1EB',
                      textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)'
                    }}
                  >
                    {feature.name}
                  </h3>
                  
                  {/* Decorative divider */}
                  <motion.div 
                    className="h-0.5 my-2 sm:my-3 rounded-full"
                    style={{ backgroundColor: 'rgba(212, 165, 116, 0.6)' }}
                    animate={{ 
                      width: isExpanded ? '3rem' : '2.5rem'
                    }}
                    transition={{ duration: 0.3 }}
                  ></motion.div>
                  
                  {/* Feature description with smooth reveal animation */}
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ 
                      height: isExpanded ? 'auto' : 0,
                      opacity: isExpanded ? 1 : 0
                    }}
                    transition={{ 
                      duration: 0.4,
                      ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                    style={{ overflow: 'hidden' }}
                  >
                    <p 
                      className="mt-1 sm:mt-2 text-sm sm:text-base px-2"
                      style={{ 
                        color: '#F5F1EB',
                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)',
                        opacity: 0.9
                      }}
                    >
                      {feature.description}
                    </p>
                  </motion.div>
                  
                  {/* Subtle hint for interaction */}
                  {!isExpanded && (
                    <motion.div 
                      className="mt-2 text-xs opacity-50"
                      style={{ 
                        color: '#F5F1EB',
                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)'
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.5 }}
                      transition={{ delay: 1 }}
                    >
                      לחץ לפרטים נוספים
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default WabiSabiFeature;