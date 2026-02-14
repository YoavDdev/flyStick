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

            {/* AI Optimization Guide */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-5 border border-purple-200">
              <h5 className="font-bold text-purple-900 text-base mb-3">🎯 איך לגרום ל-AI להמליץ הכי טוב?</h5>
              <p className="text-xs text-purple-800 mb-4">
                העוזר קורא את המידע שאתה מזין ב-Vimeo ובלוח הבקרה. ככל שהמידע מדויק יותר — ההמלצות טובות יותר!
              </p>

              {/* Step 1: Video Names */}
              <div className="bg-white/70 rounded-lg p-3 mb-3 border border-purple-100">
                <p className="font-bold text-purple-900 text-sm mb-1">1️⃣ שמות סרטונים ב-Vimeo</p>
                <p className="text-xs text-purple-700 mb-2">
                  שם הסרטון הוא הדבר הראשון שהעוזר רואה. תן שמות ברורים בעברית שמתארים את התוכן.
                </p>
                <div className="bg-red-50 rounded p-2 mb-1.5 border border-red-200">
                  <p className="text-xs text-red-700">❌ <strong>לא טוב:</strong> &quot;שיעור 14&quot; / &quot;תרגול חדש&quot; / &quot;VID_20240301&quot;</p>
                </div>
                <div className="bg-green-50 rounded p-2 border border-green-200">
                  <p className="text-xs text-green-700">✅ <strong>מצוין:</strong> &quot;תרגול רך ונעים לגב התחתון&quot; / &quot;אימון קיר לחיזוק הרגליים&quot;</p>
                </div>
              </div>

              {/* Step 2: Video Descriptions */}
              <div className="bg-white/70 rounded-lg p-3 mb-3 border border-purple-100">
                <p className="font-bold text-purple-900 text-sm mb-1">2️⃣ תיאור סרטון ב-Vimeo (הכי חשוב!)</p>
                <p className="text-xs text-purple-700 mb-2">
                  כשמעלים סרטון ל-Vimeo, יש שדה &quot;Description&quot; (תיאור). העוזר קורא את זה כדי להבין למי הסרטון מתאים. כתוב 1-2 משפטים שכוללים:
                </p>
                <ul className="text-xs text-purple-700 space-y-1 mb-2 mr-3">
                  <li>• <strong>מה עושים בשיעור</strong> — מתיחות? חיזוק? נשימה? שילוב?</li>
                  <li>• <strong>למי זה מתאים</strong> — מתחילים? מתקדמים? כאבי גב? ישיבה ממושכת?</li>
                  <li>• <strong>אביזרים נדרשים</strong> — מקל? כסא? קיר? מזרן?</li>
                </ul>
                <div className="bg-green-50 rounded p-2 border border-green-200">
                  <p className="text-xs text-green-700">✅ <strong>דוגמה:</strong> &quot;תרגול עדין לגב התחתון. מתאים למתחילים ולמי שיושב הרבה. כולל מתיחות, עבודת נשימה ותנועה איטית על מזרן.&quot;</p>
                </div>
              </div>

              {/* Step 3: Folder Metadata */}
              <div className="bg-white/70 rounded-lg p-3 mb-3 border border-purple-100">
                <p className="font-bold text-purple-900 text-sm mb-1">3️⃣ מידע על תיקיות (בלוח הבקרה למעלה)</p>
                <p className="text-xs text-purple-700 mb-2">
                  ב&quot;ניהול תיקיות&quot; למעלה, ודא שלכל תיקיה יש:
                </p>
                <ul className="text-xs text-purple-700 space-y-1 mr-3">
                  <li>• <strong>תיאור</strong> — מה סוג השיעורים בתיקיה הזו?</li>
                  <li>• <strong>רמת קושי</strong> — מתחילים / בינוניים / מתקדמים</li>
                  <li>• <strong>קטגוריה</strong> — סוג האימון (פילאטיס, פלייסטיק, קיר...)</li>
                  <li>• <strong>תיקיה מוצגת</strong> — רק תיקיות שסומנו כ&quot;מוצגות&quot; מופיעות ל-AI</li>
                </ul>
              </div>

              {/* Summary */}
              <div className="bg-purple-100/50 rounded-lg p-3 border border-purple-200">
                <p className="font-bold text-purple-900 text-sm mb-1">⚡ סיכום — מה לעשות עכשיו?</p>
                <ol className="text-xs text-purple-800 space-y-1 mr-3 list-decimal">
                  <li>היכנס ל-<strong>Vimeo</strong> → לכל סרטון הוסף <strong>תיאור בעברית</strong> (1-2 משפטים)</li>
                  <li>ודא ש<strong>שמות הסרטונים</strong> ברורים ומתארים את התוכן</li>
                  <li>ב<strong>ניהול תיקיות</strong> למעלה, מלא תיאור + רמה + קטגוריה</li>
                  <li>העוזר <strong>מתעדכן אוטומטית</strong> תוך שעה מכל שינוי!</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAIManager;
