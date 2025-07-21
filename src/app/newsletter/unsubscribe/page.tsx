"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already_unsubscribed'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleUnsubscribe = async () => {
      if (!token) {
        setStatus('error');
        setMessage('קישור ביטול מנוי לא תקין');
        return;
      }

      try {
        const response = await fetch(`/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}`);
        const data = await response.json();

        if (response.ok) {
          if (data.message === 'המנוי כבר בוטל בעבר') {
            setStatus('already_unsubscribed');
            setMessage('המנוי כבר בוטל בעבר');
          } else {
            setStatus('success');
            setMessage('המנוי בוטל בהצלחה');
          }
        } else {
          setStatus('error');
          setMessage(data.error || 'שגיאה בביטול המנוי');
        }
      } catch (error) {
        console.error('Unsubscribe error:', error);
        setStatus('error');
        setMessage('שגיאה בביטול המנוי. אנא נסה שוב מאוחר יותר.');
      }
    };

    handleUnsubscribe();
  }, [token]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen bg-[#F7F3EB] flex items-center justify-center p-4" style={{ direction: 'rtl' }}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center"
      >
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#D5C4B7] border-t-transparent mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-[#2D3142] mb-4">מבטל מנוי...</h1>
            <p className="text-[#3D3D3D]">אנא המתן בזמן שאנו מעבדים את הבקשה שלך</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h1 className="text-2xl font-bold text-[#2D3142] mb-4">המנוי בוטל בהצלחה</h1>
            <p className="text-[#3D3D3D] mb-6">
              המנוי שלך לניוזלטר של Studio Boaz בוטל בהצלחה.
            </p>
            <p className="text-[#3D3D3D] mb-6">
              אם תרצה להירשם שוב בעתיד, תמיד תוכל לעשות זאת דרך האתר שלנו.
            </p>
            <p className="text-[#3D3D3D] mb-8">
              תודה שהיית חלק מהקהילה שלנו!
            </p>
            <Link
              href="/"
              className="inline-block bg-[#D5C4B7] hover:bg-[#B8A99C] text-[#2D3142] py-3 px-6 rounded-lg transition-colors duration-200 font-medium"
            >
              חזרה לאתר
            </Link>
          </>
        )}

        {status === 'already_unsubscribed' && (
          <>
            <div className="text-yellow-500 text-6xl mb-4">⚠</div>
            <h1 className="text-2xl font-bold text-[#2D3142] mb-4">המנוי כבר בוטל</h1>
            <p className="text-[#3D3D3D] mb-6">
              המנוי שלך לניוזלטר כבר בוטל בעבר.
            </p>
            <p className="text-[#3D3D3D] mb-8">
              אם תרצה להירשם שוב, תוכל לעשות זאת דרך האתר שלנו.
            </p>
            <Link
              href="/"
              className="inline-block bg-[#D5C4B7] hover:bg-[#B8A99C] text-[#2D3142] py-3 px-6 rounded-lg transition-colors duration-200 font-medium"
            >
              חזרה לאתר
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-red-500 text-6xl mb-4">✗</div>
            <h1 className="text-2xl font-bold text-[#2D3142] mb-4">שגיאה בביטול המנוי</h1>
            <p className="text-[#3D3D3D] mb-6">{message}</p>
            <p className="text-[#3D3D3D] mb-8">
              אנא נסה שוב מאוחר יותר או צור קשר עמנו לקבלת עזרה.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-[#D5C4B7] hover:bg-[#B8A99C] text-[#2D3142] py-3 px-6 rounded-lg transition-colors duration-200 font-medium"
              >
                נסה שוב
              </button>
              <Link
                href="/"
                className="block bg-gray-200 hover:bg-gray-300 text-[#2D3142] py-3 px-6 rounded-lg transition-colors duration-200 font-medium"
              >
                חזרה לאתר
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
