"use client";

import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import Player from '@vimeo/player';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import PreviewOverlay from './PreviewOverlay';
import { useVideoPlayer } from '../context/VideoPlayerContext';

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
  // Use the video player context to manage global state
  const { setIsVideoOpen } = useVideoPlayer();
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const { data: session } = useSession();
  const [showPreviewOverlay, setShowPreviewOverlay] = useState(false);
  const [previewTimeRemaining, setPreviewTimeRemaining] = useState(120);
  // Updated ref type to handle both interval and animation frame
  const previewTimerRef = useRef<NodeJS.Timeout | { clear: () => void } | null>(null);

  // Function to save video progress - moved outside useEffect for reuse
  const saveProgress = useCallback(async () => {
    if (!session?.user || !videoUri || !player) return;
    
    try {
      const currentTime = await player.getCurrentTime();
      const duration = await player.getDuration();
      const percent = Math.floor((currentTime / duration) * 100);
      
      // Extract video URI from the embed HTML if not provided
      const uri = videoUri.startsWith('/videos/') 
        ? videoUri 
        : `/videos/${videoUri.split('/').pop()}`;
      
      await axios.post('/api/mark-watched', {
        userEmail: session.user.email,
        videoUri: uri,
        progress: percent,
        resumeTime: currentTime,
      });
    } catch (err) {
      console.error("❌ Failed to save video progress:", err);
    }
  }, [player, videoUri, session]);

  // Handle click outside to close the video player
  const handleBackdropClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking directly on the backdrop (not on the video or controls)
    if (e.target === e.currentTarget) {
      // Save progress and close the video player
      saveProgress().then(() => {
        setIsVideoOpen(false); // Update global state
        onClose();
      });
    }
  }, [saveProgress, onClose, setIsVideoOpen]);

  // Handle close button click
  const handleCloseButton = useCallback(() => {
    saveProgress().then(() => {
      setIsVideoOpen(false); // Update global state
      onClose();
    });
  }, [saveProgress, onClose, setIsVideoOpen]);

  // Set video open state when component mounts
  useEffect(() => {
    setIsVideoOpen(true);
    return () => setIsVideoOpen(false);
  }, [setIsVideoOpen]);

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
    
    // Set up an interval to periodically save progress
    const progressInterval = setInterval(async () => {
      if (!session?.user || !videoUri) return;
      
      const now = Date.now();
      if (now - lastSaved < 15000) return; // Save only if 15 seconds have passed (increased from 5s)
      lastSaved = now;
      
      // Use the saveProgress function we defined earlier
      saveProgress();
    }, 15000); // Check every 15 seconds;
    
    // Track progress with throttling
    newPlayer.on("timeupdate", saveProgress);
    
    newPlayer.on("pause", saveProgress);
    
    // Save before page unload
    window.addEventListener("beforeunload", saveProgress);

    // Clean up when component unmounts
    return () => {
      // Clear the progress interval
      clearInterval(progressInterval);
      
      // Clear the preview timer if it exists
      if (previewTimerRef.current) {
        if (previewTimerRef.current && 'clear' in previewTimerRef.current) {
          previewTimerRef.current.clear();
        } else if (previewTimerRef.current) {
          clearInterval(previewTimerRef.current);
        }
      }
      
      // Save progress one last time before unmounting
      saveProgress();
      newPlayer.destroy();
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

  // This duplicate handleBackdropClick is removed

  return (
    <div 
      className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-70 z-[9999] flex items-center justify-center"
      onClick={handleBackdropClick}
      ref={modalRef}
    >
      <div
        className="video-container w-full max-w-4xl aspect-video relative"
        ref={videoContainerRef}
      />

      {/* More gentle close button positioned to avoid navbar overlap */}
      <motion.button
        className="absolute top-16 right-6 text-white text-sm cursor-pointer bg-black bg-opacity-50 hover:bg-opacity-70 p-2 rounded-full shadow-md z-10 flex items-center justify-center border border-white/30"
        onClick={handleCloseButton}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        aria-label="Close video"
        title="Close video"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </motion.button>
      
      {/* Subtle hint text - positioned to avoid navbar overlap */}
      <motion.div
        className="absolute bottom-6 left-6 bg-black bg-opacity-30 text-white text-xs px-2.5 py-1 rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ delay: 2, duration: 0.8 }}
      >
        לחץ מחוץ לוידאו לסגירה
      </motion.div>

      {showPreviewOverlay && (
        <PreviewOverlay 
          onClose={handleCloseButton} 
          onReplay={handleReplay}
        />
      )}
    </div>
  );
};

export default VideoPlayer;
