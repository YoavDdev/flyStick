"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

// Helper to format date in Hebrew
const formatHebrewDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
  const months = [
    "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
    "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
  ];
  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `יום ${dayName}, ${day} ב${month} בשעה ${hours}:${minutes}`;
};

// Countdown component
const Countdown = ({ targetDate }: { targetDate: string }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calcTime = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    calcTime();
    const interval = setInterval(calcTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const blocks = [
    { value: timeLeft.days, label: "ימים" },
    { value: timeLeft.hours, label: "שעות" },
    { value: timeLeft.minutes, label: "דקות" },
    { value: timeLeft.seconds, label: "שניות" },
  ];

  return (
    <div className="flex gap-3 sm:gap-5 justify-center" dir="rtl">
      {blocks.map((block, i) => (
        <div key={i} className="flex flex-col items-center">
          <div className="bg-white/80 backdrop-blur-sm border border-[#D5C4B7] rounded-xl w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shadow-md">
            <span className="text-2xl sm:text-3xl font-bold text-[#2D3142]">
              {block.value.toString().padStart(2, "0")}
            </span>
          </div>
          <span className="text-xs sm:text-sm text-[#5D5D5D] mt-2 font-medium">{block.label}</span>
        </div>
      ))}
    </div>
  );
};

// Live pulse indicator
const LivePulse = () => (
  <div className="flex items-center gap-2">
    <div className="relative">
      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
      <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
    </div>
    <span className="text-red-500 font-bold text-lg">שידור חי</span>
  </div>
);

const LiveStreamPage = () => {
  const { data: session } = useSession();
  const [stream, setStream] = useState<any>(null);
  const [streamState, setStreamState] = useState<string>("none");
  const [loading, setLoading] = useState(true);

  const fetchStreamData = useCallback(async () => {
    try {
      const res = await fetch("/api/live/current");
      const data = await res.json();
      if (data.success) {
        setStream(data.stream);
        setStreamState(data.streamState);
      }
    } catch (error) {
      console.error("Error fetching stream:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStreamData();
    // Poll every 30 seconds to check for status changes
    const interval = setInterval(fetchStreamData, 30000);
    return () => clearInterval(interval);
  }, [fetchStreamData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F3EB] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#D5C4B7] border-t-[#B8A99C] rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-[#2D3142]">טוען שידור חי...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F3EB] relative" dir="rtl">
      {/* Decorative elements */}
      <div className="absolute top-32 left-8 w-40 h-40 opacity-[0.06] hidden lg:block pointer-events-none">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#B8A99C" strokeWidth="0.5" strokeDasharray="4,3" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="#B8A99C" strokeWidth="0.5" strokeDasharray="3,2" />
        </svg>
      </div>
      <div className="absolute bottom-20 right-8 w-32 h-32 opacity-[0.06] hidden lg:block pointer-events-none">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <path d="M10,50 Q50,10 90,50 Q50,90 10,50" fill="none" stroke="#B8A99C" strokeWidth="0.5" />
        </svg>
      </div>

      <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">

          {/* ============ LIVE STATE ============ */}
          {streamState === "live" && stream && (
            <>
              {/* Live header */}
              <div className="text-center mb-6">
                <LivePulse />
                <h1 className="text-2xl sm:text-4xl font-bold text-[#2D3142] mt-3">
                  {stream.title}
                </h1>
                {stream.description && (
                  <p className="text-[#5D5D5D] mt-2 text-lg max-w-2xl mx-auto">{stream.description}</p>
                )}
              </div>

              {/* Video + Chat layout */}
              <div className="flex flex-col lg:flex-row gap-4">
                {/* YouTube embed */}
                <div className="flex-1">
                  <div className="bg-black rounded-2xl overflow-hidden shadow-xl aspect-video">
                    {stream.youtubeVideoId ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${stream.youtubeVideoId}?autoplay=1&rel=0`}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={stream.title}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white">
                        <p className="text-xl">השידור יתחיל בקרוב...</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* YouTube Chat embed */}
                <div className="lg:w-[380px] h-[400px] lg:h-auto">
                  <div className="bg-white rounded-2xl overflow-hidden shadow-xl h-full border border-[#D5C4B7]">
                    {stream.youtubeVideoId ? (
                      <iframe
                        src={`https://www.youtube.com/live_chat?v=${stream.youtubeVideoId}&embed_domain=${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}`}
                        className="w-full h-full min-h-[400px]"
                        title="צ׳אט שידור חי"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#5D5D5D] p-6 text-center">
                        <div>
                          <svg className="w-12 h-12 mx-auto mb-3 text-[#D5C4B7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <p>הצ׳אט ייפתח כשהשידור יתחיל</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Info below stream */}
              <div className="mt-8 bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-[#D5C4B7]/30 shadow-md">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#D5C4B7] rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-[#2D3142]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-[#2D3142]">בועז נחייסי</p>
                      <p className="text-sm text-[#5D5D5D]">מורה ומנחה</p>
                    </div>
                  </div>
                  <p className="text-sm text-[#5D5D5D]">
                    💡 ההקלטה תהיה זמינה לאחר השידור למנויים בלבד
                  </p>
                </div>
              </div>
            </>
          )}

          {/* ============ SCHEDULED STATE ============ */}
          {streamState === "scheduled" && stream && (
            <div className="max-w-3xl mx-auto text-center">
              {/* Header */}
              <div className="mb-10">
                <div className="inline-flex items-center gap-2 bg-[#D5C4B7]/20 border border-[#D5C4B7]/40 rounded-full px-5 py-2 mb-6">
                  <svg className="w-5 h-5 text-[#B56B4A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="text-[#2D3142] font-medium">השיעור הבא</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-bold text-[#2D3142] mb-4">
                  {stream.title}
                </h1>
                {stream.description && (
                  <p className="text-lg text-[#5D5D5D] max-w-xl mx-auto mb-2">{stream.description}</p>
                )}
                <p className="text-[#B56B4A] font-medium text-lg mt-4">
                  {formatHebrewDate(stream.scheduledAt)}
                </p>
                {stream.duration && (
                  <p className="text-sm text-[#5D5D5D] mt-1">משך משוער: {stream.duration} דקות</p>
                )}
              </div>

              {/* Countdown */}
              <div className="mb-10">
                <p className="text-[#5D5D5D] mb-4 text-sm font-medium">ספירה לאחור לשיעור הבא</p>
                <Countdown targetDate={stream.scheduledAt} />
              </div>

              {/* Preview card */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-[#D5C4B7]/30 shadow-lg mb-8">
                {stream.thumbnailUrl ? (
                  <div className="aspect-video rounded-xl overflow-hidden mb-6 bg-[#2D3142]">
                    <img src={stream.thumbnailUrl} alt={stream.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="aspect-video rounded-xl overflow-hidden mb-6 bg-gradient-to-br from-[#2D3142] to-[#4a4a6a] flex items-center justify-center">
                    <div className="text-center text-white/80">
                      <svg className="w-16 h-16 mx-auto mb-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <p className="text-lg">השידור יתחיל בקרוב</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="bg-[#F7F3EB] rounded-xl p-4">
                    <p className="text-2xl mb-1">🎯</p>
                    <p className="text-sm font-medium text-[#2D3142]">שידור חינם</p>
                    <p className="text-xs text-[#5D5D5D]">פתוח לכולם</p>
                  </div>
                  <div className="bg-[#F7F3EB] rounded-xl p-4">
                    <p className="text-2xl mb-1">💬</p>
                    <p className="text-sm font-medium text-[#2D3142]">צ׳אט בזמן אמת</p>
                    <p className="text-xs text-[#5D5D5D]">דברו עם בועז</p>
                  </div>
                  <div className="bg-[#F7F3EB] rounded-xl p-4">
                    <p className="text-2xl mb-1">🔄</p>
                    <p className="text-sm font-medium text-[#2D3142]">צפייה חוזרת</p>
                    <p className="text-xs text-[#5D5D5D]">למנויים בלבד</p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              {!session && (
                <div className="bg-gradient-to-r from-[#D5C4B7]/20 to-[#B8A99C]/20 rounded-2xl p-6 border border-[#D5C4B7]/30">
                  <p className="text-[#2D3142] font-bold text-lg mb-2">
                    רוצים לצפות בהקלטות של כל השיעורים?
                  </p>
                  <p className="text-[#5D5D5D] mb-4 text-sm">
                    הצטרפו לסטודיו בועז אונליין וקבלו גישה לכל ההקלטות, מאות שיעורים ותכנים בלעדיים
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                      href="/register"
                      className="bg-gradient-to-r from-[#D5C4B7] to-[#B8A99C] text-white px-8 py-3 rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-300 inline-block"
                    >
                      הרשמה חינם
                    </Link>
                    <Link
                      href="/pricing"
                      className="bg-white text-[#2D3142] px-8 py-3 rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-300 border border-[#D5C4B7] inline-block"
                    >
                      צפו בתוכניות המנוי
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============ ENDED STATE ============ */}
          {streamState === "ended" && stream && (
            <div className="max-w-3xl mx-auto text-center">
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 bg-[#D5C4B7]/20 border border-[#D5C4B7]/40 rounded-full px-5 py-2 mb-6">
                  <svg className="w-5 h-5 text-[#5D5D5D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-[#5D5D5D] font-medium">השידור הסתיים</span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-bold text-[#2D3142] mb-4">
                  {stream.title}
                </h1>
                <p className="text-[#5D5D5D]">
                  השידור החי הסתיים. {session ? "ההקלטה זמינה באזור הסגנונות." : "ההקלטה זמינה למנויים בלבד."}
                </p>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-[#D5C4B7]/30 shadow-lg">
                <div className="aspect-video rounded-xl overflow-hidden mb-6 bg-gradient-to-br from-[#2D3142] to-[#4a4a6a] flex items-center justify-center">
                  <div className="text-center text-white/80">
                    <svg className="w-16 h-16 mx-auto mb-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-lg">ההקלטה זמינה למנויים</p>
                  </div>
                </div>

                {session ? (
                  <Link
                    href="/styles/שיעורי לייב"
                    className="bg-gradient-to-r from-[#D5C4B7] to-[#B8A99C] text-white px-8 py-3 rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-300 inline-block"
                  >
                    צפייה בהקלטה
                  </Link>
                ) : (
                  <div>
                    <p className="text-[#2D3142] font-bold text-lg mb-4">
                      רוצים לצפות בהקלטה?
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Link
                        href="/register"
                        className="bg-gradient-to-r from-[#D5C4B7] to-[#B8A99C] text-white px-8 py-3 rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-300 inline-block"
                      >
                        הרשמה חינם
                      </Link>
                      <Link
                        href="/pricing"
                        className="bg-white text-[#2D3142] px-8 py-3 rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-300 border border-[#D5C4B7] inline-block"
                      >
                        צפו בתוכניות המנוי
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============ NO STREAMS STATE ============ */}
          {streamState === "none" && (
            <div className="max-w-3xl mx-auto text-center">
              <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-[#2D3142] mb-4">
                  שיעורים בשידור חי
                </h1>
                <p className="text-lg text-[#5D5D5D] max-w-xl mx-auto">
                  בקרוב נתחיל עם שיעורי שידור חי שבועיים עם בועז! הישארו מעודכנים.
                </p>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-[#D5C4B7]/30 shadow-lg">
                <div className="aspect-video rounded-xl overflow-hidden mb-6 bg-gradient-to-br from-[#2D3142] to-[#4a4a6a] flex items-center justify-center">
                  <div className="text-center text-white/80">
                    <svg className="w-20 h-20 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <p className="text-xl font-medium">בקרוב...</p>
                    <p className="text-sm mt-2 opacity-70">שיעורים חיים שבועיים עם בועז</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="bg-[#F7F3EB] rounded-xl p-4">
                    <p className="text-2xl mb-1">📅</p>
                    <p className="text-sm font-medium text-[#2D3142]">פעם בשבוע</p>
                    <p className="text-xs text-[#5D5D5D]">שיעור חי קבוע</p>
                  </div>
                  <div className="bg-[#F7F3EB] rounded-xl p-4">
                    <p className="text-2xl mb-1">🎯</p>
                    <p className="text-sm font-medium text-[#2D3142]">חינם לכולם</p>
                    <p className="text-xs text-[#5D5D5D]">ללא עלות</p>
                  </div>
                  <div className="bg-[#F7F3EB] rounded-xl p-4">
                    <p className="text-2xl mb-1">💬</p>
                    <p className="text-sm font-medium text-[#2D3142]">צ׳אט חי</p>
                    <p className="text-xs text-[#5D5D5D]">תקשורת ישירה</p>
                  </div>
                </div>
              </div>

              {!session && (
                <div className="mt-8">
                  <Link
                    href="/register"
                    className="bg-gradient-to-r from-[#D5C4B7] to-[#B8A99C] text-white px-8 py-3 rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-300 inline-block"
                  >
                    הרשמו כדי לקבל עדכונים
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveStreamPage;
