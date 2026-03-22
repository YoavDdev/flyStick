'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface PendingGift {
  id: string;
  seriesId: string;
  recipientEmail: string;
  recipientName: string | null;
  senderEmail: string;
  senderName: string;
  giftMessage: string | null;
  paypalOrderId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  series: {
    title: string;
  };
}

interface CompletedGift {
  id: string;
  seriesId: string;
  giftSenderEmail: string | null;
  giftSenderName: string | null;
  giftRecipientName: string | null;
  giftMessage: string | null;
  paypalOrderId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  giftClaimedAt: string | null;
  series: {
    title: string;
  };
  user: {
    email: string;
    name: string | null;
  };
}

export default function GiftPurchasesAdmin() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [pendingGifts, setPendingGifts] = useState<PendingGift[]>([]);
  const [completedGifts, setCompletedGifts] = useState<CompletedGift[]>([]);
  const [search, setSearch] = useState('');
  const [resendingId, setResendingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchGiftPurchases();
    }
  }, [status, search]);

  const fetchGiftPurchases = async () => {
    try {
      const url = search 
        ? `/api/admin/gift-purchases?search=${encodeURIComponent(search)}`
        : '/api/admin/gift-purchases';
      
      const response = await fetch(url);
      
      if (response.status === 403) {
        toast.error('אין הרשאת גישה');
        router.push('/dashboard');
        return;
      }

      const data = await response.json();
      setPendingGifts(data.pendingGifts || []);
      setCompletedGifts(data.completedGifts || []);
    } catch (error) {
      console.error('Error fetching gift purchases:', error);
      toast.error('שגיאה בטעינת נתונים');
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async (giftId: string, type: 'pending' | 'completed') => {
    setResendingId(giftId);
    try {
      const response = await fetch('/api/admin/gift-purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ giftId, type })
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success(data.message || 'המייל נשלח מחדש בהצלחה');
      } else {
        toast.error(data.error || 'שגיאה בשליחת המייל');
      }
    } catch (error) {
      console.error('Error resending email:', error);
      toast.error('שגיאה בשליחת המייל');
    } finally {
      setResendingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F3EB] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#D5C4B7] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#2D3142] text-lg">טוען...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F3EB] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-[#2D3142] mb-2">🎁 ניהול רכישות מתנה</h1>
          <p className="text-[#2D3142]/70">מעקב אחרי כל המתנות שנרכשו באתר</p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חיפוש לפי מייל או שם..."
            className="w-full max-w-md px-4 py-3 rounded-xl border-2 border-[#D5C4B7] focus:border-[#B8A99C] focus:outline-none bg-white text-[#2D3142]"
          />
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <div className="bg-white rounded-xl p-6 shadow-md border-2 border-[#D5C4B7]">
            <div className="text-3xl font-bold text-[#D5C4B7] mb-1">{pendingGifts.length}</div>
            <div className="text-[#2D3142]/70 text-sm">מתנות ממתינות לרישום</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border-2 border-[#B8A99C]">
            <div className="text-3xl font-bold text-[#B8A99C] mb-1">{completedGifts.length}</div>
            <div className="text-[#2D3142]/70 text-sm">מתנות שנמסרו בהצלחה</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border-2 border-[#2D3142]">
            <div className="text-3xl font-bold text-[#2D3142] mb-1">{pendingGifts.length + completedGifts.length}</div>
            <div className="text-[#2D3142]/70 text-sm">סה"כ מתנות</div>
          </div>
        </motion.div>

        {/* Pending Gifts */}
        {pendingGifts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-[#2D3142] mb-4">⏳ מתנות ממתינות ({pendingGifts.length})</h2>
            <div className="space-y-4">
              {pendingGifts.map((gift) => (
                <div key={gift.id} className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-6 shadow-md border-2 border-orange-200">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="text-xl font-bold text-[#2D3142]">{gift.series.title}</h3>
                        <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">ממתין</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-[#2D3142]/60 mb-1">👤 שולח/ת:</p>
                          <p className="font-bold text-[#2D3142]">{gift.senderName}</p>
                          <p className="text-sm text-[#2D3142]/70">{gift.senderEmail}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#2D3142]/60 mb-1">🎁 מקבל/ת:</p>
                          <p className="font-bold text-[#2D3142]">{gift.recipientName || gift.recipientEmail}</p>
                          <p className="text-sm text-[#2D3142]/70">{gift.recipientEmail}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-[#2D3142]/70">
                        <div>💰 <span className="font-bold">₪{gift.amount}</span></div>
                        <div>📅 {new Date(gift.createdAt).toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                        <div className="text-xs">PayPal: {gift.paypalOrderId}</div>
                      </div>

                      {gift.giftMessage && (
                        <div className="mt-3 bg-white/60 rounded-lg p-3 border border-orange-200">
                          <p className="text-xs text-[#2D3142]/60 mb-1">💌 הודעה:</p>
                          <p className="text-sm italic text-[#2D3142]">"{gift.giftMessage}"</p>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleResendEmail(gift.id, 'pending')}
                      disabled={resendingId === gift.id}
                      className="bg-gradient-to-r from-[#D5C4B7] to-[#B8A99C] text-white px-6 py-2.5 rounded-lg font-bold hover:from-[#B8A99C] hover:to-[#D5C4B7] transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {resendingId === gift.id ? '📧 שולח...' : '📧 שלח מייל מחדש'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Completed Gifts */}
        {completedGifts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-[#2D3142] mb-4">✅ מתנות שנמסרו ({completedGifts.length})</h2>
            <div className="space-y-4">
              {completedGifts.map((gift) => (
                <div key={gift.id} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 shadow-md border-2 border-green-200">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="text-xl font-bold text-[#2D3142]">{gift.series.title}</h3>
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">נמסר</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-[#2D3142]/60 mb-1">👤 שולח/ת:</p>
                          <p className="font-bold text-[#2D3142]">{gift.giftSenderName || 'לא ידוע'}</p>
                          <p className="text-sm text-[#2D3142]/70">{gift.giftSenderEmail || 'לא ידוע'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#2D3142]/60 mb-1">🎁 מקבל/ת:</p>
                          <p className="font-bold text-[#2D3142]">{gift.user.name || gift.user.email}</p>
                          <p className="text-sm text-[#2D3142]/70">{gift.user.email}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-[#2D3142]/70">
                        <div>💰 <span className="font-bold">₪{gift.amount}</span></div>
                        <div>📅 נרכש: {new Date(gift.createdAt).toLocaleDateString('he-IL', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                        {gift.giftClaimedAt && (
                          <div>✅ נמסר: {new Date(gift.giftClaimedAt).toLocaleDateString('he-IL', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                        )}
                        <div className="text-xs">PayPal: {gift.paypalOrderId}</div>
                      </div>

                      {gift.giftMessage && (
                        <div className="mt-3 bg-white/60 rounded-lg p-3 border border-green-200">
                          <p className="text-xs text-[#2D3142]/60 mb-1">💌 הודעה:</p>
                          <p className="text-sm italic text-[#2D3142]">"{gift.giftMessage}"</p>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleResendEmail(gift.id, 'completed')}
                      disabled={resendingId === gift.id}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2.5 rounded-lg font-bold hover:from-emerald-500 hover:to-green-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {resendingId === gift.id ? '📧 שולח...' : '📧 שלח מייל מחדש'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {pendingGifts.length === 0 && completedGifts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🎁</div>
            <h3 className="text-2xl font-bold text-[#2D3142] mb-2">
              {search ? 'לא נמצאו תוצאות' : 'אין עדיין רכישות מתנה'}
            </h3>
            <p className="text-[#2D3142]/70">
              {search ? 'נסו לחפש משהו אחר' : 'כשמישהו ירכוש מתנה, זה יופיע כאן'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
