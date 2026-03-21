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
  isComingSoon?: boolean;
}

interface SaleConfig {
  isActive: boolean;
  saleName: string | null;
  badgeText: string | null;
  originalPrice: number | null;
  salePrice: number | null;
}

const SeriesPromotion = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [series, setSeries] = useState<VideoSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasingSeriesId, setPurchasingSeriesId] = useState<string | null>(null);
  const [saleConfig, setSaleConfig] = useState<SaleConfig | null>(null);
  const [giftSeriesId, setGiftSeriesId] = useState<string | null>(null);
  const [giftForm, setGiftForm] = useState({ recipientEmail: '', recipientName: '', giftMessage: '' });
  const [giftProcessing, setGiftProcessing] = useState(false);
  const [giftConfirmed, setGiftConfirmed] = useState(false);

  useEffect(() => {
    const fetchSaleConfig = async () => {
      try {
        const response = await fetch('/api/sale-config');
        if (response.ok) {
          const data = await response.json();
          setSaleConfig(data);
        }
      } catch (error) {
        console.error('Error fetching sale config:', error);
      }
    };
    fetchSaleConfig();

    const fetchSeries = async () => {
      try {
        const response = await fetch('/api/series');
        const data = await response.json();
        // Show only the last 3 series
        const promotionSeries = data.series
          .slice(-3)
          .reverse(); // Show newest first
        setSeries(promotionSeries);
      } catch (error) {
        console.error('Error fetching series:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSeries();
  }, []);

  const getDisplayPrice = (item: VideoSeries) => {
    if (saleConfig?.isActive && saleConfig.salePrice) {
      return saleConfig.salePrice;
    }
    return item.price;
  };

  const handleGiftPurchaseComplete = async (seriesId: string, paypalOrderId: string, paypalPayerId: string, amount: number) => {
    setGiftProcessing(true);
    try {
      const response = await fetch('/api/series/gift-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seriesId,
          paypalOrderId,
          paypalPayerId,
          amount,
          currency: 'ILS',
          recipientEmail: giftForm.recipientEmail,
          recipientName: giftForm.recipientName,
          giftMessage: giftForm.giftMessage
        })
      });
      const result = await response.json();
      if (response.ok) {
        toast.success(result.message || 'המתנה נשלחה בהצלחה! 🎁');
        setGiftSeriesId(null);
        setGiftForm({ recipientEmail: '', recipientName: '', giftMessage: '' });
        setGiftConfirmed(false);
      } else {
        toast.error(result.error || 'שגיאה בעיבוד המתנה');
      }
    } catch (error) {
      console.error('Error processing gift purchase:', error);
      toast.error('שגיאה בעיבוד המתנה');
    } finally {
      setGiftProcessing(false);
    }
  };

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
            רוצים לרכוש סדרה בודדת?
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-6">
            מעוניינים בהכשרה קצרה וממוקדת? אתר הסדרות שלנו מציע סדרות בודדות לרכישה - תשלום חד פעמי לכל סדרה, שלכם לתמיד
          </p>
          <Link href="/series">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-[#2D3142] px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors shadow-lg"
            >
              כל הסדרות
            </motion.button>
          </Link>
        </motion.div>

        {/* Responsive Grid */}
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {series.map((seriesItem, index) => (
              <motion.div
                key={seriesItem.id}
                className="group cursor-pointer"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <div className="relative bg-white/80 backdrop-blur-sm rounded-xl border border-[#D5C4B7]/30 p-6 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                  {/* Series Thumbnail - Clickable */}
                  <div 
                    className="relative w-full h-64 bg-gradient-to-br from-[#D5C4B7] to-[#B8A99C] rounded-lg overflow-hidden mb-4 cursor-pointer"
                    onClick={() => {
                      if (seriesItem.hasAccess) {
                        router.push(`/series/${seriesItem.id}`);
                      } else {
                        if (!session) {
                          router.push(`/series/register?returnUrl=${encodeURIComponent(window.location.pathname)}`);
                          return;
                        }
                        setPurchasingSeriesId(seriesItem.id);
                      }
                    }}
                  >
                    {seriesItem.thumbnailUrl ? (
                      <img
                        src={seriesItem.thumbnailUrl}
                        alt={seriesItem.title}
                        className="w-full h-full object-cover object-center"
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
                      <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        <FaCheck className="inline mr-1" />
                        {seriesItem.accessType === 'subscription' ? 'מנוי' : 'נרכש'}
                      </div>
                    ) : saleConfig?.isActive && saleConfig.salePrice ? (
                      <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                        {saleConfig.badgeText && (
                          <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-md animate-pulse">
                            {saleConfig.badgeText}
                          </div>
                        )}
                        <div className="bg-[#D9713C] text-white px-2 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1">
                          <span className="line-through opacity-70 text-[10px]">₪{saleConfig.originalPrice}</span>
                          <span>₪{saleConfig.salePrice}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="absolute top-3 right-3 bg-[#B8A99C] text-white px-2 py-1 rounded-full text-xs font-medium">
                        ₪{seriesItem.price}
                      </div>
                    )}

                    {/* Coming Soon Tag - Half Red Circle at Bottom */}
                    {(seriesItem.isComingSoon || seriesItem.title.includes('בקרוב')) && (
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
                              .בקרוב
                            </motion.span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Featured Badge */}
                    {seriesItem.isFeatured && !(seriesItem.isComingSoon || seriesItem.title.includes('בקרוב')) && (
                      <div className="absolute top-3 left-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        <FaStar className="inline mr-1" />
                        מומלץ
                      </div>
                    )}
                  </div>

                  {/* Series Info - Clickable Title */}
                  <div className="space-y-3">
                    <h3 
                      className="text-xl font-bold text-[#2D3142] line-clamp-1 cursor-pointer hover:text-[#B8A99C] transition-colors"
                      onClick={() => {
                        if (seriesItem.hasAccess) {
                          router.push(`/series/${seriesItem.id}`);
                        } else {
                          if (!session) {
                            router.push(`/series/register?returnUrl=${encodeURIComponent(window.location.pathname)}`);
                            return;
                          }
                          setPurchasingSeriesId(seriesItem.id);
                        }
                      }}
                    >
                      {seriesItem.title}
                    </h3>
                    <p className="text-[#5D5D5D] text-sm line-clamp-2">{seriesItem.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-[#5D5D5D]">
                        <FaVideo className="text-[#B8A99C]" />
                        <span>{seriesItem.videoCount} פרקים</span>
                      </div>
                      
                      {!(seriesItem.isComingSoon || seriesItem.title.includes('בקרוב')) ? (
                        <div className="flex items-center gap-2">
                          {/* View Now button - for users with access */}
                          {seriesItem.hasAccess && (
                            <Link href={`/series/${seriesItem.id}`}>
                              <motion.button
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                צפה עכשיו
                              </motion.button>
                            </Link>
                          )}
                          
                          {/* Purchase button - only for users without access */}
                          {!seriesItem.hasAccess && (
                            <motion.button
                              onClick={() => {
                                if (!session) {
                                  router.push(`/series/register?returnUrl=${encodeURIComponent(window.location.pathname)}`);
                                  return;
                                }
                                setPurchasingSeriesId(seriesItem.id);
                              }}
                              className="bg-[#B8A99C] text-white px-4 py-2 rounded-lg hover:bg-[#D5C4B7] transition-colors text-sm font-medium"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              רכישה
                            </motion.button>
                          )}
                          
                          {/* Gift button - always show (even if user already purchased) */}
                          <motion.button
                            onClick={() => {
                              if (!session) {
                                router.push(`/series/register?returnUrl=${encodeURIComponent(window.location.pathname)}`);
                                return;
                              }
                              setGiftSeriesId(seriesItem.id);
                              setPurchasingSeriesId(null);
                            }}
                            className="bg-[#D9713C] text-white px-3 py-2 rounded-lg hover:bg-[#D9713C]/80 transition-colors text-sm font-bold"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            title="קנה כמתנה"
                          >
                            🎁
                          </motion.button>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Gift Purchase Form */}
                  {giftSeriesId === seriesItem.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 pt-4 border-t border-[#D9713C]/30"
                    >
                      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-[#D9713C]/20">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xl">🎁</span>
                          <h4 className="text-base font-bold text-[#2D3142]">שלח כמתנה</h4>
                        </div>
                        <div className="space-y-2">
                          <input
                            type="email"
                            value={giftForm.recipientEmail}
                            onChange={(e) => setGiftForm({...giftForm, recipientEmail: e.target.value})}
                            className="w-full p-2 border border-[#D5C4B7]/30 rounded-lg bg-white/80 text-sm"
                            placeholder="אימייל המקבל/ת *"
                          />
                          <input
                            type="text"
                            value={giftForm.recipientName}
                            onChange={(e) => setGiftForm({...giftForm, recipientName: e.target.value})}
                            className="w-full p-2 border border-[#D5C4B7]/30 rounded-lg bg-white/80 text-sm"
                            placeholder="שם המקבל/ת (אופציונלי)"
                          />
                          <textarea
                            value={giftForm.giftMessage}
                            onChange={(e) => setGiftForm({...giftForm, giftMessage: e.target.value})}
                            className="w-full p-2 border border-[#D5C4B7]/30 rounded-lg bg-white/80 text-sm resize-none"
                            rows={2}
                            placeholder="הודעה אישית (אופציונלי)"
                          />
                        </div>
                        {giftForm.recipientEmail && !giftConfirmed && (
                          <div className="mt-3">
                            <button
                              onClick={() => {
                                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                                if (!emailRegex.test(giftForm.recipientEmail)) {
                                  toast.error('כתובת אימייל לא תקינה');
                                  return;
                                }
                                if (giftForm.recipientEmail.toLowerCase().trim() === session?.user?.email?.toLowerCase().trim()) {
                                  toast.error('לא ניתן לשלוח מתנה לעצמך');
                                  return;
                                }
                                setGiftConfirmed(true);
                              }}
                              className="w-full bg-[#D9713C] text-white py-2 rounded-lg font-bold text-sm hover:bg-[#D9713C]/90 transition-colors"
                            >
                              אישור ומעבר לתשלום
                            </button>
                          </div>
                        )}
                        {giftConfirmed && (
                          <div className="mt-3">
                            <div className="bg-white/60 rounded-lg p-2.5 mb-3 border border-[#D9713C]/20">
                              <p className="text-xs text-[#5D5D5D] mb-0.5">שולח מתנה ל:</p>
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
                                style={{ color: "gold", shape: "pill", height: 35, label: "pay" }}
                                createOrder={(data, actions) => {
                                  const chargePrice = getDisplayPrice(seriesItem);
                                  return actions.order.create({
                                    purchase_units: [{ amount: { value: chargePrice.toString(), currency_code: "ILS" }, description: `מתנה: ${seriesItem.title}` }],
                                    intent: "CAPTURE"
                                  });
                                }}
                                onApprove={(data, actions) => {
                                  const chargePrice = getDisplayPrice(seriesItem);
                                  return actions.order!.capture().then((details) => {
                                    handleGiftPurchaseComplete(seriesItem.id, data.orderID, details.payer?.payer_id || "", chargePrice);
                                  });
                                }}
                                onError={(err) => { console.error('PayPal gift error:', err); toast.error('שגיאה בתשלום'); }}
                              />
                            </PayPalScriptProvider>
                          </div>
                        )}
                        <button
                          onClick={() => { setGiftSeriesId(null); setGiftForm({ recipientEmail: '', recipientName: '', giftMessage: '' }); setGiftConfirmed(false); }}
                          className="mt-2 text-sm text-[#5D5D5D] hover:text-[#2D3142] transition-colors w-full text-center"
                        >
                          ביטול
                        </button>
                      </div>
                    </motion.div>
                  )}

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
                            const chargePrice = getDisplayPrice(seriesItem);
                            return actions.order.create({
                              purchase_units: [{
                                amount: {
                                  value: chargePrice.toString(),
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
                                    .slice(-3)
                                    .reverse();
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
