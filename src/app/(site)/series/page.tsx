"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import toast from "react-hot-toast";
import Link from "next/link";
import { FaPlay, FaLock, FaCheck, FaStar, FaVideo } from "react-icons/fa";

interface VideoSeries {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnailUrl?: string;
  videoCount: number;
  isFeatured: boolean;
  vimeoFolderId: string;
  vimeoFolderName: string;
  paypalProductId: string;
  hasAccess: boolean;
  accessType: 'subscription' | 'purchased' | 'none';
  isComingSoon?: boolean;
}

interface SeriesData {
  series: VideoSeries[];
  userInfo: {
    hasActiveSubscription: boolean;
    purchasedSeriesCount: number;
  };
}

const SeriesMarketplace = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [seriesData, setSeriesData] = useState<SeriesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasingSeriesId, setPurchasingSeriesId] = useState<string | null>(null);

  useEffect(() => {
    fetchSeries();
  }, [session]);

  const fetchSeries = async () => {
    try {
      const response = await fetch("/api/series");
      if (response.ok) {
        const data = await response.json();
        // Sort series to show "בקרוב" (coming soon) series at the end
        const sortedSeries = data.series.sort((a: VideoSeries, b: VideoSeries) => {
          const aIsComingSoon = a.isComingSoon || a.title.includes('בקרוב');
          const bIsComingSoon = b.isComingSoon || b.title.includes('בקרוב');
          
          // If one is coming soon and the other isn't, put coming soon at the end
          if (aIsComingSoon && !bIsComingSoon) return 1;
          if (!aIsComingSoon && bIsComingSoon) return -1;
          
          // Otherwise maintain original order
          return 0;
        });
        
        setSeriesData({
          ...data,
          series: sortedSeries
        });
      } else {
        toast.error("שגיאה בטעינת הסדרות");
      }
    } catch (error) {
      console.error("Error fetching series:", error);
      toast.error("שגיאה בטעינת הסדרות");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseComplete = async (seriesId: string, paypalOrderId: string, paypalPayerId: string, amount: number) => {
    try {
      const response = await fetch("/api/series/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seriesId,
          paypalOrderId,
          paypalPayerId,
          amount,
          currency: "ILS"
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast.success("הרכישה הושלמה בהצלחה! 🎉");
        fetchSeries(); // Refresh to update access status
        setPurchasingSeriesId(null);
      } else {
        const error = await response.json();
        toast.error(error.error || "שגיאה בעיבוד הרכישה");
      }
    } catch (error) {
      console.error("Error processing purchase:", error);
      toast.error("שגיאה בעיבוד הרכישה");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-24">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#D5C4B7]"></div>
          <p className="mt-4 text-[#2D3142]">טוען סדרות וידאו...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F3EB]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#D5C4B7]/10 to-[#B8A99C]/10"></div>
        <div className="container mx-auto px-6 pt-12 md:pt-20 pb-8 md:pb-16 relative">
          <motion.div
            className="text-center mb-8 md:mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-[#2D3142] mb-4 md:mb-6 leading-tight">
              <span className="bg-gradient-to-r from-[#D5C4B7] to-[#B8A99C] bg-clip-text text-transparent">
                סדרות הווידאו
              </span>
              <br />
              <span className="text-[#2D3142]">המקצועיות ביותר</span>
            </h1>
            
            <p className="text-base md:text-xl text-[#2D3142]/80 max-w-3xl mx-auto mb-6 md:mb-8 leading-relaxed">
              גלו עולם של ידע מקצועי עם סדרות וידאו איכותיות שיקחו אתכם לשלב הבא.
              <br />
              <span className="text-[#D9713C] font-semibold">למידה מותאמת אישית, תוצאות מוכחות.</span>
            </p>
            
            {seriesData?.userInfo.hasActiveSubscription ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gradient-to-r from-[#D5C4B7] to-[#B8A99C] rounded-xl px-6 md:px-8 py-3 md:py-4 shadow-md inline-block"
              >
                <div className="flex items-center justify-center gap-2 text-[#2D3142]">
                  <div className="text-center">
                    <p className="font-bold text-sm md:text-base">מנוי פעיל - יש לך גישה לכל הסדרות</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <Link href="/#Pricing">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-[#D5C4B7] to-[#B8A99C] text-[#2D3142] px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    התחל מנוי עכשיו
                  </motion.button>
                </Link>
                <p className="text-[#2D3142]/60 text-sm">או רכוש סדרות בנפרד</p>
              </motion.div>
            )}
          </motion.div>
          
          {/* Elegant Scroll Indicator - Only on Mobile */}
          <motion.div
            className="md:hidden flex flex-col items-center gap-3 mt-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            <div className="relative">
              <motion.div
                className="absolute inset-0 bg-[#D5C4B7]/20 blur-xl rounded-full"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <p className="relative text-[#B56B4A] font-medium text-base px-6 py-2 bg-[#F7F3EB]/80 backdrop-blur-sm rounded-full border border-[#D5C4B7]/30 shadow-sm">
                הסדרות מחכות לכם למטה
              </p>
            </div>
            
            <motion.div
              animate={{ 
                y: [0, 8, 0],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="flex flex-col items-center gap-1"
            >
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                className="text-[#D5C4B7]"
              >
                <path 
                  d="M12 5v14m0 0l-7-7m7 7l7-7" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Professional Series Grid */}
      {seriesData?.series.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[#2D3142]/60 text-lg">אין סדרות זמינות כרגע</p>
        </div>
      ) : (
        <div className="container mx-auto px-6 pb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-[#2D3142] mb-8 text-center"
          >
            בחרו את הסדרה המתאימה לכם
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {seriesData?.series.map((series, index) => (
              <motion.div
                key={series.id}
                className="group cursor-pointer"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <div 
                  className="relative bg-[#F0E9DF] rounded-2xl border border-[#D5C4B7] p-6 shadow-md hover:shadow-lg transition-all duration-500 h-full"
                  onClick={() => {
                    if (series.hasAccess) {
                      router.push(`/series/${series.id}`);
                    } else {
                      if (!session) {
                        router.push(`/series/register?returnUrl=${encodeURIComponent(window.location.pathname)}`);
                        return;
                      }
                      setPurchasingSeriesId(series.id);
                    }
                  }}
                >
                    {/* Series Thumbnail */}
                    <div className="relative aspect-[2/3] bg-gradient-to-br from-[#D5C4B7] to-[#B8A99C] rounded-xl overflow-hidden mb-6">
                      {series.thumbnailUrl ? (
                        <img
                          src={series.thumbnailUrl}
                          alt={series.title}
                          className="w-full h-full object-cover object-center"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FaVideo className="text-4xl text-white/70" />
                        </div>
                      )}
                      
                      {/* Overlay with Play Button */}
                      <div className="absolute inset-0 bg-[#2D3142]/0 group-hover:bg-[#2D3142]/40 transition-all duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          {series.hasAccess ? (
                            <Link href={`/series/${series.id}`}>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="bg-white text-[#2D3142] p-4 rounded-full shadow-xl"
                              >
                                <FaPlay className="text-xl ml-1" />
                              </motion.button>
                            </Link>
                          ) : (
                            <motion.button
                              onClick={() => {
                                if (!session) {
                                  router.push(`/series/register?returnUrl=${encodeURIComponent(window.location.pathname)}`);
                                  return;
                                }
                                setPurchasingSeriesId(series.id);
                              }}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="bg-gradient-to-r from-[#D5C4B7] to-[#B8A99C] text-[#2D3142] p-4 rounded-full shadow-xl"
                            >
                              <FaPlay className="text-xl ml-1" />
                            </motion.button>
                          )}
                        </div>
                      </div>

                      {/* Access Status Badge */}
                      {series.hasAccess ? (
                        <div className="absolute top-4 right-4 bg-gradient-to-r from-[#D5C4B7] to-[#B8A99C] text-[#2D3142] px-3 py-1 rounded-full text-sm font-bold shadow-md">
                          <FaCheck className="inline mr-1" />
                          {series.accessType === 'subscription' ? 'מנוי' : 'נרכש'}
                        </div>
                      ) : (
                        <div className="absolute top-4 right-4 bg-gradient-to-r from-[#D9713C] to-[#D9713C]/80 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
                          ₪{series.price}
                        </div>
                      )}

                      {/* Coming Soon Tag - Half Red Circle at Bottom */}
                      {(series.isComingSoon || series.title.includes('בקרוב')) && (
                        <motion.div 
                          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 z-10"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                        >
                          <div className="relative">
                            {/* Half red circle at bottom */}
                            <div className="bg-red-500 text-white px-6 py-3 rounded-t-full shadow-lg">
                              {/* Tag text */}
                              <motion.span 
                                className="text-sm font-bold tracking-wide"
                                animate={{ opacity: [0.9, 1, 0.9] }}
                                transition={{ 
                                  duration: 2.5, 
                                  repeat: Infinity, 
                                  repeatType: "reverse",
                                  ease: "easeInOut"
                                }}
                              >
                                בקרוב
                              </motion.span>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Featured Badge */}
                      {series.isFeatured && !(series.isComingSoon || series.title.includes('בקרוב')) && (
                        <div className="absolute top-4 left-4 bg-gradient-to-r from-[#D9713C] to-[#D9713C]/80 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
                          <FaStar className="inline mr-1" />
                          מומלץ
                        </div>
                      )}
                    </div>

                    {/* Series Info */}
                    <div className="space-y-4 flex-1">
                      <h3 className="text-2xl font-bold text-[#2D3142] group-hover:text-[#D9713C] transition-colors duration-300">
                        {series.title}
                      </h3>
                      <p className="text-[#2D3142]/70 text-sm leading-relaxed line-clamp-3">
                        {series.description}
                      </p>
                      
                      <div className="flex items-center justify-between pt-4">
                        <div className="flex items-center gap-2 text-sm text-[#2D3142]/60">
                          <FaVideo className="text-[#D9713C]" />
                          <span>{series.videoCount} פרקים</span>
                        </div>
                        
                        {!series.hasAccess && !seriesData?.userInfo.hasActiveSubscription && (
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!session) {
                                router.push(`/series/register?returnUrl=${encodeURIComponent(window.location.pathname)}`);
                                return;
                              }
                              setPurchasingSeriesId(series.id);
                            }}
                            className="bg-gradient-to-r from-[#D5C4B7] to-[#B8A99C] text-[#2D3142] px-6 py-2 rounded-lg hover:from-[#B8A99C] hover:to-[#D5C4B7] transition-all duration-300 text-sm font-bold shadow-md"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            רכישה
                          </motion.button>
                        )}
                      </div>
                    </div>

                    {/* Inline PayPal for purchasing */}
                    {purchasingSeriesId === series.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-6 pt-6 border-t border-[#D5C4B7]"
                      >
                        <p className="text-sm text-[#2D3142]/70 mb-4 text-center font-medium">בחר אמצעי תשלום:</p>
                        <PayPalScriptProvider
                          options={{
                            clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
                            components: "buttons",
                            intent: "capture",
                            currency: "ILS"
                          }}
                        >
                          <PayPalButtons
                            style={{
                              color: "blue",
                              shape: "pill",
                              height: 40,
                              label: "pay"
                            }}
                            createOrder={(data, actions) => {
                              return actions.order.create({
                                purchase_units: [{
                                  amount: {
                                    value: series.price.toString(),
                                    currency_code: "ILS"
                                  },
                                  description: series.title
                                }],
                                intent: "CAPTURE"
                              });
                            }}
                            onApprove={(data, actions) => {
                              return actions.order!.capture().then((details) => {
                                handlePurchaseComplete(
                                  series.id,
                                  data.orderID,
                                  details.payer?.payer_id || "",
                                  series.price
                                );
                              });
                            }}
                            onError={(err) => {
                              console.error("PayPal error:", err);
                              toast.error("שגיאה בתשלום");
                              setPurchasingSeriesId(null);
                            }}
                          />
                        </PayPalScriptProvider>
                        <button
                          onClick={() => setPurchasingSeriesId(null)}
                          className="w-full mt-3 text-sm text-[#2D3142]/60 hover:text-[#2D3142] transition-colors"
                        >
                          ביטול
                        </button>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
        </div>
      )}

    </div>
  );
};

export default SeriesMarketplace;
