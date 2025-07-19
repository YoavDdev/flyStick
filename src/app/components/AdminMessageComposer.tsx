"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FaPaperPlane, FaLink, FaTimes } from "react-icons/fa";

interface AdminMessageComposerProps {
  onMessageSent?: () => void;
}

const AdminMessageComposer = ({ onMessageSent }: AdminMessageComposerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [link, setLink] = useState("");
  const [videoId, setVideoId] = useState("");
  
  const handleVideoIdChange = (value: string) => {
    setVideoId(value);
    if (value.trim()) {
      // Auto-generate the full link
      setLink(`https://www.studioboazonline.com/explore?video=${value.trim()}`);
    } else {
      setLink("");
    }
  };
  const [linkText, setLinkText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast.error("כותרת ותוכן הודעה נדרשים");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch("/api/admin/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          link: link.trim() || null,
          linkText: linkText.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "שגיאה בשליחת ההודעה");
      }

      toast.success("ההודעה נשלחה בהצלחה לכל המשתמשים!");
      
      // Reset form
      setTitle("");
      setContent("");
      setLink("");
      setLinkText("");
      setVideoId("");
      setIsOpen(false);
      
      if (onMessageSent) {
        onMessageSent();
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error instanceof Error ? error.message : "אירעה שגיאה בשליחת ההודעה");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setTitle("");
    setContent("");
    setLink("");
    setLinkText("");
    setVideoId("");
    setIsOpen(false);
  };

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
          שלח הודעה לכל המשתמשים
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#F7F3EB] border border-[#D5C4B7]/30 rounded-lg p-6 shadow-md"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-[#2D3142]">שלח הודעה חדשה</h3>
            <button
              onClick={handleCancel}
              className="text-[#3D3D3D] hover:text-[#2D3142] transition-colors"
            >
              <FaTimes />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-[#2D3142] mb-2">
                כותרת ההודעה *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="לדוגמה: סרטון חדש הועלה!"
                className="w-full p-3 border border-[#D5C4B7]/50 rounded-md text-right focus:outline-none focus:ring-2 focus:ring-[#D5C4B7]/30 bg-white"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-[#2D3142] mb-2">
                תוכן ההודעה *
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="כתוב כאן את תוכן ההודעה שתרצה לשלוח לכל המשתמשים..."
                rows={4}
                className="w-full p-3 border border-[#D5C4B7]/50 rounded-md text-right focus:outline-none focus:ring-2 focus:ring-[#D5C4B7]/30 bg-white resize-vertical"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="videoId" className="block text-sm font-medium text-[#2D3142] mb-2">
                  מזהה סרטון (אופציונלי) 🎬
                </label>
                <input
                  type="text"
                  id="videoId"
                  value={videoId}
                  onChange={(e) => handleVideoIdChange(e.target.value)}
                  placeholder="הדבק כאן מזהה סרטון מהעמוד הראשי"
                  className="w-full p-3 border border-[#D5C4B7]/50 rounded-md text-right focus:outline-none focus:ring-2 focus:ring-[#D5C4B7]/30 bg-white"
                  disabled={isLoading}
                />
                <div className="mt-2 text-xs text-[#3D3D3D]/70 bg-blue-50 p-2 rounded border-r-4 border-blue-300">
                  <p>💡 <strong>איך להשתמש:</strong></p>
                  <p>1. לך לעמוד הסרטונים</p>
                  <p>2. לחץ על הכפתור 📤 ליד הסרטון (רק למנהלים)</p>
                  <p>3. הדבק כאן את המזהה שהועתק</p>
                  <p>4. הקישור יווצר אוטומטית! ✨</p>
                </div>
              </div>
              
              {link && (
                <div>
                  <label htmlFor="generatedLink" className="block text-sm font-medium text-[#2D3142] mb-2">
                    קישור שנוצר אוטומטית ✅
                  </label>
                  <input
                    type="url"
                    id="generatedLink"
                    value={link}
                    readOnly
                    className="w-full p-3 border border-green-300 bg-green-50 rounded-md text-right focus:outline-none text-sm"
                  />
                </div>
              )}

              <div>
                <label htmlFor="linkText" className="block text-sm font-medium text-[#2D3142] mb-2">
                  טקסט הקישור (אופציונלי)
                </label>
                <input
                  type="text"
                  id="linkText"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="צפה בסרטון החדש"
                  className="w-full p-3 border border-[#D5C4B7]/50 rounded-md text-right focus:outline-none focus:ring-2 focus:ring-[#D5C4B7]/30 bg-white"
                  disabled={isLoading}
                />
              </div>
            </div>

            {link && (
              <div className="bg-[#D5C4B7]/20 p-3 rounded-md">
                <div className="flex items-center gap-2 text-[#2D3142]">
                  <FaLink className="text-sm" />
                  <span className="text-sm">תצוגה מקדימה של הקישור:</span>
                </div>
                <div className="mt-2">
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#B8A99C] hover:text-[#A09080] underline text-sm"
                  >
                    {linkText || link}
                  </a>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <motion.button
                type="submit"
                disabled={isLoading || !title.trim() || !content.trim()}
                className="bg-[#D5C4B7] hover:bg-[#B8A99C] disabled:bg-[#D5C4B7]/50 disabled:cursor-not-allowed text-[#2D3142] py-2 px-6 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#D5C4B7]/30 flex items-center gap-2"
                whileHover={!isLoading ? { y: -1 } : {}}
                whileTap={!isLoading ? { y: 0 } : {}}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#2D3142]"></div>
                    שולח...
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="text-sm" />
                    שלח הודעה
                  </>
                )}
              </motion.button>
              
              <motion.button
                type="button"
                onClick={async () => {
                  const confirmed = window.confirm(
                    "האם אתה בטוח שברצונך למחוק את כל ההודעות לכל המשתמשים?\n\nפעולה זו בלתי הפיכה!"
                  );
                  
                  if (!confirmed) return;
                  
                  try {
                    const { toast } = await import('react-hot-toast');
                    toast.loading('מוחק את כל ההודעות...');
                    
                    const response = await fetch('/api/admin/delete-all-messages', {
                      method: 'DELETE',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                    });
                    
                    const data = await response.json();
                    
                    if (response.ok) {
                      toast.dismiss();
                      toast.success(`נמחקו בהצלחה ${data.deletedMessages} הודעות ו-${data.deletedReads} קריאות!`);
                    } else {
                      toast.dismiss();
                      toast.error(data.error || 'שגיאה במחיקת ההודעות');
                    }
                  } catch (error) {
                    const { toast } = await import('react-hot-toast');
                    toast.dismiss();
                    toast.error('שגיאה במחיקת ההודעות');
                    console.error('Error deleting messages:', error);
                  }
                }}
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-600/30 flex items-center gap-2"
                whileHover={{ y: -1 }}
                whileTap={{ y: 0 }}
              >
                🗑️
              </motion.button>

              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="bg-[#3D3D3D]/10 hover:bg-[#3D3D3D]/20 disabled:bg-[#3D3D3D]/5 disabled:cursor-not-allowed text-[#2D3142] py-2 px-6 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#3D3D3D]/10"
              >
                ביטול
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
};

export default AdminMessageComposer;
