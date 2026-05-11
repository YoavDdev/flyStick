"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

const HEBREW_MONTHS = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];
const HEBREW_DAYS = ["ראשון","שני","שלישי","רביעי","חמישי","שישי","שבת"];
const HEBREW_DAYS_SHORT = ["א׳","ב׳","ג׳","ד׳","ה׳","ו׳","ש׳"];

const fmt = (d: Date) => `${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}`;

const getVimeoEmbedUrl = (stream: any): string | null => {
  const url = stream.vimeoEmbedUrl;
  if (!url) return null;
  if (url.includes("player.vimeo.com") || url.includes("/embed")) return url;
  const ev = url.match(/vimeo\.com\/event\/(\d+)(\/[a-f0-9]+)?/);
  if (ev) return `https://vimeo.com/event/${ev[1]}/embed${ev[2]||""}/interaction`;
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) { const hm = url.match(/\/(\d+)\/([a-f0-9]+)/) || url.match(/[?&]h=([a-f0-9]+)/); const h = hm?(hm[2]||hm[1]):""; return `https://player.vimeo.com/video/${vm[1]}${h?`?h=${h}`:""}`; }
  return url;
};

const Countdown = ({ targetDate }: { targetDate: string }) => {
  const [tl, setTl] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) { setTl({ d:0,h:0,m:0,s:0 }); return; }
      setTl({ d: Math.floor(diff/86400000), h: Math.floor((diff%86400000)/3600000), m: Math.floor((diff%3600000)/60000), s: Math.floor((diff%60000)/1000) });
    };
    calc(); const i = setInterval(calc, 1000); return () => clearInterval(i);
  }, [targetDate]);
  return (
    <div className="flex gap-1.5 sm:gap-2 justify-center" dir="ltr">
      {[{v:tl.d,l:"ימים"},{v:tl.h,l:"שעות"},{v:tl.m,l:"דקות"},{v:tl.s,l:"שניות"}].map((b,i)=>(
        <div key={i} className="flex flex-col items-center">
          <div className="bg-white/80 border border-[#D5C4B7] rounded-lg w-9 h-9 sm:w-12 sm:h-12 flex items-center justify-center shadow-sm">
            <span className="text-sm sm:text-lg font-bold text-[#2D3142]">{b.v.toString().padStart(2,"0")}</span>
          </div>
          <span className="text-[8px] sm:text-[9px] text-[#5D5D5D] mt-0.5">{b.l}</span>
        </div>
      ))}
    </div>
  );
};

const LivePulse = () => (
  <div className="flex items-center justify-center gap-2">
    <div className="relative"><div className="w-3 h-3 bg-red-500 rounded-full"></div><div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping"></div></div>
    <span className="text-red-500 font-bold text-lg">שידור חי</span>
  </div>
);

// Google Calendar link generator
const getGoogleCalendarUrl = (event: any) => {
  const start = new Date(event.scheduledAt);
  const end = new Date(start.getTime() + (event.estimatedDuration || 60) * 60000);
  const fmtGcal = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${fmtGcal(start)}/${fmtGcal(end)}`,
    details: `${event.description || "שיעור בשידור חי עם בועז נחייסי"}\n\nלצפייה: https://studioboazonline.com/live`,
    location: "https://studioboazonline.com/live",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

const AddToCalendarButton = ({ event }: { event: any }) => (
  <a
    href={getGoogleCalendarUrl(event)}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-1.5 text-xs bg-white text-[#2D3142] px-3 py-1.5 rounded-full hover:bg-[#D5C4B7]/20 transition-colors border border-[#D5C4B7]/50 shadow-sm"
  >
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
    הוסף ליומן
  </a>
);

// ============ REGISTER BUTTON ============
const RegisterButton = ({ event, isLoggedIn, isRegistered, onToggle, registering }: {
  event: any;
  isLoggedIn: boolean;
  isRegistered: boolean;
  onToggle: (eventId: string) => void;
  registering: string | null;
}) => {
  if (event.status !== "scheduled") return null;

  if (!isLoggedIn) {
    return (
      <Link href="/register" className="inline-flex items-center gap-1 text-[10px] bg-[#B56B4A] text-white px-2.5 py-1 rounded-full hover:bg-[#9a5a3d] transition-colors flex-shrink-0">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
        הירשם
      </Link>
    );
  }

  const isBusy = registering === event.id;

  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggle(event.id); }}
      disabled={isBusy}
      className={`inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full transition-colors flex-shrink-0 ${
        isRegistered
          ? "bg-green-100 text-green-700 border border-green-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
          : "bg-[#B56B4A] text-white hover:bg-[#9a5a3d]"
      } disabled:opacity-50`}
    >
      {isBusy ? (
        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : isRegistered ? (
        <>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          <span className="group-hover:hidden">נרשמת</span>
        </>
      ) : (
        <>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          הרשם לשיעור
        </>
      )}
    </button>
  );
};

// ============ CALENDAR ============
const EventCalendar = ({ events, isLoggedIn, registeredIds, onToggleRegister, registering, monthlyThemes, isAdmin }: {
  events: any[];
  isLoggedIn: boolean;
  registeredIds: string[];
  onToggleRegister: (eventId: string) => void;
  registering: string | null;
  monthlyThemes: Record<string, string>;
  isAdmin?: boolean;
}) => {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [emptyDayMessage, setEmptyDayMessage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const selectedEventsRef = useRef<HTMLDivElement>(null);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const isThisMonth = today.getFullYear() === year && today.getMonth() === month;

  // Map events by day
  const byDay: Record<number, any[]> = {};
  events.forEach((e) => {
    const d = new Date(e.scheduledAt);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!byDay[day]) byDay[day] = [];
      byDay[day].push(e);
    }
  });

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const selectedEvents = selectedDay ? (byDay[selectedDay] || []) : [];

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-[#D5C4B7]/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#D5C4B7]/20 to-[#B8A99C]/10 p-4 sm:p-5 flex items-center justify-between gap-3">
        <button onClick={() => setCurrentMonth(new Date(year, month - 1, 1))} className="bg-white/70 hover:bg-white shadow-sm hover:shadow-md text-[#2D3142] px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap">
          חודש קודם
        </button>
        <div className="text-center flex-1">
          <h2 className="text-lg sm:text-xl font-bold text-[#2D3142] mb-0.5">{HEBREW_MONTHS[month]} {year}</h2>
          {monthlyThemes[`${year}-${month + 1}`] && (
            <p className="text-xs sm:text-sm text-[#B56B4A] font-medium">{monthlyThemes[`${year}-${month + 1}`]}</p>
          )}
        </div>
        <button onClick={() => setCurrentMonth(new Date(year, month + 1, 1))} className="bg-white/70 hover:bg-white shadow-sm hover:shadow-md text-[#2D3142] px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap">
          חודש הבא
        </button>
      </div>

      {/* Legend - elegant */}
      <div className="border-b border-[#D5C4B7]/15 p-3 sm:p-4 flex items-center justify-center gap-4 sm:gap-6 text-xs text-[#5D5D5D] bg-[#F7F3EB]/30">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-gradient-to-br from-[#B56B4A] to-[#9a5a3d] shadow-sm"></span> <span className="font-medium">חי</span></span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-gradient-to-br from-[#D5C4B7] to-[#B8A99C] shadow-sm"></span> <span className="font-medium">מתוזמן</span></span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-gradient-to-br from-[#9D8E81] to-[#8A7B72] shadow-sm"></span> <span className="font-medium">הסתיים</span></span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-gradient-to-br from-[#C9A88A] to-[#B8977A] shadow-sm"></span> <span className="font-medium">בוטל</span></span>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 border-b border-[#D5C4B7]/15 bg-gradient-to-b from-[#F7F3EB]/20 to-transparent">
        {HEBREW_DAYS_SHORT.map((d) => (
          <div key={d} className="text-center py-2 sm:py-3 text-xs sm:text-sm font-semibold text-[#2D3142]/70">{d}</div>
        ))}
      </div>

      {/* Grid - elegant spacing */}
      <div className="grid grid-cols-7 gap-[1px] bg-[#D5C4B7]/10 p-[1px]">
        {cells.map((day, i) => {
          if (!day) return <div key={i} className="min-h-[50px] sm:min-h-[60px] bg-white/50" />;
          const dayEvts = byDay[day] || [];
          const isToday = isThisMonth && day === today.getDate();
          const isSelected = selectedDay === day;
          const hasLive = dayEvts.some(e => e.status === "live");
          const hasScheduled = dayEvts.some(e => e.status === "scheduled");
          const hasEnded = dayEvts.some(e => e.status === "ended");
          const hasCancelled = dayEvts.some(e => e.status === "cancelled");

          return (
            <button
              key={i}
              onClick={() => {
                if (dayEvts.length > 0) {
                  if (isSelected) {
                    setSelectedDay(null);
                    setShowModal(false);
                  } else {
                    setSelectedDay(day);
                    setShowModal(true);
                  }
                  setEmptyDayMessage(null);
                } else {
                  setEmptyDayMessage(`אין שיעורים מתוזמנים ב-${day} ${HEBREW_MONTHS[month]}`);
                  setSelectedDay(null);
                  setShowModal(false);
                }
              }}
              className={`min-h-[50px] sm:min-h-[60px] p-2 flex flex-col items-center justify-center transition-all duration-200 relative group ${
                hasLive ? "bg-gradient-to-br from-[#B56B4A] to-[#9a5a3d] shadow-lg animate-pulse" :
                hasScheduled ? "bg-gradient-to-br from-[#D5C4B7] to-[#B8A99C] shadow-md hover:shadow-lg" :
                hasCancelled ? "bg-gradient-to-br from-[#C9A88A] to-[#B8977A] shadow-sm" :
                hasEnded ? "bg-gradient-to-br from-[#9D8E81] to-[#8A7B72] shadow-sm" :
                isSelected ? "bg-[#D5C4B7]/30 shadow-inner" :
                dayEvts.length > 0 ? "bg-white hover:bg-[#D5C4B7]/20 cursor-pointer hover:shadow-md" : "bg-white"
              }`}
            >
              <span className={`text-sm sm:text-base font-semibold transition-all ${
                (hasLive || hasScheduled || hasCancelled || hasEnded) ? "text-white drop-shadow-sm" :
                isToday ? "text-[#B56B4A] font-bold text-base sm:text-lg" :
                "text-[#2D3142] group-hover:text-[#4A4E69]"
              }`}>{day}</span>
              {isToday && !hasLive && !hasScheduled && !hasEnded && !hasCancelled && (
                <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-[#B56B4A]"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Empty day message */}
      {emptyDayMessage && (
        <div className="border-t border-[#D5C4B7]/20 p-4 bg-gradient-to-r from-[#F7F3EB]/50 to-[#D5C4B7]/20">
          <div className="flex items-center justify-center gap-2 text-[#5D5D5D]">
            <svg className="w-5 h-5 text-[#B56B4A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm font-medium">{emptyDayMessage}</p>
          </div>
        </div>
      )}

      {/* Modal for selected day events */}
      {showModal && selectedDay && selectedEvents.length > 0 && (
        <div 
          className="fixed inset-0 z-[9999]" 
          dir="rtl" 
          style={{ overflow: 'hidden' }}
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 z-10"
            onClick={() => { setShowModal(false); setSelectedDay(null); }}
          />
          
          {/* Modal Container */}
          <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-4 z-20">
            {/* Modal Box */}
            <div 
              className="relative bg-white rounded-xl sm:rounded-2xl border border-[#D5C4B7]/20 shadow-2xl max-w-2xl w-full flex flex-col" 
              style={{ maxHeight: '90vh' }}
              onClick={(e) => e.stopPropagation()}
            >
              
              {/* Header - קבוע */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#D5C4B7]/20 flex-shrink-0">
                <button
                  onClick={() => { setShowModal(false); setSelectedDay(null); }}
                  className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                
                <h3 className="font-bold text-[#2D3142] text-base sm:text-lg flex-1 text-center">
                  יום {HEBREW_DAYS[new Date(year, month, selectedDay).getDay()]} {selectedDay} {HEBREW_MONTHS[month]}
                </h3>
                
                <div className="w-10"></div>
              </div>

              {/* Content - עם scroll */}
              <div 
                className="flex-1 overflow-y-auto p-4 sm:p-6"
                style={{ 
                  WebkitOverflowScrolling: 'touch',
                  touchAction: 'pan-y',
                  overscrollBehavior: 'contain'
                }}
              >
                <div className="space-y-3 sm:space-y-4">
              
              {selectedEvents.map((e: any) => {
                const inner = (
                  <div className={`p-4 rounded-xl flex flex-col gap-3 shadow-md hover:shadow-lg transition-all ${
                    e.status === "live" ? "bg-red-50 border-2 border-red-300" :
                    e.status === "scheduled" ? "bg-[#FFF9F0] border-2 border-[#D5C4B7]" :
                    e.status === "cancelled" ? "bg-orange-50 border-2 border-orange-300" :
                    "bg-gray-50 border-2 border-gray-300"
                  } ${e.status === "ended" ? "hover:bg-gray-100 cursor-pointer" : ""}` }>
                    <div className="flex items-start gap-3">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${
                        e.status === "live" ? "bg-red-500 animate-pulse" :
                        e.status === "scheduled" ? "bg-[#4A4E69]" :
                        e.status === "cancelled" ? "bg-orange-400" : "bg-gray-400"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className={`font-bold text-base mb-1 ${e.status === "cancelled" ? "line-through text-[#5D5D5D]" : "text-[#2D3142]"}` }>{e.title}</p>
                        <p className="text-sm text-[#5D5D5D] mb-2">
                          {fmt(new Date(e.scheduledAt))} | {e.estimatedDuration} דקות
                          {e.status === "ended" && " | הסתיים"}
                          {e.status === "cancelled" && " | בוטל"}
                          {e.status === "live" && " | משדר עכשיו!"}
                        </p>
                        {e.description && <p className="text-sm text-[#5D5D5D]">{e.description}</p>}
                      </div>
                    </div>
                    {e.status === "scheduled" && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <RegisterButton event={e} isLoggedIn={isLoggedIn} isRegistered={registeredIds.includes(e.id)} onToggle={onToggleRegister} registering={registering} />
                        <AddToCalendarButton event={e} />
                      </div>
                    )}
                    {e.status === "live" && (
                      <span className="text-sm bg-red-500 text-white px-3 py-1.5 rounded-full flex-shrink-0 font-bold">שידור חי</span>
                    )}
                    {e.status === "ended" && (
                      <span className="inline-flex items-center gap-1.5 text-sm bg-[#D5C4B7]/30 text-[#2D3142] px-3 py-1.5 rounded-full border border-[#D5C4B7]/60 font-medium">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        צפה בהקלטה
                      </span>
                    )}
                    {e.status === "cancelled" && (
                      <span className="text-sm bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full flex-shrink-0 font-medium">בוטל</span>
                    )}
                    
                    {/* Admin: Show registrations for scheduled events */}
                    {isAdmin && e.status === "scheduled" && (
                      <AdminEventRegistrations eventId={e.id} eventTitle={e.title} />
                    )}
                  </div>
                );
                return e.status === "ended" ? (
                  <Link key={e.id} href={`/explore?video=${encodeURIComponent(e.title)}`} onClick={() => setShowModal(false)}>{inner}</Link>
                ) : (
                  <div key={e.id}>{inner}</div>
                );
              })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// ============ ADMIN EVENT REGISTRATIONS ============
const AdminEventRegistrations = ({ eventId, eventTitle }: { eventId: string; eventTitle: string }) => {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState("");

  const fetchRegistrations = async () => {
    if (expanded) {
      setExpanded(false);
      return;
    }
    
    setLoading(true);
    setExpanded(true);
    setError("");
    
    try {
      const res = await fetch(`/api/admin/live-events/registrations?eventId=${eventId}`);
      const data = await res.json();
      
      if (data.success) {
        setRegistrations(data.registrations || []);
      } else {
        setError(data.error || "שגיאה בטעינת נרשמים");
      }
    } catch (err) {
      setError("שגיאה בטעינת נרשמים");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3">
      <button
        onClick={fetchRegistrations}
        className={`w-full text-xs px-3 py-1.5 rounded-lg border transition-all ${
          expanded
            ? "bg-[#B56B4A] text-white border-[#B56B4A]"
            : "bg-white text-[#2D3142] border-[#D5C4B7] hover:bg-[#D5C4B7]/20"
        }`}
      >
        <span className="flex items-center justify-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {expanded ? "הסתר" : `נרשמים: ${registrations.length || "?"}`}
        </span>
      </button>

      {expanded && (
        <div className="mt-2 bg-white/70 backdrop-blur-sm rounded-lg border border-[#D5C4B7]/30 p-2">
          {loading && (
            <div className="text-center py-3">
              <div className="inline-block w-4 h-4 border-2 border-[#B56B4A] border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-[10px] p-2 rounded text-center">
              {error}
            </div>
          )}

          {!loading && !error && registrations.length === 0 && (
            <div className="text-center py-3 text-[10px] text-[#5D5D5D]">
              אין נרשמים
            </div>
          )}

          {!loading && !error && registrations.length > 0 && (
            <div className="space-y-1">
              <div className="bg-[#D5C4B7]/20 rounded px-2 py-1 mb-1.5">
                <p className="text-[10px] font-bold text-[#2D3142] text-center">
                  סה"כ: {registrations.length}
                </p>
              </div>
              
              <div className="max-h-48 overflow-y-auto space-y-0.5">
                {registrations.map((reg: any, idx: number) => (
                  <div
                    key={reg.id}
                    className="bg-white/80 rounded px-2 py-1.5 border border-[#D5C4B7]/20 hover:border-[#B56B4A]/40 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <span className="text-[9px] font-bold text-[#2D3142] bg-[#D5C4B7]/30 px-1.5 py-0.5 rounded">
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold text-[#2D3142] truncate">
                            {reg.userName}
                          </p>
                          <p className="text-[9px] text-[#5D5D5D] truncate">
                            {reg.userEmail}
                          </p>
                        </div>
                      </div>
                      {reg.isSubscriber && (
                        <svg className="w-3 h-3 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============ UPCOMING LIST ============
const UpcomingList = ({ events, isLoggedIn, registeredIds, onToggleRegister, registering }: {
  events: any[];
  isLoggedIn: boolean;
  registeredIds: string[];
  onToggleRegister: (eventId: string) => void;
  registering: string | null;
}) => {
  const upcoming = events
    .filter(e => e.status === "scheduled")
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  if (upcoming.length === 0) return null;

  const nextEvent = upcoming[0];

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-[#D5C4B7]/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-4 sm:p-5">
      {/* Next event highlight - compact */}
      <div className="text-center mb-2 sm:mb-4">
        <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-[#D5C4B7]/20 border border-[#D5C4B7]/40 rounded-full px-3 sm:px-4 py-1 sm:py-1.5 mb-2 sm:mb-4">
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#B56B4A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span className="text-xs sm:text-sm text-[#2D3142] font-medium">השיעור הבא</span>
        </div>
        <h2 className="text-lg sm:text-2xl font-bold text-[#2D3142] mb-1">{nextEvent.title}</h2>
        {nextEvent.description && <p className="text-[#5D5D5D] text-xs sm:text-sm mb-1">{nextEvent.description}</p>}
        <p className="text-[#B56B4A] font-medium text-xs sm:text-sm">
          יום {HEBREW_DAYS[new Date(nextEvent.scheduledAt).getDay()]}, {new Date(nextEvent.scheduledAt).getDate()} {HEBREW_MONTHS[new Date(nextEvent.scheduledAt).getMonth()]} | {fmt(new Date(nextEvent.scheduledAt))}
        </p>
        <div className="mt-2 sm:mt-3">
          <Countdown targetDate={nextEvent.scheduledAt} />
        </div>
        <div className="mt-2 sm:mt-3 flex items-center justify-center gap-2">
          <RegisterButton event={nextEvent} isLoggedIn={isLoggedIn} isRegistered={registeredIds.includes(nextEvent.id)} onToggle={onToggleRegister} registering={registering} />
          <AddToCalendarButton event={nextEvent} />
        </div>
        {nextEvent.registrationCount > 0 && (
          <p className="text-xs text-[#5D5D5D] mt-1 sm:mt-2">{nextEvent.registrationCount} נרשמו לשיעור</p>
        )}
      </div>

      {/* Other upcoming - compact */}
      {upcoming.length > 1 && (
        <div className="border-t border-[#D5C4B7]/20 pt-2 sm:pt-3">
          <h3 className="font-medium text-[#2D3142] text-xs sm:text-sm mb-2">שידורים נוספים</h3>
          <div className="space-y-1.5">
            {upcoming.slice(1).map((e) => {
              const d = new Date(e.scheduledAt);
              return (
                <div key={e.id} className="p-2 sm:p-2.5 rounded-lg bg-[#F7F3EB] hover:bg-[#D5C4B7]/10 transition-colors space-y-1.5">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#4A4E69] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#2D3142] truncate">{e.title}</p>
                    </div>
                    <span className="text-xs text-[#5D5D5D] whitespace-nowrap">
                      {HEBREW_DAYS[d.getDay()]} {d.getDate()}.{d.getMonth()+1} | {fmt(d)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap pr-5">
                    <RegisterButton event={e} isLoggedIn={isLoggedIn} isRegistered={registeredIds.includes(e.id)} onToggle={onToggleRegister} registering={registering} />
                    <AddToCalendarButton event={e} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ============ PAST EVENTS ============
const PastEventsList = ({ events }: { events: any[] }) => {
  const past = events
    .filter(e => e.status === "ended")
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
    .slice(0, 10);

  if (past.length === 0) return null;

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-[#D5C4B7]/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-6">
      <h3 className="font-bold text-[#2D3142] mb-3">שיעורים שהסתיימו</h3>
      <div className="space-y-2">
        {past.map((e) => {
          const d = new Date(e.scheduledAt);
          return (
            <div key={e.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#F7F3EB]/50">
              <div className="w-2 h-2 rounded-full bg-[#B8A99C] flex-shrink-0" />
              <span className="text-sm text-[#5D5D5D] flex-1 truncate">{e.title}</span>
              <span className="text-xs text-[#B8A99C] whitespace-nowrap">{d.getDate()}.{d.getMonth()+1} | {fmt(d)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============ ADMIN CONTROL BAR ============
const AdminLiveControlBar = ({ isAdmin, streamState, allEvents, onAction }: {
  isAdmin: boolean;
  streamState: string;
  allEvents: any[];
  onAction: (action: string, eventId?: string) => void;
}) => {
  const [acting, setActing] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);

  if (!isAdmin) return null;

  const isLive = streamState === "live";
  const nextScheduled = allEvents
    .filter(e => e.status === "scheduled")
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0];
  const liveEvent = allEvents.find(e => e.status === "live");

  const handleAction = async (action: string, eventId?: string) => {
    setActing(true);
    setConfirmEnd(false);
    await onAction(action, eventId);
    setActing(false);
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] w-[calc(100%-2rem)] max-w-lg" dir="rtl">
      <div className="bg-[#2D3142] text-white rounded-2xl shadow-2xl border border-[#D5C4B7]/30 p-3 sm:p-4">
        <div className="flex items-center justify-between gap-3">
          {/* Status indicator */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className={`w-2.5 h-2.5 rounded-full ${isLive ? "bg-red-500 animate-pulse" : nextScheduled ? "bg-[#4A4E69]" : "bg-gray-500"}`} />
            <span className="text-xs font-medium">
              {isLive ? "משדר עכשיו" : nextScheduled ? "יש אירוע מתוזמן" : "אין אירועים"}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {!isLive && nextScheduled && (
              <button
                onClick={() => handleAction("start", nextScheduled.id)}
                disabled={acting}
                className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold transition-colors disabled:opacity-50 shadow-lg"
              >
                {acting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <div className="relative">
                      <div className="w-2.5 h-2.5 bg-white rounded-full" />
                    </div>
                    התחל שידור
                  </>
                )}
              </button>
            )}

            {isLive && !confirmEnd && (
              <button
                onClick={() => setConfirmEnd(true)}
                disabled={acting}
                className="flex items-center gap-1.5 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-full text-sm font-bold transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
                סיים שידור
              </button>
            )}

            {isLive && confirmEnd && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAction("end", liveEvent?.id)}
                  disabled={acting}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-full text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {acting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : "כן, סיים"}
                </button>
                <button
                  onClick={() => setConfirmEnd(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-full text-xs transition-colors"
                >
                  ביטול
                </button>
              </div>
            )}

            {!isLive && !nextScheduled && (
              <span className="text-xs text-gray-400">צרו אירוע מהדשבורד</span>
            )}
          </div>
        </div>

        {/* Event info line */}
        {(isLive && liveEvent) && (
          <p className="text-[10px] text-gray-400 mt-1.5 truncate">משדר: {liveEvent.title}</p>
        )}
        {(!isLive && nextScheduled) && (
          <p className="text-[10px] text-gray-400 mt-1.5 truncate">הבא: {nextScheduled.title} | {fmt(new Date(nextScheduled.scheduledAt))}</p>
        )}
      </div>
    </div>
  );
};

// ============ MAIN PAGE ============
const LiveStreamPage = () => {
  const { data: session } = useSession();
  const [stream, setStream] = useState<any>(null);
  const [streamState, setStreamState] = useState<string>("none");
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);
  const [registering, setRegistering] = useState<string | null>(null);
  const [monthlyThemes, setMonthlyThemes] = useState<Record<string, string>>({});

  const fetchStreamData = useCallback(async () => {
    try {
      const [currentRes, eventsRes, themesRes] = await Promise.all([
        fetch("/api/live/current"),
        fetch("/api/live/events"),
        fetch("/api/live/monthly-theme"),
      ]);
      const currentData = await currentRes.json();
      const eventsData = await eventsRes.json();
      const themesData = await themesRes.json();
      if (currentData.success) { setStream(currentData.stream); setStreamState(currentData.streamState); }
      if (eventsData.success) { setAllEvents(eventsData.events || []); }
      if (themesData.success && themesData.themes) {
        const map: Record<string, string> = {};
        themesData.themes.forEach((t: any) => { map[`${t.year}-${t.month}`] = t.title; });
        setMonthlyThemes(map);
      }
    } catch (error) {
      console.error("Error fetching stream:", error);
    } finally { setLoading(false); }
  }, []);

  // Check admin status + fetch user registrations
  useEffect(() => {
    if (!session?.user?.email) return;
    const email = session.user.email;
    const init = async () => {
      try {
        const [adminRes, regRes] = await Promise.all([
          fetch("/api/check-admin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          }),
          fetch(`/api/live/register?email=${encodeURIComponent(email)}`),
        ]);
        const adminData = await adminRes.json();
        const regData = await regRes.json();
        setIsAdmin(adminData.isAdmin === true);
        if (regData.success) setRegisteredIds(regData.registeredEventIds || []);
      } catch { /* ignore */ }
    };
    init();
  }, [session]);

  // Toggle registration for an event
  const handleToggleRegister = async (eventId: string) => {
    if (!session?.user?.email) return;
    setRegistering(eventId);
    try {
      const isRegistered = registeredIds.includes(eventId);
      if (isRegistered) {
        const res = await fetch(`/api/live/register?eventId=${eventId}&email=${encodeURIComponent(session.user.email)}`, { method: "DELETE" });
        const data = await res.json();
        if (data.success) {
          setRegisteredIds(prev => prev.filter(id => id !== eventId));
        }
      } else {
        const res = await fetch("/api/live/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventId, email: session.user.email }),
        });
        const data = await res.json();
        if (data.success) {
          setRegisteredIds(prev => [...prev, eventId]);
        }
      }
    } catch { /* ignore */ }
    setRegistering(null);
  };

  useEffect(() => {
    fetchStreamData();
    const interval = setInterval(fetchStreamData, 60000);
    return () => clearInterval(interval);
  }, [fetchStreamData]);

  // Admin quick-action handler
  const handleAdminAction = async (action: string, eventId?: string) => {
    if (!session?.user?.email) return;
    try {
      const res = await fetch("/api/live/quick-control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, eventId, email: session.user.email }),
      });
      const data = await res.json();
      if (data.success) {
        // Refresh data immediately
        await fetchStreamData();
      } else {
        alert(data.error || "שגיאה");
      }
    } catch {
      alert("שגיאת רשת");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F3EB] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#D5C4B7] border-t-[#B8A99C] rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-[#2D3142]">טוען...</p>
        </div>
      </div>
    );
  }

  const isLive = streamState === "live" && stream;

  return (
    <div className="min-h-screen bg-[#F7F3EB]" dir="rtl">
      <div className="pt-16 sm:pt-24 pb-10 sm:pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">

          {/* PAGE HEADER */}
          <div className="text-center">
            <h1 className="text-2xl sm:text-4xl font-bold text-[#2D3142] mb-1 sm:mb-2">שיעורים בשידור חי</h1>
            <p className="text-[#5D5D5D] text-sm sm:text-base max-w-xl mx-auto">שיעורים חיים עם בועז נחייסי. צפו בשידור, בדקו את לוח השידורים וחזרו לצפות בהקלטות.</p>
          </div>

          {/* NEXT EVENT COUNTDOWN - HIGHLIGHTED AT TOP */}
          {!isLive && (() => {
            const nextEvent = allEvents
              .filter(e => e.status === "scheduled")
              .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0];
            
            if (!nextEvent) return null;
            
            return (
              <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-[#D5C4B7]/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-4 sm:p-6">
                <div className="text-center">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#2D3142] mb-2">השיעור הבא</h2>
                  <h3 className="text-lg sm:text-xl font-semibold text-[#B56B4A] mb-1">{nextEvent.title}</h3>
                  {nextEvent.description && <p className="text-[#5D5D5D] text-xs sm:text-sm mb-2">{nextEvent.description}</p>}
                  <p className="text-[#2D3142] font-medium text-sm mb-3">
                    יום {HEBREW_DAYS[new Date(nextEvent.scheduledAt).getDay()]}, {new Date(nextEvent.scheduledAt).getDate()} {HEBREW_MONTHS[new Date(nextEvent.scheduledAt).getMonth()]} | {fmt(new Date(nextEvent.scheduledAt))}
                  </p>
                  <div className="mb-3">
                    <Countdown targetDate={nextEvent.scheduledAt} />
                  </div>
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <RegisterButton event={nextEvent} isLoggedIn={!!session} isRegistered={registeredIds.includes(nextEvent.id)} onToggle={handleToggleRegister} registering={registering} />
                    <AddToCalendarButton event={nextEvent} />
                  </div>
                  
                  {/* Admin: Show registrations */}
                  {isAdmin && (
                    <AdminEventRegistrations eventId={nextEvent.id} eventTitle={nextEvent.title} />
                  )}
                </div>
              </div>
            );
          })()}

          {/* LIVE STREAM SECTION */}
          {isLive && (
            <div>
              <div className="text-center mb-3 sm:mb-4">
                <LivePulse />
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#2D3142] mt-2">{stream.title}</h2>
                {stream.description && <p className="text-[#5D5D5D] text-sm sm:text-base mt-1">{stream.description}</p>}
              </div>

              {session ? (
                <>
                  {getVimeoEmbedUrl(stream) ? (
                    getVimeoEmbedUrl(stream)!.includes("/interaction") ? (
                      <div className="bg-black rounded-xl sm:rounded-2xl overflow-hidden shadow-xl" style={{ minHeight: "60vh" }}>
                        <iframe src={`${getVimeoEmbedUrl(stream)}?autoplay=1`} className="w-full h-full" style={{ minHeight: "60vh" }} allow="autoplay; fullscreen; picture-in-picture; encrypted-media; web-share" allowFullScreen title={stream.title} />
                      </div>
                    ) : (
                      <div className="bg-black rounded-xl sm:rounded-2xl overflow-hidden shadow-xl aspect-video">
                        <iframe src={`${getVimeoEmbedUrl(stream)}?autoplay=1`} className="w-full h-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen title={stream.title} />
                      </div>
                    )
                  ) : (
                    <div className="bg-black rounded-xl sm:rounded-2xl overflow-hidden shadow-xl aspect-video flex items-center justify-center">
                      <p className="text-base sm:text-lg md:text-xl text-white px-4">השידור יתחיל בקרוב...</p>
                    </div>
                  )}

                  <div className="mt-3 sm:mt-4 bg-white/70 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-[#D5C4B7]/30 shadow-md flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#D5C4B7] rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#2D3142]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      </div>
                      <div><p className="font-bold text-[#2D3142] text-xs sm:text-sm">בועז נחייסי</p><p className="text-[10px] sm:text-xs text-[#5D5D5D]">מורה ומנחה</p></div>
                    </div>
                    <p className="text-[10px] sm:text-xs text-[#5D5D5D] text-center sm:text-right">ההקלטה תהיה זמינה לאחר השידור למנויים בלבד</p>
                  </div>
                </>
              ) : (
                <div className="bg-gradient-to-b from-[#2D3142] to-[#1a1d2e] rounded-xl sm:rounded-2xl overflow-hidden shadow-xl aspect-video flex flex-col items-center justify-center text-center p-4 sm:p-6 md:p-8 relative">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-1/4 left-1/4 w-24 h-24 sm:w-32 sm:h-32 bg-red-500 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-32 h-32 sm:w-40 sm:h-40 bg-[#D5C4B7] rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                      <div className="relative"><div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div><div className="absolute inset-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-ping"></div></div>
                      <span className="text-red-400 font-bold text-xs sm:text-sm">שידור חי עכשיו</span>
                    </div>
                    <svg className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-white/30 mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    <h3 className="text-white text-base sm:text-lg md:text-xl lg:text-2xl font-bold mb-2 px-2">הירשמו כדי לצפות בשידור</h3>
                    <p className="text-white/60 text-xs sm:text-sm mb-4 sm:mb-6 max-w-md px-2">השידור החי פתוח לכל מי שרשום באתר. הירשמו בחינם כדי להצטרף לשיעור עם בועז נחייסי.</p>
                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 justify-center w-full px-2">
                      <Link href="/register" className="bg-white text-[#2D3142] px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-bold text-xs sm:text-sm hover:bg-[#D5C4B7] transition-colors shadow-lg w-full sm:w-auto text-center">
                        הרשמה חינם
                      </Link>
                      <Link href="/login" className="text-white/80 border border-white/30 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm hover:bg-white/10 transition-colors w-full sm:w-auto text-center">
                        כבר רשומים? התחברו
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}


          {/* MONTHLY CALENDAR - always visible */}
          <div>
            <h2 className="text-xl font-bold text-[#2D3142] mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              לוח שידורים
            </h2>
            <p className="text-sm text-[#5D5D5D] mb-3">לחץ על השיעור לבירור והרשמה</p>
            <EventCalendar events={allEvents} isLoggedIn={!!session} registeredIds={registeredIds} onToggleRegister={handleToggleRegister} registering={registering} monthlyThemes={monthlyThemes} isAdmin={isAdmin} />
          </div>

          {/* CTA for non-logged in users */}
          {!session && (
            <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-[#D5C4B7]/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-6 sm:p-8 text-center">
              <h3 className="text-xl sm:text-2xl font-bold text-[#2D3142] mb-3">
                רוצים לצפות בהקלטות של כל השיעורים?
              </h3>
              <p className="text-sm sm:text-base text-[#5D5D5D] mb-6 max-w-xl mx-auto">
                הצטרפו לסטודיו בועז אונליין וקבלו גישה למאות שיעורים ותכנים בלעדיים
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/pricing" className="bg-gradient-to-r from-[#B56B4A] to-[#9a5a3d] text-white px-8 py-3 rounded-2xl font-medium shadow-md hover:shadow-lg transition-all inline-block">
                  תוכניות מנוי
                </Link>
                <Link href="/register" className="bg-white text-[#2D3142] px-8 py-3 rounded-2xl font-medium shadow-md hover:shadow-lg transition-all border-2 border-[#D5C4B7] inline-block">
                  הרשמה חינם
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Admin floating control bar */}
      <AdminLiveControlBar
        isAdmin={isAdmin}
        streamState={streamState}
        allEvents={allEvents}
        onAction={handleAdminAction}
      />
    </div>
  );
};

export default LiveStreamPage;
