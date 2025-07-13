"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface VideoPlayerContextType {
  isVideoOpen: boolean;
  setIsVideoOpen: (isOpen: boolean) => void;
}

const VideoPlayerContext = createContext<VideoPlayerContextType | undefined>(undefined);

export const VideoPlayerProvider = ({ children }: { children: ReactNode }) => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <VideoPlayerContext.Provider value={{ isVideoOpen, setIsVideoOpen }}>
      {children}
    </VideoPlayerContext.Provider>
  );
};

export const useVideoPlayer = (): VideoPlayerContextType => {
  const context = useContext(VideoPlayerContext);
  if (context === undefined) {
    throw new Error('useVideoPlayer must be used within a VideoPlayerProvider');
  }
  return context;
};
