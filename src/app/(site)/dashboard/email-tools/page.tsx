"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import EmailSystemChecker from "@/app/components/EmailSystemChecker";
import EmailLogsViewer from "@/app/components/EmailLogsViewer";

export default function EmailToolsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!session?.user?.email) return;
      
      try {
        const res = await fetch("/api/check-admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: session.user.email }),
        });
        const data = await res.json();
        setIsAdmin(data.isAdmin === true);
      } catch (error) {
        console.error("Error checking admin status:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.email) {
      checkAdmin();
    }
  }, [session]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F7F3EB] to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#D5C4B7] border-t-[#B56B4A] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#5D5D5D]">טוען...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F7F3EB] to-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#2D3142] mb-2">גישה מוגבלת</h1>
          <p className="text-[#5D5D5D] mb-6">עמוד זה זמין למנהלים בלבד</p>
          <Link
            href="/dashboard"
            className="inline-block bg-gradient-to-r from-[#B56B4A] to-[#9a5a3d] text-white px-6 py-3 rounded-full font-bold hover:shadow-lg transition-all"
          >
            חזרה לדשבורד
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F7F3EB] to-white py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-[#B56B4A] hover:text-[#9a5a3d] transition-colors mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            חזרה לדשבורד
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#2D3142] mb-2">
            כלי בדיקת מיילים
          </h1>
          <p className="text-[#5D5D5D]">
            בדוק את מערכת המיילים וצפה בלוגים
          </p>
        </div>

        {/* Email System Checker */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-[#D5C4B7]/30 shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#B56B4A] to-[#9a5a3d] flex items-center justify-center shadow-md">
              <span className="text-2xl">🔍</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#2D3142]">בדיקת מערכת מיילים</h2>
              <p className="text-sm text-[#5D5D5D]">בדוק אם Resend עובד תקין</p>
            </div>
          </div>
          <EmailSystemChecker />
        </div>

        {/* Email Logs Viewer */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-[#D5C4B7]/30 shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#B56B4A] to-[#9a5a3d] flex items-center justify-center shadow-md">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#2D3142]">לוג מיילים</h2>
              <p className="text-sm text-[#5D5D5D]">צפה במיילים שנשלחו ונכשלו</p>
            </div>
          </div>
          <EmailLogsViewer />
        </div>
      </div>
    </div>
  );
}
