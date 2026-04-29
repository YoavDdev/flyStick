"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

const HEBREW_DAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
const HEBREW_MONTHS = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];

function formatDateTime(date: Date) {
  const day = HEBREW_DAYS[date.getDay()];
  const dateNum = date.getDate();
  const month = HEBREW_MONTHS[date.getMonth()];
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `יום ${day}, ${dateNum} ${month} בשעה ${hours}:${minutes}`;
}

interface Registration {
  id: string;
  eventId: string;
  wantsEmailUpdates: boolean;
  event: {
    id: string;
    title: string;
    description: string | null;
    scheduledAt: string;
    status: string;
  };
}

export default function LiveNotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.email) {
      fetchRegistrations();
    }
  }, [session]);

  const fetchRegistrations = async () => {
    try {
      const res = await fetch(`/api/live-events/my-registrations?email=${session?.user?.email}`);
      const data = await res.json();
      if (data.success) {
        setRegistrations(data.registrations);
      }
    } catch (error) {
      console.error("Error fetching registrations:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleEmailUpdates = async (registrationId: string, currentValue: boolean) => {
    setUpdating(registrationId);
    try {
      const res = await fetch("/api/live-events/update-notification-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId,
          wantsEmailUpdates: !currentValue,
        }),
      });

      if (res.ok) {
        setRegistrations((prev) =>
          prev.map((reg) =>
            reg.id === registrationId
              ? { ...reg, wantsEmailUpdates: !currentValue }
              : reg
          )
        );
      }
    } catch (error) {
      console.error("Error updating preference:", error);
    } finally {
      setUpdating(null);
    }
  };

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

  const upcomingRegistrations = registrations.filter(
    (r) => r.event.status === "scheduled" && new Date(r.event.scheduledAt) > new Date()
  );
  const pastRegistrations = registrations.filter(
    (r) => r.event.status === "ended" || new Date(r.event.scheduledAt) <= new Date()
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F7F3EB] to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
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
            העדפות עדכוני מייל
          </h1>
          <p className="text-[#5D5D5D]">
            נהל את העדכונים שתרצה לקבל על השיעורים החיים שלך
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-gradient-to-r from-[#FFF9F0] to-[#F7F3EB] border-2 border-dashed border-[#D5C4B7] rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-[#B56B4A] to-[#9a5a3d] rounded-full flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-[#2D3142] mb-2">
                מה זה עדכוני מייל?
              </h3>
              <p className="text-sm text-[#5D5D5D] leading-relaxed">
                כשתפעיל עדכונים לשיעור, נשלח לך מייל אם יהיו שינויים - שינוי שעה, דחייה למועד אחר, או ביטול (חלילה!). 
                כך תמיד תהיה מעודכן ולא תפספס שיעור.
              </p>
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        {upcomingRegistrations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#2D3142] mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-[#B56B4A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              שיעורים קרובים ({upcomingRegistrations.length})
            </h2>
            <div className="space-y-4">
              {upcomingRegistrations.map((reg) => (
                <div
                  key={reg.id}
                  className="bg-white rounded-2xl border border-[#D5C4B7]/30 shadow-md hover:shadow-lg transition-all overflow-hidden"
                >
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-[#2D3142] mb-2">
                          {reg.event.title}
                        </h3>
                        {reg.event.description && (
                          <p className="text-sm text-[#5D5D5D] mb-2">
                            {reg.event.description}
                          </p>
                        )}
                        <p className="text-sm text-[#B56B4A] font-medium">
                          📅 {formatDateTime(new Date(reg.event.scheduledAt))}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <button
                          onClick={() => toggleEmailUpdates(reg.id, reg.wantsEmailUpdates)}
                          disabled={updating === reg.id}
                          className={`relative inline-flex h-12 w-24 items-center rounded-full transition-all duration-300 ${
                            reg.wantsEmailUpdates
                              ? "bg-gradient-to-r from-[#B56B4A] to-[#9a5a3d]"
                              : "bg-gray-300"
                          } ${updating === reg.id ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                        >
                          <span
                            className={`inline-block h-10 w-10 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                              reg.wantsEmailUpdates ? "translate-x-12" : "translate-x-1"
                            }`}
                          >
                            {updating === reg.id ? (
                              <div className="flex items-center justify-center h-full">
                                <div className="w-4 h-4 border-2 border-[#B56B4A] border-t-transparent rounded-full animate-spin"></div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                {reg.wantsEmailUpdates ? (
                                  <svg className="w-5 h-5 text-[#B56B4A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                ) : (
                                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                )}
                              </div>
                            )}
                          </span>
                        </button>
                        <p className="text-xs text-center mt-2 text-[#5D5D5D]">
                          {reg.wantsEmailUpdates ? "מקבל עדכונים" : "לא מקבל עדכונים"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Past Events */}
        {pastRegistrations.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-[#2D3142] mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-[#9D8E81]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              שיעורים שהסתיימו ({pastRegistrations.length})
            </h2>
            <div className="space-y-4">
              {pastRegistrations.map((reg) => (
                <div
                  key={reg.id}
                  className="bg-white/50 rounded-2xl border border-[#D5C4B7]/20 p-5 sm:p-6 opacity-60"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-[#2D3142] mb-1">
                        {reg.event.title}
                      </h3>
                      <p className="text-sm text-[#9D8E81]">
                        📅 {formatDateTime(new Date(reg.event.scheduledAt))}
                      </p>
                    </div>
                    <span className="text-xs text-[#9D8E81] bg-[#F7F3EB] px-3 py-1.5 rounded-full">
                      הסתיים
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {registrations.length === 0 && (
          <div className="bg-white rounded-2xl border border-[#D5C4B7]/30 p-12 text-center">
            <div className="w-20 h-20 bg-[#F7F3EB] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-[#D5C4B7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#2D3142] mb-2">
              עדיין לא נרשמת לשיעורים
            </h3>
            <p className="text-[#5D5D5D] mb-6">
              כשתירשם לשיעור חי, תוכל לנהל כאן את העדכונים שתרצה לקבל
            </p>
            <Link
              href="/live"
              className="inline-block bg-gradient-to-r from-[#B56B4A] to-[#9a5a3d] text-white px-8 py-3 rounded-full font-bold hover:shadow-lg transition-all"
            >
              לדף השידורים החיים
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
