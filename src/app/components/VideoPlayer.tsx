"use client";

import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import Player from '@vimeo/player';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import PreviewOverlay from './PreviewOverlay';

interface VideoPlayerProps {
  videoUri: string | null;
  embedHtml: string | null;
  onClose: () => void;
  initialResumeTime?: number;
  isSubscriber?: boolean;
  isAdmin?: boolean;
}

const VideoPlayer = ({ 
  videoUri, 
  embedHtml, 
  onClose, 
  initialResumeTime = 0,
  isSubscriber = true,
  isAdmin = false
}: VideoPlayerProps) => {
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const { data: session } = useSession();
  const [showPreviewOverlay, setShowPreviewOverlay] = useState(false);
  const [previewTimeRemaining, setPreviewTimeRemaining] = useState(120);
  // Updated ref type to handle both interval and animation frame
  const previewTimerRef = useRef<NodeJS.Timeout | { clear: () => void } | null>(null);

  useEffect(() => {
    if (!videoContainerRef.current || !embedHtml) return;

    // Extract the Vimeo video ID from the embed HTML
    const videoIdMatch = embedHtml.match(/player\.vimeo\.com\/video\/(\d+)/);
    if (!videoIdMatch) return;

    const videoId = videoIdMatch[1];
    const PREVIEW_LIMIT = 120; // 2 minutes in seconds
    
    // Create a new player instance
    const newPlayer = new Player(videoContainerRef.current, {
      id: parseInt(videoId, 10), // Convert string to number
      autoplay: true,
    });

    setPlayer(newPlayer);

    // For non-subscribers, check if they've already watched this video
    if (!isSubscriber && !isAdmin && videoUri) {
      // Create a unique key for this video and user
      const videoKey = `preview_${videoId}_${session?.user?.email || 'guest'}`;
      const hasWatchedPreview = localStorage.getItem(videoKey) === 'watched';
      
      // If they've already watched the preview, show the overlay immediately
      if (hasWatchedPreview) {
        setShowPreviewOverlay(true);
        newPlayer.pause();
        setPreviewTimeRemaining(0);
      } else {
        // Set the resume time if available, but cap it at the preview limit for non-subscribers
        if (initialResumeTime > 0) {
          newPlayer.setCurrentTime(Math.min(initialResumeTime, PREVIEW_LIMIT));
        }
        
        // Start the preview timer using requestAnimationFrame instead of setInterval
        // This is more efficient and will pause when tab is not active
        let lastTimestamp = Date.now();
        let animationFrameId: number;
        
        const updatePreviewTimer = () => {
          const now = Date.now();
          const deltaTime = now - lastTimestamp;
          
          // Only update once per second approximately
          if (deltaTime >= 1000) {
            lastTimestamp = now;
            
            setPreviewTimeRemaining(prev => {
              if (prev <= 1) {
                // Time's up, show overlay and pause video
                setShowPreviewOverlay(true);
                newPlayer.pause();
                
                // Mark this video as watched in localStorage
                localStorage.setItem(videoKey, 'watched');
                return 0;
              }
              return prev - 1;
            });
          }
          
          // Continue animation frame loop if preview time remaining
          if (previewTimeRemaining > 0) {
            animationFrameId = requestAnimationFrame(updatePreviewTimer);
          }
        };
        
        // Start the animation frame loop
        animationFrameId = requestAnimationFrame(updatePreviewTimer);
        
        // Store the animation frame ID for cleanup
        previewTimerRef.current = {
          clear: () => cancelAnimationFrame(animationFrameId)
        };
        
        // Add seek event listener to prevent seeking past the preview limit
        newPlayer.on('seeked', async () => {
          if (!isSubscriber && !isAdmin) {
            const currentTime = await newPlayer.getCurrentTime();
            if (currentTime > PREVIEW_LIMIT) {
              newPlayer.setCurrentTime(PREVIEW_LIMIT);
              setShowPreviewOverlay(true);
              newPlayer.pause();
              
              // Mark this video as watched in localStorage
              localStorage.setItem(videoKey, 'watched');
              setPreviewTimeRemaining(0);
            }
          }
        });
      }
    } else {
      // For subscribers, set the resume time normally
      if (initialResumeTime > 0) {
        newPlayer.setCurrentTime(initialResumeTime);
      }
    }
    
    // Progress tracking with throttling
    let lastSaved = 0;
    
    const saveProgress = async () => {
      if (!session?.user || !videoUri) return;
      
      const now = Date.now();
      if (now - lastSaved < 15000) return; // Save only if 15 seconds have passed (increased from 5s)
      lastSaved = now;
      
      try {
        const currentTime = await newPlayer.getCurrentTime();
        const duration = await newPlayer.getDuration();
        const percent = Math.floor((currentTime / duration) * 100);
        
        // Extract video URI from the embed HTML if not provided
        const uri = videoUri.startsWith('/videos/') 
          ? videoUri 
          : `/videos/${videoUri.match(/\/(\d+)$/)?.[1] || ''}`;
          
        // Save progress for all logged-in users
        await axios.post("/api/mark-watched", {
          userEmail: session.user.email,
          videoUri: uri,
          progress: percent,
          resumeTime: currentTime,
        });
      } catch (err) {
        console.error("❌ Failed to save video progress:", err);
      }
    };
    
    // Track progress with throttling
    newPlayer.on("timeupdate", saveProgress);
    
    // Save on pause immediately
    newPlayer.on("pause", saveProgress);
    
    // Save before page unload
    window.addEventListener("beforeunload", saveProgress);

    // Clean up on unmount
    return () => {
      saveProgress(); // Save progress on unmount
      newPlayer.destroy();
      if (previewTimerRef.current) {
        if (previewTimerRef.current && 'clear' in previewTimerRef.current) {
          previewTimerRef.current.clear();
        } else if (previewTimerRef.current) {
          clearInterval(previewTimerRef.current);
        }
      }
      window.removeEventListener("beforeunload", saveProgress);
    };
  }, [embedHtml, initialResumeTime, isSubscriber, session, videoUri]);

  const handleClose = useCallback(async () => {
    if (player && videoUri && session?.user) {
      try {
        const currentTime = await player.getCurrentTime();
        const duration = await player.getDuration();
        const percent = Math.floor((currentTime / duration) * 100);
        
        // Extract video URI from the embed HTML if not provided
        const uri = videoUri.startsWith('/videos/') 
          ? videoUri 
          : `/videos/${videoUri.match(/\/(\d+)$/)?.[1] || ''}`;

        // Save progress for all logged-in users, regardless of subscription status
        await axios.post("/api/mark-watched", {
          userEmail: session.user.email,
          videoUri: uri,
          progress: percent,
          resumeTime: currentTime,
        });
      } catch (err) {
        console.error("❌ Failed to save video progress:", err);
      }
    }
    
    onClose();
  }, [player, videoUri, session, onClose]);

  // Function to handle replaying the video from the beginning
  const handleReplay = useCallback(() => {
    if (player && videoUri) {
      // Reset the preview timer
      setPreviewTimeRemaining(120);
      setShowPreviewOverlay(false);
      
      // Reset the video to the beginning
      player.setCurrentTime(0);
      player.play();
      
      // Clear the "watched" status from localStorage
      if (videoUri) {
        const videoIdMatch = embedHtml?.match(/player\.vimeo\.com\/video\/(\d+)/);
        if (videoIdMatch) {
          const videoId = videoIdMatch[1];
          const videoKey = `preview_${videoId}_${session?.user?.email || 'guest'}`;
          localStorage.removeItem(videoKey);
        }
      }
      
      // Start the preview timer again using requestAnimationFrame
      if (previewTimerRef.current) {
        if (previewTimerRef.current && 'clear' in previewTimerRef.current) {
          previewTimerRef.current.clear();
        } else if (previewTimerRef.current) {
          clearInterval(previewTimerRef.current);
        }
      }
      
      // Similar implementation as in useEffect but for replay
      let lastTimestamp = Date.now();
      let animationFrameId: number;
      
      const updatePreviewTimer = () => {
        const now = Date.now();
        const deltaTime = now - lastTimestamp;
        
        // Only update once per second approximately
        if (deltaTime >= 1000) {
          lastTimestamp = now;
          
          setPreviewTimeRemaining(prev => {
            if (prev <= 1) {
              // Time's up, show overlay and pause video
              setShowPreviewOverlay(true);
              player.pause();
              
              // Mark this video as watched in localStorage again
              const videoIdMatch = embedHtml?.match(/player\.vimeo\.com\/video\/(\d+)/);
              if (videoIdMatch) {
                const videoId = videoIdMatch[1];
                const videoKey = `preview_${videoId}_${session?.user?.email || 'guest'}`;
                localStorage.setItem(videoKey, 'watched');
              }
              return 0;
            }
            return prev - 1;
          });
        }
        
        // Continue animation frame loop if preview time remaining
        if (previewTimeRemaining > 0) {
          animationFrameId = requestAnimationFrame(updatePreviewTimer);
        }
      };
      
      // Start the animation frame loop
      animationFrameId = requestAnimationFrame(updatePreviewTimer);
      
      // Store the animation frame ID for cleanup
      previewTimerRef.current = {
        clear: () => cancelAnimationFrame(animationFrameId)
      };
    }
  }, [player, videoUri, embedHtml, session, previewTimeRemaining, setPreviewTimeRemaining, setShowPreviewOverlay]);

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-70 z-[9999] flex items-center justify-center">
      <div
        className="video-container w-full max-w-4xl aspect-video"
        ref={videoContainerRef}
      />

      <button
        className="absolute top-4 right-4 text-white text-xl cursor-pointer bg-red-600 p-2 rounded-full hover:bg-red-700 transition-all duration-300"
        onClick={handleClose}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {showPreviewOverlay && (
        <PreviewOverlay 
          onClose={handleClose} 
          onReplay={handleReplay}
        />
      )}
    </div>
  );
};

export default VideoPlayer;
