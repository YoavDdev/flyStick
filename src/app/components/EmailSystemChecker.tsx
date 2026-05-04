"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";

export default function EmailSystemChecker() {
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<any>(null);

  const checkEmailSystem = async () => {
    setChecking(true);
    try {
      const res = await fetch("/api/admin/check-email-status");
      const data = await res.json();
      
      if (data.success) {
        setResult(data);
        if (data.emailSystem.resendStatus === "Working") {
          toast.success("✅ מערכת המיילים עובדת תקין!");
        } else {
          toast.error("❌ יש בעיה במערכת המיילים!");
        }
      } else {
        toast.error("שגיאה בבדיקת המערכת");
      }
    } catch (error) {
      console.error("Error checking email system:", error);
      toast.error("שגיאה בבדיקת מערכת המיילים");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#D5C4B7]/30 p-6 shadow-md">
      <h3 className="text-xl font-bold text-[#2D3142] mb-4">
        🔍 בדיקת מערכת מיילים
      </h3>
      
      <p className="text-sm text-[#5D5D5D] mb-4">
        בדוק אם מערכת המיילים (Resend) עובדת תקין
      </p>

      <button
        onClick={checkEmailSystem}
        disabled={checking}
        className={`w-full bg-gradient-to-r from-[#B56B4A] to-[#9a5a3d] text-white px-6 py-3 rounded-lg font-bold transition-all ${
          checking ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg"
        }`}
      >
        {checking ? "בודק..." : "בדוק מערכת מיילים"}
      </button>

      {result && (
        <div className="mt-6 space-y-4">
          <div className="bg-[#F7F3EB] rounded-lg p-4">
            <h4 className="font-bold text-[#2D3142] mb-2">סטטוס מערכת:</h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#5D5D5D]">Resend API Key:</span>
                <span className={`font-bold ${result.emailSystem.hasResendKey ? "text-green-600" : "text-red-600"}`}>
                  {result.emailSystem.hasResendKey ? "✅ קיים" : "❌ חסר"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#5D5D5D]">אורך Key:</span>
                <span className="font-mono text-[#2D3142]">
                  {result.emailSystem.resendKeyLength} תווים
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#5D5D5D]">Key Prefix:</span>
                <span className="font-mono text-[#2D3142]">
                  {result.emailSystem.resendKeyPrefix}...
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#5D5D5D]">סטטוס Resend:</span>
                <span className={`font-bold ${
                  result.emailSystem.resendStatus === "Working" 
                    ? "text-green-600" 
                    : "text-red-600"
                }`}>
                  {result.emailSystem.resendStatus === "Working" ? "✅ עובד" : "❌ לא עובד"}
                </span>
              </div>

              {result.emailSystem.resendError && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-xs font-bold text-red-700 mb-1">שגיאה:</p>
                  <pre className="text-xs text-red-600 whitespace-pre-wrap">
                    {JSON.stringify(result.emailSystem.resendError, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#FFF9F0] rounded-lg p-4">
            <h4 className="font-bold text-[#2D3142] mb-2">סביבת עבודה:</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-[#5D5D5D]">NODE_ENV:</span>
                <span className="font-mono text-[#2D3142]">
                  {result.environment.nodeEnv}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5D5D5D]">NEXTAUTH_URL:</span>
                <span className="font-mono text-xs text-[#2D3142]">
                  {result.environment.nextAuthUrl}
                </span>
              </div>
            </div>
          </div>

          <div className="text-xs text-[#9D8E81] text-center">
            נבדק בתאריך: {new Date(result.timestamp).toLocaleString('he-IL')}
          </div>
        </div>
      )}

      {result?.emailSystem.resendStatus === "Working" && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700">
            ✅ <strong>מייל בדיקה נשלח אליך!</strong> בדוק את תיבת הדואר שלך (גם בספאם).
          </p>
        </div>
      )}

      {result?.emailSystem.resendStatus !== "Working" && result && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 mb-2">
            ❌ <strong>מערכת המיילים לא עובדת!</strong>
          </p>
          <p className="text-xs text-red-600">
            בדוק את ה-RESEND_API_KEY בקובץ .env.local
          </p>
        </div>
      )}
    </div>
  );
}
