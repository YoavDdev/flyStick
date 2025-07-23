"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { FaTimes, FaHeart } from "react-icons/fa";

interface WelcomePopupProps {
  className?: string;
}

const WelcomePopup = ({ className = "" }: WelcomePopupProps) => {
  const { data: session } = useSession();
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkWelcomeStatus = async () => {
      if (!session?.user?.email) {
        setIsLoading(false);
        return;
      }

      try {
        // Check if user should see welcome popup
        const response = await fetch("/api/user/welcome-status");
        if (response.ok) {
          const data = await response.json();
          setShowPopup(!data.hasSeenWelcomeMessage);
        }
      } catch (error) {
        console.error("Error checking welcome status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkWelcomeStatus();
  }, [session]);

  const handleClosePopup = async () => {
    try {
      // Mark welcome message as seen
      const response = await fetch("/api/user/welcome-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setShowPopup(false);
      }
    } catch (error) {
      console.error("Error marking welcome as seen:", error);
      // Close popup anyway to avoid blocking user
      setShowPopup(false);
    }
  };

  if (isLoading || !showPopup) {
    return null;
  }

  return (
    <div className={`fixed inset-0 z-[10000] flex items-center justify-center p-4 ${className}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClosePopup}
      />
      
      {/* Popup Content */}
      <div className="relative bg-[#F7F3EB] border-2 border-[#D5C4B7] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#D5C4B7]/30">
          <div className="flex items-center gap-3">
            <FaHeart className="text-[#D5C4B7] text-2xl" />
            <h2 className="text-2xl font-bold text-[#2D3142] text-right">
              ברוכים הבאים לסטודיו שלי!
            </h2>
          </div>
          <button
            onClick={handleClosePopup}
            className="text-[#3D3D3D] hover:text-[#2D3142] transition-colors p-2 hover:bg-[#D5C4B7]/20 rounded-full"
            aria-label="סגור"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-right leading-relaxed">
          <div className="space-y-4 text-[#3D3D3D]">
            <p>
              זהו, אתם מנויים ואני מאד שמח בשבילכם כי הסטודיו הוא סיכום הדרך הייחודית שבניתי מהחוויה האישית שלי ומשלל עצום של תובנות שקיבלתי וממשיכות להגיע וארזתי הכל לשיטות חדשניות הנגישות לכל אדם הרוצה להכיר את גופו ותודעתו.
            </p>
            
            <p>
              הצעד הזה מסמן התחלה של מסע- תנועתי, גופני, אישי, רגשי ותודעתי. מסע שבו תלמדו להכיר את הגוף לעומק, לפתח מודעות סומאטית תחושתית, לנשום בתלת מימד ולנוע מתוך הקשבה. כל זאת בשפה פשוטה ונגישה שנוצרה מעבודת השטח לאורך השנים כשאני פוגש מאות אנשים בשבוע.
            </p>
            
            <p>
              אני מאמין שכל אדם- בכל גיל ובכל שלב- יכול לגלות את העוצמה, הריפוי והחיוניות שטמונים בגופו ורוחו.
            </p>
            
            <p>
              הסטודיו הזה הוא פרוייקט חיים והוא משלב אינספור רעיונות ותובנות שיעזרו לכם לצלול למרחבים בהם ביקרתי. הסטודיו מציע לכם מסלולים שונים של הכשרה, שיעורים במבנים שונים, טכניקות רבות ועוד.
            </p>
            
            <p>
              קחו את הזמן. אל תמהרו. תתחילו בקטן ותמשיכו. תהיו בהקשבה. זה לא מרתון. הגוף הוא חליפה גלקטית שמביעה את הלך רוחנו ולכן כל תנועה תביא סיפור ששווה לראות ולהרגיש.
            </p>
            
            <p>
              זה כמו ריקוד, סימכו על הגוף ותנו לו גם להוביל, בלב פתוח וכוונה מדויקת.
            </p>
            
            <p className="font-semibold">
              אני מאחל לכם לא פחות מהתאהבות.
            </p>
            
            <p>
              לא בי אלא בהיותכם, בקיומכם ושתתרגשו כל יום מחווית החיים דרך הסטודיו המופלא הזה שכולו אהבה וריפוי. ממש כמו הגוף.
            </p>
            
            <p>
              אני מאחל לכם התחלה נעימה, שהות מסקרנת ופליאה, הרבה פליאה פנימית.
            </p>
            
            <div className="bg-[#D5C4B7]/20 rounded-lg p-4 mt-6">
              <p className="text-sm">
                שימו לב כי בתחתית האתר תמצאו את המדריך השימושי לאתר בו תוכלו לקבל הסברים כיצד להשתמש באתר ולהבין כיצד הוא בנוי.
              </p>
            </div>
            
            <div className="text-center mt-6">
              <p className="font-bold text-[#2D3142]">שלכם, בועז.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#D5C4B7]/30 text-center">
          <button
            onClick={handleClosePopup}
            className="bg-[#D5C4B7] hover:bg-[#B8A99C] text-[#2D3142] px-8 py-3 rounded-lg font-medium transition-colors shadow-sm hover:shadow-md"
          >
            התחל את המסע שלך
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomePopup;
