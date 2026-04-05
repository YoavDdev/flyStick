"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import toast from "react-hot-toast";
import Link from "next/link";
import { FaPlay, FaLock, FaCheck, FaStar, FaVideo } from "react-icons/fa";
import { trackSeriesPurchase, trackSeriesView } from "../../libs/analytics";

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

interface SaleConfig {
  isActive: boolean;
  saleName: string | null;
  badgeText: string | null;
  originalPrice: number | null;
  salePrice: number | null;
}

const SeriesMarketplace = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [seriesData, setSeriesData] = useState<SeriesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasingSeriesId, setPurchasingSeriesId] = useState<string | null>(null);
  const [saleConfig, setSaleConfig] = useState<SaleConfig | null>(null);
  const [giftSeriesId, setGiftSeriesId] = useState<string | null>(null);
  const [giftForm, setGiftForm] = useState({ recipientEmail: '', recipientName: '', giftMessage: '' });
  const [giftProcessing, setGiftProcessing] = useState(false);
  const [giftConfirmed, setGiftConfirmed] = useState(false);
  const [giftSuccessData, setGiftSuccessData] = useState<{ seriesTitle: string; recipientName: string; recipientEmail: string } | null>(null);
  const [giftEligibilityError, setGiftEligibilityError] = useState<string | null>(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);

  useEffect(() => {
    fetchSeries();
    fetchSaleConfig();
  }, [session]);

  const fetchSaleConfig = async () => {
    try {
      const response = await fetch("/api/sale-config");
      if (response.ok) {
        const data = await response.json();
        setSaleConfig(data);
      }
    } catch (error) {
      console.error("Error fetching sale config:", error);
    }
  };

  const getDisplayPrice = (series: VideoSeries) => {
    if (saleConfig?.isActive && saleConfig.salePrice) {
      return saleConfig.salePrice;
    }
    return series.price;
  };

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

  const checkGiftEligibility = async (seriesId: string) => {
    setCheckingEligibility(true);
    setGiftEligibilityError(null);
    try {
      const response = await fetch("/api/series/check-gift-eligibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seriesId,
          recipientEmail: giftForm.recipientEmail
        })
      });

      const result = await response.json();
      if (result.eligible) {
        setGiftConfirmed(true);
        return true;
      } else {
        setGiftEligibilityError(result.error);
        toast.error(result.error);
        return false;
      }
    } catch (error) {
      console.error("Error checking gift eligibility:", error);
      toast.error("שגיאה בבדיקת זכאות");
      return false;
    } finally {
      setCheckingEligibility(false);
    }
  };

  const handleGiftPurchaseComplete = async (seriesId: string, paypalOrderId: string, paypalPayerId: string, amount: number) => {
    setGiftProcessing(true);
    try {
      const series = seriesData?.series.find(s => s.id === seriesId);
      const response = await fetch("/api/series/gift-purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seriesId,
          paypalOrderId,
          paypalPayerId,
          amount,
          currency: "ILS",
          recipientEmail: giftForm.recipientEmail,
          recipientName: giftForm.recipientName,
          giftMessage: giftForm.giftMessage
        })
      });

      const result = await response.json();
      if (response.ok) {
        // Show success modal with gift details
        setGiftSuccessData({
          seriesTitle: series?.title || 'הסדרה',
          recipientName: giftForm.recipientName || giftForm.recipientEmail,
          recipientEmail: giftForm.recipientEmail
        });
        setGiftSeriesId(null);
        setGiftForm({ recipientEmail: '', recipientName: '', giftMessage: '' });
        setGiftConfirmed(false);
        setGiftEligibilityError(null);
      } else {
        toast.error(result.error || "שגיאה בעיבוד המתנה");
      }
    } catch (error) {
      console.error("Error processing gift purchase:", error);
      toast.error("שגיאה בעיבוד המתנה");
    } finally {
      setGiftProcessing(false);
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
        trackSeriesPurchase(seriesId, amount);
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

                      {/* Access Status Badge / Price Badge */}
                      {series.hasAccess ? (
                        <div className="absolute top-4 right-4 bg-gradient-to-r from-[#D5C4B7] to-[#B8A99C] text-white px-4 py-2 rounded-full text-sm font-bold shadow-xl border-2 border-white">
                          <FaCheck className="inline mr-1" />
                          {series.accessType === 'subscription' ? 'מנוי' : 'נרכש'}
                        </div>
                      ) : !(series.isComingSoon || series.title.includes('בקרוב')) ? (
                        saleConfig?.isActive && saleConfig.salePrice ? (
                          <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                            {saleConfig.badgeText && (
                              <div className="bg-gradient-to-r from-red-600 to-red-500 text-white px-4 py-2 rounded-full text-sm font-extrabold shadow-xl border-2 border-white animate-pulse">
                                {saleConfig.badgeText}
                              </div>
                            )}
                            <div className="bg-gradient-to-r from-[#B8A99C] to-[#D5C4B7] text-white px-3 py-1 rounded-full text-sm font-bold shadow-md flex items-center gap-2">
                              <span className="line-through opacity-70 text-xs">₪{saleConfig.originalPrice}</span>
                              <span>₪{saleConfig.salePrice}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="absolute top-4 right-4 bg-gradient-to-r from-[#B8A99C] to-[#D5C4B7] text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
                            ₪{series.price}
                          </div>
                        )
                      ) : null}

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
                        
                        {!(series.isComingSoon || series.title.includes('בקרוב')) && (
                          <div className="flex items-center gap-2 flex-wrap justify-end">
                            {/* Purchase button - only for users without access */}
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
                            
                            {/* Gift button - always show (even if user already purchased) */}
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!session) {
                                  router.push(`/series/register?returnUrl=${encodeURIComponent(window.location.pathname)}`);
                                  return;
                                }
                                setGiftSeriesId(series.id);
                                setPurchasingSeriesId(null);
                              }}
                              className="bg-white/90 border-2 border-[#B8A99C] text-[#2D3142] px-3 py-2 rounded-lg hover:bg-[#B8A99C]/10 hover:border-[#D5C4B7] transition-all duration-300 text-sm font-bold shadow-md whitespace-nowrap"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              title="רכישה כמתנה למישהו אחר"
                            >
                              <span className="flex items-center gap-1.5">
                                <span>🎁</span>
                                <span>מתנה</span>
                              </span>
                            </motion.button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Gift Purchase Modal */}
                    {giftSeriesId === series.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-6 pt-6 border-t border-[#D5C4B7]/30"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="bg-gradient-to-br from-[#F7F3EB] to-white rounded-xl p-6 border-2 border-[#D5C4B7]/40 shadow-lg">
                          <div className="bg-gradient-to-r from-[#B8A99C]/10 to-[#D5C4B7]/10 rounded-lg p-4 mb-5 border border-[#D5C4B7]/30">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-3xl">🎁</span>
                              <div>
                                <h4 className="text-xl font-bold text-[#2D3142]">שליחת מתנה</h4>
                                <p className="text-sm text-[#5D5D5D]">רוכש/ת את הסדרה עבור מישהו אחר</p>
                              </div>
                            </div>
                            <div className="bg-white/60 rounded-lg p-3 mt-3">
                              <p className="text-xs text-[#2D3142] font-medium">💡 שימו לב: הסדרה תישלח למקבל/ת המתנה, לא אליכם</p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-[#2D3142] mb-1">אימייל המקבל/ת *</label>
                              <input
                                type="email"
                                required
                                value={giftForm.recipientEmail}
                                onChange={(e) => setGiftForm({...giftForm, recipientEmail: e.target.value})}
                                className="w-full p-2.5 border border-[#D5C4B7]/30 rounded-lg bg-white/80 text-sm"
                                placeholder="example@email.com"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-[#2D3142] mb-1">שם המקבל/ת (אופציונלי)</label>
                              <input
                                type="text"
                                value={giftForm.recipientName}
                                onChange={(e) => setGiftForm({...giftForm, recipientName: e.target.value})}
                                className="w-full p-2.5 border border-[#D5C4B7]/30 rounded-lg bg-white/80 text-sm"
                                placeholder="שם המקבל/ת"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-[#2D3142] mb-1">הודעה אישית (אופציונלי)</label>
                              <textarea
                                value={giftForm.giftMessage}
                                onChange={(e) => setGiftForm({...giftForm, giftMessage: e.target.value})}
                                className="w-full p-2.5 border border-[#D5C4B7]/30 rounded-lg bg-white/80 text-sm resize-none"
                                rows={2}
                                placeholder="הודעה אישית למקבל/ת המתנה..."
                              />
                            </div>
                          </div>

                          {giftForm.recipientEmail && !giftConfirmed && (
                            <div className="mt-4">
                              {giftEligibilityError && (
                                <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-3">
                                  <p className="text-sm text-red-600 font-medium">⚠️ {giftEligibilityError}</p>
                                </div>
                              )}
                              <button
                                onClick={() => {
                                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                                  if (!emailRegex.test(giftForm.recipientEmail)) {
                                    toast.error("כתובת אימייל לא תקינה");
                                    return;
                                  }
                                  if (giftForm.recipientEmail.toLowerCase().trim() === session?.user?.email?.toLowerCase().trim()) {
                                    toast.error("לא ניתן לשלוח מתנה לעצמך");
                                    return;
                                  }
                                  checkGiftEligibility(series.id);
                                }}
                                disabled={checkingEligibility}
                                className="w-full bg-gradient-to-r from-[#B8A99C] to-[#D5C4B7] text-white py-2.5 rounded-lg font-bold text-sm hover:from-[#D5C4B7] hover:to-[#B8A99C] transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {checkingEligibility ? '🔍 בודק זכאות...' : 'אישור ומעבר לתשלום'}
                              </button>
                            </div>
                          )}

                          {giftConfirmed && (
                            <div className="mt-4">
                              <div className="bg-white/80 rounded-lg p-3 mb-3 border border-[#D5C4B7]/30 shadow-sm">
                                <p className="text-xs text-[#5D5D5D] mb-1">שולח מתנה ל:</p>
                                <p className="text-sm font-bold text-[#2D3142]">{giftForm.recipientName || giftForm.recipientEmail}</p>
                                <p className="text-xs text-[#5D5D5D]">{giftForm.recipientEmail}</p>
                                <button
                                  onClick={() => setGiftConfirmed(false)}
                                  className="text-xs text-[#D9713C] hover:underline mt-1"
                                >
                                  שינוי פרטים
                                </button>
                              </div>
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
                                    color: "gold",
                                    shape: "pill",
                                    height: 40,
                                    label: "pay"
                                  }}
                                  createOrder={(data, actions) => {
                                    const chargePrice = getDisplayPrice(series);
                                    return actions.order.create({
                                      purchase_units: [{
                                        amount: {
                                          value: chargePrice.toString(),
                                          currency_code: "ILS"
                                        },
                                        description: `מתנה: ${series.title}`
                                      }],
                                      intent: "CAPTURE"
                                    });
                                  }}
                                  onApprove={(data, actions) => {
                                    const chargePrice = getDisplayPrice(series);
                                    return actions.order!.capture().then((details) => {
                                      handleGiftPurchaseComplete(
                                        series.id,
                                        data.orderID,
                                        details.payer?.payer_id || "",
                                        chargePrice
                                      );
                                    });
                                  }}
                                  onError={(err) => {
                                    console.error("PayPal gift error:", err);
                                    toast.error("שגיאה בתשלום");
                                  }}
                                />
                              </PayPalScriptProvider>
                            </div>
                          )}

                          <button
                            onClick={() => {
                              setGiftSeriesId(null);
                              setGiftForm({ recipientEmail: '', recipientName: '', giftMessage: '' });
                              setGiftConfirmed(false);
                              setGiftEligibilityError(null);
                            }}
                            className="w-full mt-3 text-sm text-[#2D3142]/60 hover:text-[#2D3142] transition-colors"
                          >
                            ביטול
                          </button>
                        </div>
                      </motion.div>
                    )}

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
                              const chargePrice = getDisplayPrice(series);
                              return actions.order.create({
                                purchase_units: [{
                                  amount: {
                                    value: chargePrice.toString(),
                                    currency_code: "ILS"
                                  },
                                  description: series.title
                                }],
                                intent: "CAPTURE"
                              });
                            }}
                            onApprove={(data, actions) => {
                              const chargePrice = getDisplayPrice(series);
                              return actions.order!.capture().then((details) => {
                                handlePurchaseComplete(
                                  series.id,
                                  data.orderID,
                                  details.payer?.payer_id || "",
                                  chargePrice
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

      {/* Gift Success Modal */}
      {giftSuccessData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D3142]/60 backdrop-blur-sm"
          onClick={() => setGiftSuccessData(null)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative bg-gradient-to-br from-[#F7F3EB] to-white rounded-3xl p-8 max-w-md w-full shadow-2xl border-2 border-[#D5C4B7]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gift Icon */}
            <div className="flex justify-center mb-6">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", duration: 0.7 }}
                className="bg-gradient-to-br from-[#D5C4B7] to-[#B8A99C] rounded-full p-6 shadow-lg"
              >
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 12V21C20 21.2652 19.8946 21.5196 19.7071 21.7071C19.5196 21.8946 19.2652 22 19 22H5C4.73478 22 4.48043 21.8946 4.29289 21.7071C4.10536 21.5196 4 21.2652 4 21V12" fill="white"/>
                  <path d="M22 7H2V12H22V7Z" fill="white"/>
                  <rect x="11" y="7" width="2" height="15" fill="rgba(181, 168, 156, 0.5)"/>
                  <path d="M12 7C12 7 10.5 2 7 2C5.89543 2 5 2.89543 5 4C5 5.10457 5.89543 6 7 6C8.5 6 10 6.5 12 7Z" fill="white"/>
                  <path d="M12 7C12 7 13.5 2 17 2C18.1046 2 19 2.89543 19 4C19 5.10457 18.1046 6 17 6C15.5 6 14 6.5 12 7Z" fill="white"/>
                </svg>
              </motion.div>
            </div>

            {/* Success Message */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-6"
            >
              <h2 className="text-3xl font-bold text-[#2D3142] mb-3">
                המתנה נשלחה בהצלחה! 🎉
              </h2>
              <p className="text-[#2D3142]/70 text-base leading-relaxed">
                מייל עם פרטי הגישה נשלח למקבל/ת המתנה
              </p>
            </motion.div>

            {/* Gift Details */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/80 rounded-2xl p-5 mb-6 border border-[#D5C4B7]/30 shadow-sm space-y-3"
            >
              <div>
                <p className="text-xs text-[#2D3142]/60 mb-1 font-medium">הסדרה שנרכשה:</p>
                <p className="text-lg font-bold text-[#2D3142]">{giftSuccessData.seriesTitle}</p>
              </div>
              <div className="border-t border-[#D5C4B7]/20 pt-3">
                <p className="text-xs text-[#2D3142]/60 mb-1 font-medium">נשלחה אל:</p>
                <p className="text-base font-bold text-[#2D3142]">{giftSuccessData.recipientName}</p>
                <p className="text-sm text-[#2D3142]/60 mt-1">{giftSuccessData.recipientEmail}</p>
              </div>
            </motion.div>

            {/* Close Button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              onClick={() => setGiftSuccessData(null)}
              className="w-full bg-gradient-to-r from-[#D5C4B7] to-[#B8A99C] text-white py-3.5 rounded-xl font-bold text-lg hover:from-[#B8A99C] hover:to-[#D5C4B7] transition-all duration-300 shadow-md hover:shadow-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              סגירה
            </motion.button>

            {/* Decorative Elements */}
            <div className="absolute -top-2 -right-2 w-16 h-16 bg-gradient-to-br from-[#D5C4B7]/20 to-transparent rounded-full blur-xl" />
            <div className="absolute -bottom-2 -left-2 w-20 h-20 bg-gradient-to-tr from-[#B8A99C]/20 to-transparent rounded-full blur-xl" />
          </motion.div>
        </motion.div>
      )}

    </div>
  );
};

export default SeriesMarketplace;
