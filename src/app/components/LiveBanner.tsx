"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const BANNER_HEIGHT = 40; // px

const LiveBanner = () => {
  const [isLive, setIsLive] = useState(false);
  const [streamTitle, setStreamTitle] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    const checkLiveStatus = async () => {
      try {
        const res = await fetch("/api/live/current");
        const data = await res.json();
        if (data.success && data.streamState === "live" && data.stream) {
          setIsLive(true);
          setStreamTitle(data.stream.title);
        } else {
          setIsLive(false);
        }
      } catch {
        setIsLive(false);
      }
    };

    checkLiveStatus();
    // Check every 60 seconds
    const interval = setInterval(checkLiveStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  // Set CSS variable so navbar and page content shift down
  useEffect(() => {
    const show = isLive && pathname !== "/live";
    document.documentElement.style.setProperty(
      "--live-banner-height",
      show ? `${BANNER_HEIGHT}px` : "0px"
    );
    return () => {
      document.documentElement.style.setProperty("--live-banner-height", "0px");
    };
  }, [isLive, pathname]);

  // Don't show on the /live page itself, or when not live
  if (!isLive || pathname === "/live") return null;

  return (
    <>
      {/* Fixed banner */}
      <div
        className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-red-600 to-red-500 text-white px-4 text-center shadow-lg"
        style={{ height: `${BANNER_HEIGHT}px` }}
        dir="rtl"
      >
        <Link href="/live" className="flex items-center justify-center gap-3 hover:opacity-90 transition-opacity h-full">
          <div className="relative">
            <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
            <div className="absolute inset-0 w-2.5 h-2.5 bg-white rounded-full animate-ping"></div>
          </div>
          <span className="font-bold text-sm sm:text-base">
            🔴 שידור חי עכשיו: {streamTitle}
          </span>
          <span className="text-xs sm:text-sm bg-white/20 px-3 py-0.5 rounded-full">
            הצטרפו עכשיו →
          </span>
        </Link>
      </div>
      {/* Spacer to push document flow down */}
      <div style={{ height: `${BANNER_HEIGHT}px` }} />
    </>
  );
};

export default LiveBanner;
