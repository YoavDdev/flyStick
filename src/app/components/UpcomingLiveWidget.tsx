"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface LiveEvent {
  id: string;
  title: string;
  status: string;
  scheduledAt: string | null;
}

const UpcomingLiveWidget = () => {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/live/current");
        const data = await res.json();

        if (data.success && data.streamState === "live") {
          setIsLive(true);
          setEvents([data.stream]);
        } else {
          // Fetch upcoming events
          const eventsRes = await fetch("/api/live/events");
          const eventsData = await eventsRes.json();
          if (eventsData.success) {
            const upcoming = (eventsData.events || [])
              .filter((e: LiveEvent) => e.status === "scheduled" && e.scheduledAt)
              .sort((a: LiveEvent, b: LiveEvent) =>
                new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime()
              )
              .slice(0, 3);
            setEvents(upcoming);
          }
        }
      } catch (error) {
        console.error("Error fetching live events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Don't render if no events and not loading
  if (!loading && events.length === 0) return null;
  if (loading) return null;

  const formatShortDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${dayName} ${day}.${month} | ${hours}:${minutes}`;
  };

  const getTimeUntil = (dateStr: string) => {
    const now = new Date().getTime();
    const target = new Date(dateStr).getTime();
    const diffMs = target - now;
    if (diffMs <= 0) return "";
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `עוד ${days} ${days === 1 ? "יום" : "ימים"}`;
    if (hours > 0) return `עוד ${hours} ${hours === 1 ? "שעה" : "שעות"}`;
    return "בקרוב";
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 max-w-md mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        {isLive ? (
          <>
            <div className="relative">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
            </div>
            <h3 className="font-bold text-white text-lg">שידור חי עכשיו!</h3>
          </>
        ) : (
          <>
            <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="font-bold text-white text-lg">שיעורים חיים קרובים</h3>
          </>
        )}
      </div>

      {/* Events list */}
      <div className="space-y-3">
        {events.map((event, idx) => (
          <div
            key={event.id}
            className={`flex items-center gap-3 p-3 rounded-xl ${
              isLive || idx === 0
                ? "bg-white/20 border border-white/30"
                : "bg-white/10"
            }`}
          >
            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
              isLive ? "bg-red-400" : idx === 0 ? "bg-amber-400" : "bg-white/40"
            }`} />
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{event.title}</p>
              {event.scheduledAt && !isLive && (
                <p className="text-white/60 text-xs mt-0.5">
                  {formatShortDate(event.scheduledAt)}
                  {" • "}
                  {getTimeUntil(event.scheduledAt)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <Link
        href="/live"
        className={`mt-4 block text-center text-sm font-medium px-6 py-2.5 rounded-full transition-all duration-300 ${
          isLive
            ? "bg-red-500 text-white hover:bg-red-600"
            : "bg-white/20 text-white hover:bg-white/30 border border-white/30"
        }`}
      >
        {isLive ? "הצטרפו לשידור" : "כל השידורים"}
      </Link>
    </div>
  );
};

export default UpcomingLiveWidget;
