// VideoProgressBadge.tsx
"use client";

import React from "react";

interface Props {
  progress: number;
}

const VideoProgressBadge: React.FC<Props> = ({ progress }) => {
  if (progress >= 99) {
    return (
      <div
        title="נצפה במלואו"
        className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xl font-bold shadow"
      >
        ✓
      </div>
    );
  }

  return (
    <div
      title={`התקדמות: ${progress}%`}
      className="relative w-10 h-10 rounded-full bg-[#F3E9E8] flex items-center justify-center text-[#833414] font-semibold text-sm shadow"
    >
      <svg
        viewBox="0 0 36 36"
        className="w-full h-full absolute top-0 left-0 transform -rotate-90"
      >
        <path
          className="text-[#ddd]"
          d="M18 2.0845
             a 15.9155 15.9155 0 0 1 0 31.831
             a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.8"
        />
        <path
          className="text-[#833414]"
          d="M18 2.0845
             a 15.9155 15.9155 0 0 1 0 31.831"
          fill="none"
          stroke="currentColor"
          strokeDasharray={`${progress}, 100`}
          strokeWidth="3.8"
        />
      </svg>
      <span className="z-10">{progress}%</span>
    </div>
  );
};

export default VideoProgressBadge;
