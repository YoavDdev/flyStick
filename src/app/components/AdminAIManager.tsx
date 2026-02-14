"use client";

import React, { useState, useEffect } from "react";

const AdminAIManager = () => {
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/ai-settings");
        const data = await res.json();
        if (data.success) {
          setEnabled(data.enabled);
        }
      } catch (error) {
        console.error("Error fetching AI settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const toggleEnabled = async () => {
    setSaving(true);
    const newValue = !enabled;
    try {
      const res = await fetch("/api/admin/ai-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: newValue }),
      });
      const data = await res.json();
      if (data.success) {
        setEnabled(newValue);
        setMessage({
          text: newValue ? "העוזר החכם הופעל!" : "העוזר החכם כובה",
          type: "success",
        });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch {
      setMessage({ text: "שגיאה בעדכון", type: "error" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border-2 border-[#D5C4B7] rounded-xl overflow-hidden" dir="rtl">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 sm:p-6 cursor-pointer hover:bg-[#F7F3EB]/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <div className="bg-purple-100 p-3 rounded-full">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#2D3142]">עוזר AI חכם</h3>
            <p className="text-sm text-[#2D3142]/60">
              {loading ? "טוען..." : enabled ? "🟢 פעיל" : "🔴 כבוי"}
            </p>
          </div>
        </div>
        <svg
          className={`w-6 h-6 text-[#2D3142] transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-[#D5C4B7] p-4 sm:p-6">
          {/* Message toast */}
          {message && (
            <div
              className={`mb-4 p-3 rounded-lg text-center text-sm font-medium ${
                message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Toggle */}
          <div className="flex items-center justify-between bg-[#F7F3EB] rounded-xl p-4 mb-6 border border-[#D5C4B7]/30">
            <div>
              <p className="font-bold text-[#2D3142]">הפעלת העוזר החכם</p>
              <p className="text-sm text-[#5D5D5D]">
                {enabled ? "המשתמשים יכולים לשוחח עם העוזר" : "העוזר מוסתר מהמשתמשים"}
              </p>
            </div>
            <button
              onClick={toggleEnabled}
              disabled={saving || loading}
              className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
                enabled ? "bg-green-500" : "bg-gray-300"
              } ${saving ? "opacity-50" : ""}`}
            >
              <div
                className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${
                  enabled ? "right-0.5" : "right-[calc(100%-1.625rem)]"
                }`}
              />
            </button>
          </div>

          {/* How it works */}
          <div className="space-y-4">
            <h4 className="font-bold text-[#2D3142] text-lg">איך העוזר עובד?</h4>

            <div className="bg-[#F7F3EB] rounded-xl p-4 border border-[#D5C4B7]/30">
              <div className="flex items-start gap-3 mb-3">
                <div className="bg-blue-100 p-2 rounded-full flex-shrink-0 mt-0.5">
                  <span className="text-sm">📁</span>
                </div>
                <div>
                  <p className="font-medium text-[#2D3142] text-sm">שלב 1 — טעינת קטלוג סרטונים</p>
                  <p className="text-xs text-[#5D5D5D] mt-1">
                    העוזר טוען את כל הסרטונים מ-Vimeo (שמות, תיאורים, תיקיות, רמות קושי, משך) ושומר אותם בזיכרון לשעה.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 mb-3">
                <div className="bg-purple-100 p-2 rounded-full flex-shrink-0 mt-0.5">
                  <span className="text-sm">🧠</span>
                </div>
                <div>
                  <p className="font-medium text-[#2D3142] text-sm">שלב 2 — הבנת הבקשה</p>
                  <p className="text-xs text-[#5D5D5D] mt-1">
                    כשמשתמש כותב הודעה (למשל &quot;כואב לי הגב&quot;), GPT-4o-mini מבין את הכוונה ומחפש סרטונים רלוונטיים מתוך הקטלוג.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 mb-3">
                <div className="bg-green-100 p-2 rounded-full flex-shrink-0 mt-0.5">
                  <span className="text-sm">💬</span>
                </div>
                <div>
                  <p className="font-medium text-[#2D3142] text-sm">שלב 3 — המלצה מותאמת</p>
                  <p className="text-xs text-[#5D5D5D] mt-1">
                    העוזר מחזיר תשובה בעברית עם שמות הסרטונים, משך, ובאיזו תיקיה למצוא אותם.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-amber-100 p-2 rounded-full flex-shrink-0 mt-0.5">
                  <span className="text-sm">🔒</span>
                </div>
                <div>
                  <p className="font-medium text-[#2D3142] text-sm">אבטחה ומגבלות</p>
                  <p className="text-xs text-[#5D5D5D] mt-1">
                    העוזר עונה רק על שאלות שקשורות לאתר ולאימונים. הוא לא משתף מידע רגיש ולא עונה על נושאים לא קשורים.
                  </p>
                </div>
              </div>
            </div>

            {/* Cost info */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <h5 className="font-bold text-blue-800 text-sm mb-2">💰 עלויות</h5>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• מודל: <strong>GPT-4o-mini</strong> (הכי חסכוני ומהיר)</li>
                <li>• עלות משוערת: <strong>~$0.15 לכל 1,000 הודעות</strong></li>
                <li>• קטלוג הסרטונים נטען פעם בשעה (לא בכל הודעה)</li>
                <li>• היסטוריית שיחה מוגבלת ל-10 הודעות אחרונות</li>
              </ul>
            </div>

            {/* Tips */}
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <h5 className="font-bold text-amber-800 text-sm mb-2">💡 טיפים</h5>
              <ul className="text-xs text-amber-700 space-y-1">
                <li>• העוזר מופיע ככפתור צ׳אט צף בפינה השמאלית התחתונה</li>
                <li>• הוא זמין בכל עמודי האתר</li>
                <li>• כשמכבים אותו, הכפתור נעלם לגמרי מהאתר</li>
                <li>• סרטונים חדשים שעולים ל-Vimeo ייכנסו לקטלוג תוך שעה</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAIManager;
