"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { FaPaperPlane, FaTimes } from 'react-icons/fa';

interface NewsletterStats {
  totalSubscribers: number;
  activeSubscribers: number;
  unsubscribed: number;
  sources: { source: string; count: number }[];
}

const AdminNewsletterComposer = () => {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [link, setLink] = useState('');
  const [linkText, setLinkText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<NewsletterStats | null>(null);
  const [showSubscribers, setShowSubscribers] = useState(false);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Load newsletter statistics function
  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/send-newsletter');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to load newsletter stats:', error);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleSendNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim() || !content.trim()) {
      toast.error('נושא ותוכן הם שדות חובה');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/send-newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminEmail: session?.user?.email,
          subject: subject.trim(),
          content: content.trim(),
          link: link.trim() || undefined,
          linkText: linkText.trim() || undefined,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message);

        // Clear form
        setSubject('');
        setContent('');
        setLink('');
        setLinkText('');

        // Reload stats
        const statsResponse = await fetch('/api/admin/send-newsletter');
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }
      } else {
        toast.error(result.error || 'שגיאה בשליחת הניוזלטר');
      }
    } catch (error) {
      console.error('Newsletter sending error:', error);
      toast.error('שגיאה בשליחת הניוזלטר. אנא נסה שוב.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setSubject('');
    setContent('');
    setLink('');
    setLinkText('');
    setIsOpen(false);
  };

  const fetchSubscribers = async () => {
    if (!session?.user?.email) return;
    
    setLoadingSubscribers(true);
    try {
      const response = await fetch(`/api/admin/subscribers?adminEmail=${encodeURIComponent(session.user.email)}`);
      const data = await response.json();
      
      if (data.success) {
        setSubscribers(data.subscribers);
      } else {
        toast.error(data.error || 'שגיאה בטעינת רשימת המנויים');
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      toast.error('שגיאה בטעינת רשימת המנויים');
    } finally {
      setLoadingSubscribers(false);
    }
  };

  const removeSubscriber = async (subscriberId: string, email: string) => {
    if (!session?.user?.email) return;
    
    if (!confirm(`האם אתה בטוח שברצונך להסיר את ${email} מרשימת המנויים?`)) {
      return;
    }
    
    try {
      const response = await fetch('/api/admin/subscribers', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminEmail: session.user.email,
          subscriberId
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message);
        // Remove from local state
        setSubscribers(prev => prev.filter(sub => sub.id !== subscriberId));
        // Refresh stats
        loadStats();
      } else {
        toast.error(data.error || 'שגיאה בהסרת המנוי');
      }
    } catch (error) {
      console.error('Error removing subscriber:', error);
      toast.error('שגיאה בהסרת המנוי');
    }
  };

  const handleViewSubscribers = () => {
    setShowSubscribers(true);
    setSearchTerm(''); // Reset search when opening
    fetchSubscribers();
  };

  // Filter subscribers based on search term
  const filteredSubscribers = subscribers.filter(subscriber =>
    subscriber.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mb-6">
      {!isOpen ? (
        <motion.button
          onClick={() => setIsOpen(true)}
          className="bg-[#D5C4B7] hover:bg-[#B8A99C] text-[#2D3142] py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#D5C4B7]/30 flex items-center gap-2 font-medium"
          whileHover={{ y: -2 }}
          whileTap={{ y: 0 }}
        >
          <FaPaperPlane className="text-sm" />
          שליחת ניוזלטר
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#F7F3EB] border border-[#D5C4B7]/30 rounded-lg p-6 shadow-md"
          style={{ direction: 'rtl' }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-[#2D3142]">שליחת ניוזלטר</h3>
            <button
              onClick={handleCancel}
              className="text-[#3D3D3D] hover:text-[#2D3142] transition-colors"
            >
              <FaTimes />
            </button>
          </div>
      


      <form onSubmit={handleSendNewsletter} className="space-y-6">
        {/* Subject */}
        <div>
          <label htmlFor="newsletter-subject" className="block text-sm font-medium text-[#2D3142] mb-2">
            נושא הניוזלטר *
          </label>
          <input
            type="text"
            id="newsletter-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-4 py-3 border border-[#D5C4B7] rounded-lg focus:ring-2 focus:ring-[#B8A99C] focus:border-transparent"
            placeholder="הכנס נושא לניוזלטר..."
            required
          />
        </div>

        {/* Content */}
        <div>
          <label htmlFor="newsletter-content" className="block text-sm font-medium text-[#2D3142] mb-2">
            תוכן הניוזלטר *
          </label>
          <textarea
            id="newsletter-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="w-full px-4 py-3 border border-[#D5C4B7] rounded-lg focus:ring-2 focus:ring-[#B8A99C] focus:border-transparent resize-none"
            placeholder="כתוב את תוכן הניוזלטר כאן..."
            required
          />
        </div>

        {/* Optional Link */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="newsletter-link" className="block text-sm font-medium text-[#2D3142] mb-2">
              קישור (אופציונלי)
            </label>
            <input
              type="url"
              id="newsletter-link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full px-4 py-3 border border-[#D5C4B7] rounded-lg focus:ring-2 focus:ring-[#B8A99C] focus:border-transparent"
              placeholder="https://example.com"
            />
          </div>
          <div>
            <label htmlFor="newsletter-link-text" className="block text-sm font-medium text-[#2D3142] mb-2">
              טקסט הקישור (אופציונלי)
            </label>
            <input
              type="text"
              id="newsletter-link-text"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              className="w-full px-4 py-3 border border-[#D5C4B7] rounded-lg focus:ring-2 focus:ring-[#B8A99C] focus:border-transparent"
              placeholder="לחץ כאן"
            />
          </div>
        </div>

        {/* Send Button */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-[#D5C4B7] hover:bg-[#B8A99C] text-[#2D3142] py-2 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#D5C4B7]/30 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#2D3142] border-t-transparent"></div>
                שולח...
              </>
            ) : (
              <>
                <FaPaperPlane className="text-sm" />
                שלח ניוזלטר
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={handleViewSubscribers}
            className="bg-[#B8A99C] hover:bg-[#A89488] text-[#2D3142] py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#B8A99C]/30 font-medium flex items-center gap-2"
          >
            📋 רשימת מנויים
          </button>
        </div>

      </form>

      {/* Subscriber Count */}
      {stats && (
        <div className="mt-6 pt-6 border-t border-[#D5C4B7]">
          <div className="bg-[#F7F3EB] rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-[#2D3142]">{stats.activeSubscribers}</div>
            <div className="text-sm text-[#B8A99C]">מנויים פעילים</div>
          </div>
        </div>
      )}
        </motion.div>
      )}
      
      {/* Subscriber Management Modal */}
      {showSubscribers && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowSubscribers(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden"
            style={{ direction: 'rtl' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#2D3142]">רשימת מנויים לניוזלטר</h3>
              <button
                onClick={() => setShowSubscribers(false)}
                className="text-[#3D3D3D] hover:text-[#2D3142] transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            
            {/* Search Input */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="חיפוש לפי כתובת אימייל..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-[#D5C4B7] rounded-lg focus:ring-2 focus:ring-[#B8A99C] focus:border-transparent text-right"
              />
            </div>
            
            {loadingSubscribers ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#D5C4B7] border-t-transparent"></div>
                <span className="mr-3 text-[#3D3D3D]">טוען רשימת מנויים...</span>
              </div>
            ) : (
              <div className="overflow-y-auto max-h-[60vh]">
                {filteredSubscribers.length === 0 ? (
                  <p className="text-center text-[#3D3D3D] py-8">
                    {searchTerm ? 'לא נמצאו תוצאות עבור החיפוש' : 'אין מנויים כרגע'}
                  </p>
                ) : (
                  <>
                    <div className="mb-4 text-sm text-[#3D3D3D]">
                      {searchTerm ? (
                        <>נמצאו {filteredSubscribers.length} תוצאות מתוך {subscribers.length} מנויים</>
                      ) : (
                        <>סה"כ מנויים: {subscribers.length}</>
                      )}
                    </div>
                    <div className="space-y-2">
                      {filteredSubscribers.map((subscriber) => (
                        <div
                          key={subscriber.id}
                          className="flex items-center justify-between p-3 bg-[#F7F3EB] rounded-lg border border-[#D5C4B7]/30"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-[#2D3142]">{subscriber.email}</div>
                            <div className="text-sm text-[#3D3D3D]">
                              נרשם ב: {new Date(subscriber.subscribedAt).toLocaleDateString('he-IL')}
                              {subscriber.source && (
                                <span className="mr-2">
                                  | מקור: {subscriber.source === 'footer' ? 'פוטר' : 
                                          subscriber.source === 'registration' ? 'הרשמה' :
                                          subscriber.source === 'dashboard' ? 'דשבורד' : subscriber.source}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => removeSubscriber(subscriber.id, subscriber.email)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors duration-200"
                          >
                            הסר
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminNewsletterComposer;
