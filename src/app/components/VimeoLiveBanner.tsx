"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const BANNER_HEIGHT = 40; // px

const VimeoLiveBanner = () => {
  const [bannerState, setBannerState] = useState<"none" | "live" | "soon">("none");
  const [streamTitle, setStreamTitle] = useState("");
  const [minutesUntil, setMinutesUntil] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    const checkLiveStatus = async () => {
      try {
        const res = await fetch("/api/live/current");
        const data = await res.json();

        if (data.success && data.streamState === "live" && data.stream) {
          setBannerState("live");
          setStreamTitle(data.stream.title || "שידור חי");
        } else if (data.success && data.streamState === "scheduled" && data.stream?.scheduledAt) {
          const now = new Date().getTime();
          const scheduled = new Date(data.stream.scheduledAt).getTime();
          const diffHours = (scheduled - now) / (1000 * 60 * 60);

          if (diffHours > 0 && diffHours <= 1) {
            setBannerState("soon");
            setStreamTitle(data.stream.title || "שידור חי");
            setMinutesUntil(Math.ceil(diffHours * 60));
          } else {
            setBannerState("none");
          }
        } else {
          setBannerState("none");
        }
      } catch (error) {
        console.error("Error checking live status:", error);
        setBannerState("none");
      }
    };

    checkLiveStatus();
    const interval = setInterval(checkLiveStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  // Adjust body padding
  useEffect(() => {
    if (bannerState !== "none") {
      document.documentElement.style.setProperty("--live-banner-height", `${BANNER_HEIGHT}px`);
    } else {
      document.documentElement.style.setProperty("--live-banner-height", "0px");
    }
    return () => {
      document.documentElement.style.setProperty("--live-banner-height", "0px");
    };
  }, [bannerState]);

  // Don't show on live page itself
  if (pathname === "/live") {
    if (bannerState !== "none") {
      return <div style={{ height: BANNER_HEIGHT }} />;
    }
    return null;
  }

  if (bannerState === "none") return null;

  return (
    <Link href="/live">
      <div
        className={`fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-2 px-4 text-white text-sm font-medium cursor-pointer transition-all duration-300 ${
          bannerState === "live"
            ? "bg-gradient-to-r from-green-600 to-green-500"
            : "bg-gradient-to-r from-indigo-500 to-purple-500"
        }`}
        style={{ height: BANNER_HEIGHT }}
        dir="rtl"
      >
        {bannerState === "live" && (
          <>
            <div className="relative mr-1">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <div className="absolute inset-0 w-2 h-2 bg-white rounded-full animate-ping"></div>
            </div>
            <span>🔴 שידור חי עכשיו: {streamTitle} - הצטרפו!</span>
          </>
        )}
        {bannerState === "soon" && (
          <span>
            📅 עוד {minutesUntil} דקות: {streamTitle} - לעמוד השידור
          </span>
        )}
      </div>
    </Link>
  );
};

export default VimeoLiveBanner;
