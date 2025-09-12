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
        setSeriesData(data);
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
          <p className="mt-4 text-[#2D3142]">טוען סדרות...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F3EB]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#D5C4B7]/10 to-[#B8A99C]/10"></div>
        <div className="container mx-auto px-6 pt-20 pb-16 relative">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            
            <h1 className="text-5xl md:text-6xl font-bold text-[#2D3142] mb-6 leading-tight">
              <span className="bg-gradient-to-r from-[#D5C4B7] to-[#B8A99C] bg-clip-text text-transparent">
                סדרות הווידאו
              </span>
              <br />
              <span className="text-[#2D3142]">המקצועיות ביותר</span>
            </h1>

            <p className="text-xl text-[#2D3142]/80 max-w-3xl mx-auto mb-8 leading-relaxed">
              גלו עולם של ידע מקצועי עם סדרות וידאו איכותיות שיקחו אתכם לשלב הבא.
              <br />
              <span className="text-[#D9713C] font-semibold">למידה מותאמת אישית, תוצאות מוכחות.</span>
            </p>
            
            {seriesData?.userInfo.hasActiveSubscription ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gradient-to-r from-[#D5C4B7] to-[#B8A99C] rounded-2xl p-6 max-w-lg mx-auto shadow-md border border-[#D5C4B7]/30"
              >
                <div className="flex items-center justify-center gap-3 text-[#2D3142]">
                  <FaCheck className="text-2xl" />
                  <div>
                    <p className="font-bold text-lg">מנוי פעיל</p>
                    <p className="text-[#2D3142]/80">גישה חופשית לכל הסדרות!</p>
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
                    className="bg-gradient-to-r from-[#D5C4B7] to-[#B8A99C] text-[#2D3142] px-8 py-4 rounded-xl font-bold text-lg shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    התחל מנוי עכשיו
                  </motion.button>
                </Link>
                <p className="text-[#2D3142]/60 text-sm">או רכוש סדרות בנפרד</p>
              </motion.div>
            )}
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
                      <img
                        src="/uploads/series/1757277122800__________.jpg"
                        alt={series.title}
                        className="w-full h-full object-cover object-center"
                      />
                      
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
                        <div className="absolute top-4 right-4 bg-gradient-to-r from-[#D5C4B7] to-[#B8A99C] text-[#2D3142] px-3 py-1 rounded-full text-sm font-bold shadow-md flex items-center gap-1">
                          <FaCheck className="text-xs" />
                          <span>{series.accessType === 'subscription' ? 'מנוי' : 'נרכש'}</span>
                        </div>
                      ) : (
                        <div className="absolute top-4 right-4 bg-gradient-to-r from-[#D9713C] to-[#D9713C]/80 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
                          ₪{series.price}
                        </div>
                      )}

                      {/* Featured Badge */}
                      {series.isFeatured && (
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
