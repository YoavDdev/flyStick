'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { FaPlay, FaVideo, FaStar, FaCheck } from 'react-icons/fa';
import Link from 'next/link';

interface VideoSeries {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnailUrl: string;
  videoCount: number;
  isFeatured: boolean;
  hasAccess: boolean;
  accessType?: string;
  paypalProductId: string;
}

const SeriesPromotion = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [series, setSeries] = useState<VideoSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasingSeriesId, setPurchasingSeriesId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const response = await fetch('/api/series');
        const data = await response.json();
        // Show only featured series or top 6 series for promotion
        const promotionSeries = data.series
          .filter((s: VideoSeries) => s.isFeatured || data.series.indexOf(s) < 6)
          .slice(0, 6);
        setSeries(promotionSeries);
      } catch (error) {
        console.error('Error fetching series:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSeries();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (series.length === 0) return null;

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            סדרות אימונים מקצועיות
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            כאן תוכלו למצוא סדרות אימונים מקצועיות בתשלום חד פעמי לכל סדרה - רק 69 ₪ לסדרה שלמה! כל סדרה מכילה מגוון תרגילים ושיעורים שיובילו אתכם להתפתחות גופנית ורוחנית
          </p>
        </motion.div>

        {/* Series Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {series.map((seriesItem, index) => (
            <motion.div
              key={seriesItem.id}
              className="group cursor-pointer"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
            >
              <div className="relative bg-[#F0E9DF] rounded-2xl border border-[#D5C4B7] p-4 shadow-md hover:shadow-lg transition-all duration-500 h-full">
                {/* Series Thumbnail */}
                <div className="relative aspect-[2/3] bg-gradient-to-br from-[#D5C4B7] to-[#B8A99C] rounded-xl overflow-hidden mb-4">
                    {seriesItem.thumbnailUrl ? (
                      <img
                        src={seriesItem.thumbnailUrl}
                        alt={seriesItem.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FaVideo className="text-4xl text-white/70" />
                      </div>
                    )}
                    
                    {/* Overlay with Play Button */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {seriesItem.hasAccess ? (
                          <Link href={`/series/${seriesItem.id}`}>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="bg-white text-[#2D3142] p-4 rounded-full shadow-lg"
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
                              setPurchasingSeriesId(seriesItem.id);
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="bg-[#B8A99C] text-white p-4 rounded-full shadow-lg"
                          >
                            <FaPlay className="text-xl ml-1" />
                          </motion.button>
                        )}
                      </div>
                    </div>

                  {/* Access Status Badge */}
                  {seriesItem.hasAccess ? (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-[#D5C4B7] to-[#B8A99C] text-[#2D3142] px-3 py-1 rounded-full text-sm font-bold shadow-md">
                      <FaCheck className="inline mr-1" />
                      {seriesItem.accessType === 'subscription' ? 'מנוי' : 'נרכש'}
                    </div>
                  ) : (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-[#D9713C] to-[#D9713C]/80 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
                      ₪{seriesItem.price}
                    </div>
                  )}

                  {/* Featured Badge */}
                  {seriesItem.isFeatured && (
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-[#D9713C] to-[#D9713C]/80 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
                      <FaStar className="inline mr-1" />
                      מומלץ
                    </div>
                  )}
                </div>

                {/* Series Info */}
                <div className="space-y-4 flex-1">
                  <h3 className="text-lg font-bold text-[#2D3142] group-hover:text-[#D9713C] transition-colors duration-300">
                    {seriesItem.title}
                  </h3>
                  <p className="text-[#2D3142]/70 text-xs leading-relaxed line-clamp-3">
                    {seriesItem.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-xs text-[#2D3142]/60">
                      <FaVideo className="text-[#D9713C]" />
                      <span>{seriesItem.videoCount} פרקים</span>
                    </div>
                    
                    {!seriesItem.hasAccess && (
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!session) {
                            router.push(`/series/register?returnUrl=${encodeURIComponent(window.location.pathname)}`);
                            return;
                          }
                          setPurchasingSeriesId(seriesItem.id);
                        }}
                        className="bg-gradient-to-r from-[#D5C4B7] to-[#B8A99C] text-[#2D3142] px-3 py-1 rounded-lg hover:from-[#B8A99C] hover:to-[#D5C4B7] transition-all duration-300 text-xs font-bold shadow-md"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        רכישה
                      </motion.button>
                    )}
                  </div>
                </div>

                {/* Inline PayPal for purchasing */}
                {purchasingSeriesId === seriesItem.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 pt-4 border-t border-[#D5C4B7]/30"
                  >
                    <p className="text-sm text-[#2D3142] mb-3 text-center">בחר אמצעי תשלום:</p>
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
                          height: 35,
                          label: "pay"
                        }}
                        createOrder={(data, actions) => {
                          return actions.order.create({
                            purchase_units: [{
                              amount: {
                                value: seriesItem.price.toString(),
                                currency_code: "ILS"
                              },
                              description: seriesItem.title
                            }],
                            intent: "CAPTURE"
                          });
                        }}
                        onApprove={(data, actions) => {
                          return actions.order!.capture().then(async (details) => {
                            try {
                              const response = await fetch('/api/series/purchase', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                  seriesId: seriesItem.id,
                                  paypalOrderId: details.id,
                                  paypalDetails: details
                                }),
                              });

                              if (response.ok) {
                                toast.success('הרכישה בוצעה בהצלחה! 🎉');
                                setPurchasingSeriesId(null);
                                // Refresh series data
                                const updatedResponse = await fetch('/api/series');
                                const updatedData = await updatedResponse.json();
                                const promotionSeries = updatedData.series
                                  .filter((s: VideoSeries) => s.isFeatured || updatedData.series.indexOf(s) < 6)
                                  .slice(0, 6);
                                setSeries(promotionSeries);
                              } else {
                                const error = await response.json();
                                toast.error(error.error || 'שגיאה בעיבוד הרכישה');
                              }
                            } catch (error) {
                              console.error('Error processing purchase:', error);
                              toast.error('שגיאה בעיבוד הרכישה');
                            }
                          });
                        }}
                        onError={(err) => {
                          console.error('PayPal Error:', err);
                          toast.error('שגיאה בתשלום');
                        }}
                      />
                    </PayPalScriptProvider>
                    <button
                      onClick={() => setPurchasingSeriesId(null)}
                      className="mt-2 text-sm text-[#5D5D5D] hover:text-[#2D3142] transition-colors w-full text-center"
                    >
                      ביטול
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              מוכנים להתחיל את המסע?
            </h3>
            <p className="text-white/90 mb-6">
              הצטרפו למנוי שלנו וקבלו גישה מלאה לכל סדרות הוידאו, שיעורים חדשים כל שבוע ותמיכה אישית
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/#pricing">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-[#2D3142] px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
                >
                  הפעילו מנוי עכשיו
                </motion.button>
              </Link>
              <Link href="/series">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors"
                >
                  עיינו בכל הסדרות
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SeriesPromotion;
