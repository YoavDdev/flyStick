"use client";

import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import Player from '@vimeo/player';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import PreviewOverlay from './PreviewOverlay';
import { useVideoPlayer } from '../context/VideoPlayerContext';
import { trackVideoPlay } from '../libs/analytics';

interface VideoPlayerProps {
  videoUri: string | null;
  embedHtml: string | null;
  onClose: () => void;
  initialResumeTime?: number;
  isSubscriber?: boolean;
  isAdmin?: boolean;
  videoName?: string;
}

const VideoPlayer = ({ 
  videoUri, 
  embedHtml, 
  onClose, 
  initialResumeTime = 0,
  isSubscriber = true,
  isAdmin = false,
  videoName
}: VideoPlayerProps) => {
  // Use the video player context to manage global state
  const { setIsVideoOpen } = useVideoPlayer();
  
  // Debug logging
  console.log('VideoPlayer received videoName:', videoName);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const { data: session } = useSession();
  const [showPreviewOverlay, setShowPreviewOverlay] = useState(false);
  const [previewTimeRemaining, setPreviewTimeRemaining] = useState(120);
  // Updated ref type to handle both interval and animation frame
  const previewTimerRef = useRef<NodeJS.Timeout | { clear: () => void } | null>(null);
  
  // Loading and disclaimer state
  const [isLoading, setIsLoading] = useState(true);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [disclaimerFadingOut, setDisclaimerFadingOut] = useState(false);
  const [needsUserInteraction, setNeedsUserInteraction] = useState(false);
  
  // Mobile orientation and fullscreen state
  const [isMobileLandscape, setIsMobileLandscape] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobilePortrait, setIsMobilePortrait] = useState(false);

  // Function to exit fullscreen safely on all devices including mobile
  const exitFullscreenSafely = useCallback(async () => {
    try {
      // Check for standard fullscreen API
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }
      
      // Check for webkit fullscreen (Safari/iOS)
      if ((document as any).webkitFullscreenElement) {
        (document as any).webkitExitFullscreen();
        return;
      }
      
      // Check for moz fullscreen (Firefox)
      if ((document as any).mozFullScreenElement) {
        (document as any).mozCancelFullScreen();
        return;
      }
      
      // Check for ms fullscreen (IE/Edge)
      if ((document as any).msFullscreenElement) {
        (document as any).msExitFullscreen();
        return;
      }
      
      // For Vimeo player specific fullscreen
      if (player) {
        try {
          const isPlayerFullscreen = await player.getFullscreen();
          if (isPlayerFullscreen) {
            await player.exitFullscreen();
          }
        } catch (error) {
          console.warn('Failed to exit Vimeo player fullscreen:', error);
        }
      }
      
    } catch (error) {
      console.warn('Failed to exit fullscreen:', error);
    }
  }, [player]);

  // Exit fullscreen when preview overlay is shown
  useEffect(() => {
    if (showPreviewOverlay) {
      exitFullscreenSafely();
    }
  }, [showPreviewOverlay, exitFullscreenSafely]);

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
      
      // Save to both database and localStorage for immediate persistence
      const progressData = {
        userEmail: session.user.email,
        videoUri: uri,
        progress: percent,
        resumeTime: currentTime,
      };
      
      // Save to localStorage immediately for mobile interruption recovery
      const storageKey = `video_progress_${session.user.email}_${uri.replace(/[^a-zA-Z0-9]/g, '_')}`;
      localStorage.setItem(storageKey, JSON.stringify({
        resumeTime: currentTime,
        progress: percent,
        timestamp: Date.now()
      }));
      
      // Save to database
      await axios.post('/api/mark-watched', progressData);
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

  // Auto-hide disclaimer after 5 seconds
  useEffect(() => {
    const disclaimerTimer = setTimeout(() => {
      setDisclaimerFadingOut(true);
      setTimeout(() => {
        setShowDisclaimer(false);
      }, 1000);
    }, 5000);

    return () => clearTimeout(disclaimerTimer);
  }, []);

  // Handle mobile orientation and fullscreen detection
  useEffect(() => {
    if (!player) return;
    
    let previousOrientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    
    const checkOrientation = async () => {
      const isMobile = window.innerWidth <= 768;
      const isLandscape = window.innerWidth > window.innerHeight;
      const currentOrientation = isLandscape ? 'landscape' : 'portrait';
      
      setIsMobileLandscape(isMobile && isLandscape);
      setIsMobilePortrait(isMobile && !isLandscape);
      
      // Auto-fullscreen with Vimeo player when rotating to landscape on mobile
      if (isMobile && 
          previousOrientation === 'portrait' && 
          currentOrientation === 'landscape' && 
          player) {
        
        try {
          // Use Vimeo's native fullscreen
          await player.requestFullscreen();
          console.log('📱 Entered Vimeo fullscreen on landscape rotation');
        } catch (error) {
          console.warn('Failed to enter Vimeo fullscreen:', error);
        }
      }
      
      // Exit fullscreen when rotating from landscape to portrait
      if (isMobile && 
          previousOrientation === 'landscape' && 
          currentOrientation === 'portrait' && 
          player) {
        
        try {
          const isPlayerFullscreen = await player.getFullscreen();
          if (isPlayerFullscreen) {
            await player.exitFullscreen();
            console.log('📱 Exited Vimeo fullscreen on portrait rotation');
          }
        } catch (error) {
          console.warn('Failed to exit Vimeo fullscreen:', error);
        }
      }
      
      previousOrientation = currentOrientation;
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    // Initial check
    checkOrientation();

    // Add event listeners
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Cleanup
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [player]);

  // Handle mobile app interruptions (phone calls, app switching)
  useEffect(() => {
    if (!player || !session?.user || !videoUri) return;

    const handleVisibilityChange = async () => {
      if (document.hidden) {
        // App is being backgrounded - save progress immediately
        await saveProgress();
        console.log('📱 Saved progress before mobile interruption');
      } else {
        // App is coming back to foreground - check if we need to restore position
        console.log('📱 Returned from mobile interruption - checking for saved position');
        
        // Small delay to ensure player is ready
        setTimeout(async () => {
          try {
            const uri = videoUri.startsWith('/videos/') 
              ? videoUri 
              : `/videos/${videoUri.split('/').pop()}`;
            const storageKey = `video_progress_${session.user?.email}_${uri.replace(/[^a-zA-Z0-9]/g, '_')}`;
            const storedProgress = localStorage.getItem(storageKey);
            
            if (storedProgress) {
              const progressData = JSON.parse(storedProgress);
              const currentTime = await player.getCurrentTime();
              
              // If we're at the beginning but have saved progress, restore it
              if (currentTime < 5 && progressData.resumeTime > 5) {
                await player.setCurrentTime(progressData.resumeTime);
                console.log('🔄 Restored video position to:', Math.floor(progressData.resumeTime), 'seconds');
              }
            }
          } catch (e) {
            console.warn('Failed to restore video position:', e);
          }
        }, 1000);
      }
    };

    const handlePageHide = async () => {
      // Page is being unloaded - save progress immediately
      await saveProgress();
      console.log('📱 Saved progress on page hide');
    };

    // Add event listeners for mobile interruption scenarios
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [player, saveProgress, session, videoUri]);

  useEffect(() => {
    if (!videoContainerRef.current || !embedHtml) return;

    // Extract the Vimeo video ID from the embed HTML
    const videoIdMatch = embedHtml.match(/player\.vimeo\.com\/video\/(\d+)/);
    if (!videoIdMatch) return;

    const videoId = videoIdMatch[1];
    const PREVIEW_LIMIT = 120; // 2 minutes in seconds
    
    // Create a new player instance with responsive and fullscreen options
    const newPlayer = new Player(videoContainerRef.current, {
      id: parseInt(videoId, 10), // Convert string to number
      autoplay: true,
      responsive: true,
      controls: true,
      playsinline: false, // Allow fullscreen on mobile
      muted: false, // Start with sound enabled
    });

    setPlayer(newPlayer);
    
    // Handle player ready and loading
    newPlayer.ready().then(async () => {
      console.log('🎬 Vimeo player ready');
      
      try {
        // Set resume time first if available
        if (initialResumeTime > 0) {
          await newPlayer.setCurrentTime(initialResumeTime);
        }
        
        // Try to start playing
        await newPlayer.play();
        console.log('✅ Video playing automatically');
        setIsLoading(false); // Hide loading screen only if autoplay works
      } catch (error) {
        console.warn('⚠️ Autoplay blocked, waiting for user interaction:', error);
        setIsLoading(false); // Hide loading screen
        setNeedsUserInteraction(true); // Show play button overlay
      }
    }).catch(error => {
      console.error('❌ Player initialization failed:', error);
      setIsLoading(false);
    });

    // Listen for play event to hide user interaction overlay
    let hasTrackedPlay = false;
    newPlayer.on('play', () => {
      setNeedsUserInteraction(false);
      if (!hasTrackedPlay) {
        hasTrackedPlay = true;
        trackVideoPlay(videoName || 'unknown');
      }
    });

    // Also listen for loaded event as backup
    newPlayer.on('loaded', () => {
      if (!needsUserInteraction) {
        setIsLoading(false);
      }
    });
    
    // Add seek restriction for non-subscribers
    if (!isSubscriber && !isAdmin) {
      const PREVIEW_LIMIT = 120; // 2 minutes in seconds
      let toastShown = false;
      
      // Add event listener for seeking
      newPlayer.on('seeked', async () => {
        const currentTime = await newPlayer.getCurrentTime();
        
        // If user tries to seek beyond the preview limit, show overlay
        if (currentTime > PREVIEW_LIMIT) {
          newPlayer.setCurrentTime(PREVIEW_LIMIT);
          setShowPreviewOverlay(true);
          newPlayer.pause();
        }
      });
      
      // Also monitor continuous playback to prevent playing beyond the limit
      newPlayer.on('timeupdate', async () => {
        const currentTime = await newPlayer.getCurrentTime();
        
        // If video plays beyond the preview limit, show overlay and pause
        if (currentTime > PREVIEW_LIMIT) {
          newPlayer.pause();
          setShowPreviewOverlay(true);
          
          // Clear the timer to prevent memory leaks
          if (previewTimerRef.current) {
            if ('clear' in previewTimerRef.current) {
              previewTimerRef.current.clear();
            } else {
              clearInterval(previewTimerRef.current);
            }
            previewTimerRef.current = null;
          }
        }
      });
      
      // Helper function to show toast notification - optimized to use React state
      const showPreviewRestrictionToast = () => {
        if (toastShown) return; // Prevent multiple toasts
        
        toastShown = true;
        // Use React state instead of DOM manipulation for better performance
        setShowPreviewOverlay(true);
        
        // Hide toast after 3 seconds
        setTimeout(() => {
          toastShown = false;
        }, 3000);
      }
    }

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
      // For subscribers, check for stored progress from mobile interruptions first
      if (videoUri) {
        const uri = videoUri.startsWith('/videos/') 
          ? videoUri 
          : `/videos/${videoUri.split('/').pop()}`;
        const storageKey = `video_progress_${session?.user?.email}_${uri.replace(/[^a-zA-Z0-9]/g, '_')}`;
        const storedProgress = localStorage.getItem(storageKey);
      
        let resumeFromTime = initialResumeTime;
        
        if (storedProgress) {
          try {
            const progressData = JSON.parse(storedProgress);
            // Use stored progress if it's more recent (within last 24 hours) and further than initialResumeTime
            const isRecent = Date.now() - progressData.timestamp < 24 * 60 * 60 * 1000;
            if (isRecent && progressData.resumeTime > initialResumeTime) {
              resumeFromTime = progressData.resumeTime;
              console.log(' Resuming from mobile interruption at:', Math.floor(resumeFromTime), 'seconds');
            }
          } catch (e) {
            console.warn('Failed to parse stored video progress:', e);
          }
        }
        
        // Set the resume time
        if (resumeFromTime > 0) {
          newPlayer.setCurrentTime(resumeFromTime);
        }
      } else {
        // Fallback to initialResumeTime if videoUri is null
        if (initialResumeTime > 0) {
          newPlayer.setCurrentTime(initialResumeTime);
        }
      }
    }
    
    // Note: Disclaimer must be manually dismissed with button click
    // Browser security prevents automatic fullscreen without user interaction
    
    // Progress tracking - save on pause and every 20 seconds during playback
    let lastSaved = 0;
    const progressInterval = setInterval(async () => {
      if (!session?.user || !videoUri || document.hidden) return;
      
      const now = Date.now();
      if (now - lastSaved < 20000) return; // Save every 20 seconds
      lastSaved = now;
      
      await saveProgress();
    }, 20000);
    
    // Save on pause event
    const handlePause = async () => {
      await saveProgress();
    };
    
    newPlayer.on("pause", handlePause);

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
      
      // Remove pause event listener
      newPlayer.off("pause", handlePause);
      
      // Save progress one last time before unmounting
      saveProgress();
      newPlayer.destroy();
    };
  }, [embedHtml, videoUri]);

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
      className={`fixed top-0 left-0 w-full h-full bg-black z-[9999] ${
        isMobileLandscape || isFullscreen ? 'bg-opacity-100' : 'bg-opacity-70'
      }`}
      onClick={handleBackdropClick}
      ref={modalRef}
    >
      <div
        className="relative"
        ref={videoContainerRef}
        style={{ 
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          // Width is calculated based on max height to prevent overflow
          // In landscape: limit width so video height stays within viewport
          width: isMobileLandscape || isFullscreen 
            ? 'min(95vw, calc(85vh * 16 / 9))' 
            : isMobilePortrait 
              ? 'min(90vw, calc(60vh * 16 / 9))'
              : 'min(56rem, calc(85vh * 16 / 9))',
        }}
      />

      {/* Close button */}
      <button
        className={`absolute text-white text-sm cursor-pointer bg-black bg-opacity-50 hover:bg-opacity-70 p-2 rounded-full shadow-md z-10 flex items-center justify-center border border-white/30 transition-all duration-200 ${
          isMobileLandscape || isFullscreen 
            ? 'top-4 right-4' 
            : isMobilePortrait ? 'top-4 right-4' : 'top-16 right-6'
        }`}
        onClick={handleCloseButton}
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
      </button>
      
      {/* Hint text */}
      {!isMobileLandscape && !isFullscreen && (
        <div className="absolute bottom-6 left-6 bg-black bg-opacity-30 text-white text-xs px-2.5 py-1 rounded-full opacity-70">
          לחץ מחוץ לוידאו לסגירה
        </div>
      )}

      {showPreviewOverlay && (
        <PreviewOverlay 
          onClose={handleCloseButton} 
          onReplay={handleReplay}
        />
      )}
      
      {/* Loading Screen */}
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-30">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>טוען סרטון...</p>
          </div>
        </div>
      )}

      {/* Mobile Play Button Overlay */}
      {needsUserInteraction && !isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-25">
          <button
            onClick={async () => {
              if (player) {
                try {
                  await player.play();
                  setNeedsUserInteraction(false);
                } catch (error) {
                  console.error('Failed to play video:', error);
                }
              }
            }}
            className="bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-6 transition-all duration-200 shadow-lg"
            aria-label="Play video"
          >
            <svg
              className="w-12 h-12 text-gray-800 ml-1"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        </div>
      )}

      {/* Disclaimer Overlay */}
      {showDisclaimer && !isLoading && (
        <div
          className={`absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-20 transition-opacity duration-500 ${
            disclaimerFadingOut ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <div
            className={`bg-white rounded-lg p-8 max-w-2xl mx-4 text-center shadow-2xl transition-all duration-500 ${
              disclaimerFadingOut ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
            }`}
          >
            {/* Video Name */}
            {videoName && videoName.trim() && (
              <div className="mb-6 text-center">
                <h3 className="text-lg font-semibold text-[#2D3142]">{videoName}</h3>
                <div className="w-12 h-0.5 bg-[#D5C4B7] mx-auto mt-2 rounded-full"></div>
              </div>
            )}
            
            {/* Disclaimer Text */}
            <div className="text-right text-[#3D3D3D] leading-relaxed space-y-3 text-sm">
              <p className="font-semibold text-base mb-4">הודעה חשובה לפני התחלת התרגול</p>
              
              <p>התרגול בסרטון זה הוא כללי ואינו מותאם אישית.</p>
              
              <p>ההשתתפות בתרגול היא באחריות המלאה של המתרגל/ת בלבד.</p>
              
              <p>לפני התחלת כל פעילות גופנית חדשה מומלץ להתייעץ עם רופא/ת משפחה או איש מקצוע מוסמך.</p>
              
              <p className="font-semibold">היוצר/ת של הסרטון לא יישא/תישא באחריות לכל פציעה, נזק או תוצאה שתיגרם בעקבות התרגול.</p>
            </div>
            
            {/* Continue Button */}
            <button
              onClick={() => {
                setDisclaimerFadingOut(true);
                setTimeout(() => {
                  setShowDisclaimer(false);
                }, 500);
              }}
              className="mt-6 bg-[#D5C4B7] hover:bg-[#B8A99C] text-[#2D3142] font-semibold py-3 px-8 rounded-full transition-all duration-300 shadow-lg hover:scale-105 active:scale-95"
            >
              המשך לסרטון
            </button>
            
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
