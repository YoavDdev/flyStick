"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FaPaperPlane, FaTimes, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const TEST_EMAIL = "yoavddev@gmail.com";

const AdminEmailTester = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{type: string; success: boolean; error?: string}[]>([]);

  const runTest = async (testType: string, fetchFn: () => Promise<Response>) => {
    try {
      const res = await fetchFn();
      const data = await res.json();
      if (res.ok) {
        setResults(prev => [...prev, { type: testType, success: true }]);
      } else {
        setResults(prev => [...prev, { type: testType, success: false, error: data.error || "Unknown error" }]);
      }
    } catch (err: any) {
      setResults(prev => [...prev, { type: testType, success: false, error: err.message }]);
    }
  };

  const handleRunAllTests = async () => {
    setIsLoading(true);
    setResults([]);

    // Test 1: Direct email send via Resend
    await runTest("שליחת אימייל ישיר (Resend)", () =>
      fetch("/api/admin/test-email-system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: "direct", email: TEST_EMAIL }),
      })
    );

    // Test 2: Message system email (like "send message to all users")
    await runTest("הודעת מערכת + אימייל (כמו 'שלח הודעה')", () =>
      fetch("/api/admin/test-email-system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: "message", email: TEST_EMAIL }),
      })
    );

    // Test 3: Newsletter-style email
    await runTest("ניוזלטר (תבנית ניוזלטר)", () =>
      fetch("/api/admin/test-email-system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: "newsletter", email: TEST_EMAIL }),
      })
    );

    setIsLoading(false);
    toast.success("כל הבדיקות הסתיימו - יש לבדוק את תיבת המייל!");
  };

  const handleSingleTest = async (testType: string) => {
    setIsLoading(true);
    setResults([]);

    await runTest(`בדיקה בודדת: ${testType}`, () =>
      fetch("/api/admin/test-email-system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: testType, email: TEST_EMAIL }),
      })
    );

    setIsLoading(false);
  };

  return (
    <div className="mb-6">
      {!isOpen ? (
        <motion.button
          onClick={() => setIsOpen(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 flex items-center gap-2 font-medium"
          whileHover={{ y: -2 }}
          whileTap={{ y: 0 }}
        >
          🧪 בדיקת מערכת אימיילים
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-6 shadow-md"
          style={{ direction: "rtl" }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-[#2D3142]">🧪 בדיקת מערכת אימיילים</h3>
            <button
              onClick={() => { setIsOpen(false); setResults([]); }}
              className="text-[#3D3D3D] hover:text-[#2D3142] transition-colors"
            >
              <FaTimes />
            </button>
          </div>

          <div className="bg-white rounded-lg p-4 mb-4 border border-blue-100">
            <p className="text-sm text-[#3D3D3D] mb-2">
              <strong>📧 כל האימיילים נשלחים רק אל:</strong> <code className="bg-gray-100 px-2 py-1 rounded text-blue-600">{TEST_EMAIL}</code>
            </p>
            <p className="text-xs text-[#3D3D3D]/70">
              מערכת הבדיקה בודקת 3 סוגי אימיילים: ישיר, הודעת מערכת, וניוזלטר. שום דבר לא נשלח למשתמשים אמיתיים.
            </p>
          </div>

          {/* Test buttons */}
          <div className="space-y-3 mb-4">
            <motion.button
              onClick={handleRunAllTests}
              disabled={isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-3 px-6 rounded-lg transition-colors duration-200 font-bold flex items-center justify-center gap-2"
              whileHover={!isLoading ? { y: -1 } : {}}
              whileTap={!isLoading ? { y: 0 } : {}}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  בודק...
                </>
              ) : (
                <>
                  <FaPaperPlane className="text-sm" />
                  🚀 הרץ את כל הבדיקות
                </>
              )}
            </motion.button>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleSingleTest("direct")}
                disabled={isLoading}
                className="bg-white border border-blue-200 hover:bg-blue-50 disabled:opacity-50 text-[#2D3142] py-2 px-3 rounded-lg transition-colors text-xs font-medium"
              >
                ✉️ אימייל ישיר
              </button>
              <button
                onClick={() => handleSingleTest("message")}
                disabled={isLoading}
                className="bg-white border border-blue-200 hover:bg-blue-50 disabled:opacity-50 text-[#2D3142] py-2 px-3 rounded-lg transition-colors text-xs font-medium"
              >
                📬 הודעת מערכת
              </button>
              <button
                onClick={() => handleSingleTest("newsletter")}
                disabled={isLoading}
                className="bg-white border border-blue-200 hover:bg-blue-50 disabled:opacity-50 text-[#2D3142] py-2 px-3 rounded-lg transition-colors text-xs font-medium"
              >
                📰 ניוזלטר
              </button>
            </div>
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-[#2D3142]">תוצאות:</h4>
              {results.map((r, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                    r.success
                      ? "bg-green-50 border border-green-200 text-green-800"
                      : "bg-red-50 border border-red-200 text-red-800"
                  }`}
                >
                  {r.success ? (
                    <FaCheckCircle className="text-green-500 flex-shrink-0" />
                  ) : (
                    <FaTimesCircle className="text-red-500 flex-shrink-0" />
                  )}
                  <div>
                    <span className="font-medium">{r.type}</span>
                    {r.error && <p className="text-xs mt-1 opacity-80">{r.error}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default AdminEmailTester;
