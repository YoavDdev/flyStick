"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Link from "next/link";
import Player from "@vimeo/player";
import { FaEyeSlash, FaPlay, FaArrowRight, FaChevronDown } from "react-icons/fa";
import { IoTime } from "react-icons/io5";
import NewVideoProgressBadge from "@/app/components/NewVideoProgressBadge";
import { motion, AnimatePresence, Variants } from "framer-motion";
// WabiSabiHeading import removed

import VideoPlayer from "@/app/components/VideoPlayer";

// Animation variants for Wabi-Sabi style
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      when: "beforeChildren"
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
      ease: [0.25, 0.1, 0.25, 1.0] as [number, number, number, number]
    }
  },
  hover: {
    y: -5,
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  },
  tap: { scale: 0.98 }
};

const modalVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

const modalContentVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25
    }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.2 }
  }
};

const Page = () => {
  const { data: session } = useSession();
  const [videos, setVideos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoading, setShowLoading] = useState(true); // Separate state for minimum loading duration
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  
  // Loading states for different data fetching operations
  const [loadingStates, setLoadingStates] = useState({
    watchedVideos: true,
    userData: true,
    vimeoVideos: true,
    accessCheck: true
  });
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalVideos, setTotalVideos] = useState(0);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [resumeTime, setResumeTime] = useState<number>(0);
  const [selectedVideoUri, setSelectedVideoUri] = useState<string | null>(null);

  type WatchedVideo = {
    uri: string;
    progress: number;
    resumeTime?: number; // ✅ זה השדה החסר
  };
  const [watchedVideos, setWatchedVideos] = useState<WatchedVideo[]>([]);

  // Function to open a video with fresh watched data
  const openVideo = async (embedHtml: string) => {
    // Extract video URI from embed HTML
    const videoId = embedHtml.match(/player\.vimeo\.com\/video\/(\d+)/)?.[1];
    const videoUri = videoId ? `/videos/${videoId}` : null;
    
    if (videoUri && session?.user) {
      try {
        // Fetch fresh watched videos data from backend
        const res = await axios.post("/api/get-watched-videos", {
          userEmail: session.user.email,
        });
        
        if (res.status === 200) {
          // Update the watchedVideos state with fresh data
          setWatchedVideos(prev => {
            // Merge new data with existing data that's not in the current page
            const existingNotInResponse = prev.filter(v => 
              !res.data.watchedVideos.some((nv: WatchedVideo) => nv.uri === v.uri)
            );
            return [...existingNotInResponse, ...res.data.watchedVideos];
          });
          
          // Find this video in the fresh data
          const freshWatchedVideo = res.data.watchedVideos.find(
            (v: { uri: string; progress: number; resumeTime?: number }) => v.uri === videoUri
          );
          
          // Set resume time based on fresh data
          if (freshWatchedVideo && freshWatchedVideo.resumeTime) {
            setResumeTime(freshWatchedVideo.resumeTime);
          } else {
            setResumeTime(0);
          }
        }
      } catch (err) {
        console.error("Failed to fetch latest watched videos", err);
        // Fallback to existing data
        const watchedVideo = watchedVideos.find(v => v.uri === videoUri);
        if (watchedVideo && watchedVideo.resumeTime) {
          setResumeTime(watchedVideo.resumeTime);
        } else {
          setResumeTime(0);
        }
      }
    } else {
      setResumeTime(0);
    }
    
    // Set selected video and URI
    setSelectedVideo(embedHtml);
    setSelectedVideoUri(videoUri);
  };

  const fetchWatchedVideos = async (pageNum = 1, append = false) => {
    if (!session?.user?.email) {
      return;
    }
    
    if (pageNum === 1) {
      setIsLoading(true);
      setLoadingStates(prev => ({ ...prev, watchedVideos: true }));
    } else {
      setLoadingMore(true);
    }
    
    try {
      const email = String(session.user.email);
      
      const res = await axios.post("/api/get-watched-videos", {
        userEmail: email,
        page: pageNum,
        limit: 10
      });
      
      if (res.status === 200) {
        const newVideos = res.data.watchedVideos || [];
        
        // Update pagination info
        setHasMore(res.data.pagination.hasMore);
        setTotalVideos(res.data.pagination.total);
        setPage(res.data.pagination.page);
        
        // Update videos state (append or replace)
        if (append) {
          setWatchedVideos(prev => [...prev, ...newVideos]);
        } else {
          setWatchedVideos(newVideos);
        }
      }
    } catch (err: any) {
      toast.error("שגיאה בטעינת הסרטונים שנצפו");
    } finally {
      if (pageNum === 1) {
        setLoadingStates(prev => ({ ...prev, watchedVideos: false }));
      }
      setIsLoading(false);
      setLoadingMore(false);
    }
  };

  // Fetch subscription status
  useEffect(() => {
    const fetchUserData = async () => {
      setLoadingStates(prev => ({ ...prev, userData: true }));
      try {
        if (session?.user) {
          // Fetch user data including subscriptionId from the API route
          const response = await axios.post("/api/get-user-subsciptionId", {
            userEmail: session.user.email,
          });

          const userData = response.data;

          // Extract subscriptionId from userData
          const subscriptionId = userData.subscriptionId;
          setSubscriptionId(subscriptionId);

          const clientId = process.env.PAYPAL_CLIENT_ID;
          const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

          const auth = {
            username: clientId!,
            password: clientSecret!,
          };

          const subscriptionResponse = await axios.get(
            `https://api.paypal.com/v1/billing/subscriptions/${subscriptionId}`,
            { auth },
          );

          const status = subscriptionResponse.data.status;
          setSubscriptionStatus(status);
        }
      } catch (error) {
        console.error(
          "Error fetching user data or subscription details:",
          error,
        );
      } finally {
        setLoadingStates(prev => ({ ...prev, userData: false }));
      }
    };

    // Fetch user data when the component mounts or when the session changes
    fetchUserData();
  }, [session]);

  // Initial load
  useEffect(() => {
    if (session?.user?.email) {
      fetchWatchedVideos(1, false);
      
      // Ensure loading animation shows for at least 2 seconds
      const minLoadingTimer = setTimeout(() => {
        setShowLoading(false);
      }, 2000);
      
      return () => clearTimeout(minLoadingTimer);
    }
  }, [session]);
  
  // Check if all loading operations are complete
  useEffect(() => {
    const allLoadingComplete = !Object.values(loadingStates).some(loading => loading);
    if (allLoadingComplete && !showLoading) {
      setIsLoading(false);
    }
  }, [loadingStates, showLoading]);

  useEffect(() => {
    if (selectedVideo && videoContainerRef.current) {
      const uri = selectedVideo.match(/player\.vimeo\.com\/video\/(\d+)/)?.[1];
      if (!uri) return;

      const vimeoPlayer = new Player(videoContainerRef.current, {
        id: Number(uri),
        width: 640,
      });

      setPlayer(vimeoPlayer);

      // Resume from saved time
      vimeoPlayer.on("loaded", async () => {
        const uri = selectedVideo.match(
          /player\.vimeo\.com\/video\/(\d+)/,
        )?.[1];
        const videoUri = uri ? `/videos/${uri}` : null;
        const resumeFrom =
          watchedVideos.find((v) => v.uri === videoUri)?.resumeTime ?? 0;

        try {
          if (resumeFrom > 0) {
            await vimeoPlayer.setCurrentTime(resumeFrom);
          }
          await vimeoPlayer.play();
        } catch (err) {
          console.error("❌ Failed to resume video:", err);
        }
      });

      // Update the resume time on pause or timeupdate
      let lastSaved = 0; // מחוץ ל-vimeoPlayer.on

      const saveProgress = async (force = false) => {
        const now = Date.now();
        if (!force && now - lastSaved < 30000) return; // כל 30 שניות - מופחת עומס CPU
        lastSaved = now;

        const currentTime = await vimeoPlayer.getCurrentTime();
        const duration = await vimeoPlayer.getDuration();
        const percent = Math.floor((currentTime / duration) * 100);
        const videoUri = `/videos/${uri}`;

        if (session?.user && videoUri) {
          try {
            await axios.post("/api/mark-watched", {
              userEmail: session.user.email,
              videoUri,
              progress: percent,
              resumeTime: currentTime,
            });

            setWatchedVideos((prev) => {
              const existing = prev.find((v) => v.uri === videoUri);
              if (existing) {
                return prev.map((v) =>
                  v.uri === videoUri
                    ? { ...v, progress: percent, resumeTime: currentTime }
                    : v,
                );
              } else {
                return [
                  ...prev,
                  { uri: videoUri, progress: percent, resumeTime: currentTime },
                ];
              }
            });
          } catch (err) {
            console.error("❌ Failed to save progress:", err);
          }
        }
      };

      vimeoPlayer.on("timeupdate", () => saveProgress());
      vimeoPlayer.on("pause", () => saveProgress(true));
      window.addEventListener("beforeunload", () => saveProgress(true));

      // Optional: auto play
      vimeoPlayer.play();

      return () => {
        // Properly destroy player and remove event listeners to prevent memory leaks
        vimeoPlayer.destroy();
        window.removeEventListener("beforeunload", () => saveProgress(true));
      };
    }
  }, [selectedVideo]);

  const handleUnwatch = async (uri: string) => {
    if (!session?.user?.email) {
      return;
    }
    
    try {
      // Use DELETE method with query parameters as expected by the API
      const res = await axios.delete(`/api/mark-watched?userEmail=${encodeURIComponent(session.user.email)}&videoUri=${encodeURIComponent(uri)}`);
      
      if (res.status === 200) {
        // Update local state by filtering out the removed video
        setWatchedVideos(prev => prev.filter(video => video.uri !== uri));
        setVideos(prev => prev.filter(video => video.uri !== uri));
        
        toast.success("הסרטון הוסר מרשימת הצפייה");
      }
    } catch (error: any) {
      console.error("Error removing video from watched list:", error);
      toast.error("שגיאה בהסרת הסרטון מרשימת הצפייה");
    }
  };

  useEffect(() => {
    const fetchVimeoVideos = async () => {
      if (watchedVideos.length === 0) {
        setLoadingStates(prev => ({ ...prev, vimeoVideos: false }));
        return;
      }
      
      setLoadingStates(prev => ({ ...prev, vimeoVideos: true }));
      try {
        // Extract video IDs from URIs
        const videoIds = watchedVideos.map(({ uri }) => {
          if (!uri || typeof uri !== 'string') return null;
          return uri;
        }).filter(Boolean); // Remove any null values
        
        // Call our server-side proxy API instead of Vimeo directly
        const res = await axios.post("/api/vimeo-proxy", { videoIds });
        
        if (res.status === 200 && res.data.videos) {
          // Merge the video data with our progress information
          const mergedVideos = res.data.videos.map((video: any) => {
            // Find matching watched video entry to get progress
            const watchedEntry = watchedVideos.find(w => w.uri === video.uri);
            if (watchedEntry) {
              return {
                ...video,
                progress: watchedEntry.progress || 0,
                resumeTime: watchedEntry.resumeTime ?? 0,
              };
            }
            return video;
          });
          
          // If we're loading more, append to existing videos
          if (page > 1) {
            // Filter out duplicates by URI
            const existingUris = new Set(videos.map((v: any) => v.uri));
            const uniqueNewVideos = mergedVideos.filter((v: any) => !existingUris.has(v.uri));
            setVideos(prev => [...prev, ...uniqueNewVideos]);
          } else {
            setVideos(mergedVideos);
          }
        }
      } catch (error: any) {
        toast.error("שגיאה בטעינת פרטי הסרטונים");
      } finally {
        setLoadingStates(prev => ({ ...prev, vimeoVideos: false }));
      }
    };

    fetchVimeoVideos();
  }, [watchedVideos, page]);

  // Check if all loading operations are complete
  // Check if user has admin access, active subscription, or is a free/trial user
  const [hasContentAccess, setHasContentAccess] = useState(false);
  
  // Update access status when session changes
  useEffect(() => {
    const checkAccess = async () => {
      setLoadingStates(prev => ({ ...prev, accessCheck: true }));
      if (session?.user?.email) {
        try {
          // Check if user has admin access or is free/trial user
          const adminCheckResponse = await axios.post("/api/check-admin", {
            email: session.user.email,
          });
          
          // Set content access based on response
          setHasContentAccess(adminCheckResponse.data.hasContentAccess);
        } catch (error) {
          console.error("Error checking access:", error);
        }
      }
      setLoadingStates(prev => ({ ...prev, accessCheck: false }));
    };
    
    checkAccess();
  }, [session]);
  
  // Check if user is a subscriber, admin, or has free/trial access for VideoPlayer component
  const isSubscriber = 
    hasContentAccess ||
    subscriptionId === "Admin" ||
    subscriptionStatus === "ACTIVE" ||
    subscriptionStatus === "PENDING_CANCELLATION";
  
  // If not a subscriber, admin, or free/trial user, show the inactive subscription message
  if (!isSubscriber && !(session?.user as any)?.isAdmin) {
    return (
      <div className="min-h-screen bg-[#F7F3EB] pt-20 px-4">
        <div className="max-w-2xl mx-auto bg-[#F0E9DF] rounded-2xl shadow-md border border-[#D5C4B7] p-8 text-center mt-10">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#D5C4B7]/50 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#2D3142]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-4xl font-semibold text-[#2D3142] mb-6">
            המנוי אינו פעיל
          </h1>
          <p className="text-[#2D3142] mb-8 text-lg">
            כדי לצפות בתכנים שלנו, נדרש מנוי פעיל
          </p>
          <div className="mt-10 flex items-center justify-center">
            <a
              href="/#Pricing"
              className="rounded-lg bg-[#D5C4B7] hover:bg-[#B8A99C] px-8 py-4 text-lg text-[#2D3142] shadow-md hover:shadow-lg transition-all duration-300 font-medium"
            >
              הירשם כאן
            </a>
          </div>
        </div>
      </div>
    );
  }
  
  // If user is a subscriber, show the watched videos content
  return (
    <motion.div 
      className="bg-[#F7F3EB] min-h-screen text-[#2D3142] pt-20 pb-12 overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >

      
      {/* Paper texture removed */}
      
      <div className="container mx-auto px-4 sm:px-6 relative">
        {/* Decorative elements for Wabi-Sabi style */}
        <div className="absolute -top-10 right-10 w-32 h-32 bg-[#D5C4B7] opacity-20 rounded-full blur-3xl"></div>
        <div className="absolute top-40 left-10 w-40 h-40 bg-[#B8A99C] opacity-10 rounded-full blur-3xl"></div>
        
        {/* Page header matching user/[name]/page.tsx style */}
        <motion.div 
          className="relative z-10 mb-10 text-right"
          variants={itemVariants}
        >
          <h1 className="text-4xl font-semibold text-[#2D3142] mb-6 text-center">
            שיעורים שצפית
          </h1>
          
          <motion.div 
            className="flex justify-end mb-6"
            variants={itemVariants}
          >
            <motion.div
              whileHover={{ x: -5, opacity: 0.9 }}
              whileTap={{ scale: 0.97 }}
              className="relative overflow-hidden"
            >
            <Link 
              href="/user" 
              className="text-[#2D3142] bg-[#D5C4B7]/50 hover:bg-[#D5C4B7] px-4 py-2 rounded-md transition-colors duration-300 flex items-center gap-2 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>חזרה לספרייה שלי</span>
            </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Video grid with Wabi-Sabi styling */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
          variants={containerVariants}
        >
          {(isLoading || showLoading) ? (
            /* Loading animation matching explore/page.tsx style */
            <motion.div 
              className="col-span-full flex flex-col items-center justify-center py-20 text-center"
              variants={itemVariants}
            >
              <div className="flex justify-center items-center">
                <div className="w-16 h-16 border-4 border-[#D5C4B7] border-t-[#B8A99C] rounded-full animate-spin"></div>
              </div>
              
              <motion.p 
                className="text-[#3D3D3D] mt-6 max-w-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                טוען את הסרטונים...
              </motion.p>
            </motion.div>
          ) : videos.length === 0 && !isLoading ? (
            <motion.div 
              className="col-span-full flex flex-col items-center justify-center py-24 text-center relative"
              variants={itemVariants}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
            >
              {/* Enhanced background decorative elements */}

              
              {/* Paper texture removed */}
              
              {/* Decorative background elements */}
              <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-[#D5C4B7] opacity-10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-1/3 left-1/4 w-48 h-48 bg-[#B8A99C] opacity-15 rounded-full blur-3xl"></div>
              <div className="absolute top-2/3 right-1/3 w-32 h-32 bg-[#D9713C] opacity-5 rounded-full blur-3xl"></div>
              
              {/* Empty state icon with enhanced paper texture and gradient */}
              <motion.div 
                className="relative w-36 h-36 mb-8"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.2 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#D5C4B7] to-[#B8A99C] rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                  {/* Paper texture removed */}
                  <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="relative z-10"
                  >
                  </motion.div>
                </div>
                
                {/* Enhanced decorative circles with more organic animation */}
                <motion.div 
                  className="absolute -z-10 w-full h-full rounded-full bg-[#D5C4B7] opacity-20"
                  animate={{ 
                    scale: [1, 1.15, 1],
                    x: [0, 5, 0, -5, 0],
                    y: [0, -5, 0, 5, 0]
                  }}
                  transition={{ 
                    duration: 6, 
                    // Removed infinite animation to prevent CPU/GPU overheating
                    ease: "easeInOut",
                    times: [0, 0.25, 0.5, 0.75, 1]
                  }}
                />
                <motion.div 
                  className="absolute -z-10 w-full h-full rounded-full bg-[#D9713C] opacity-5"
                  animate={{ 
                    scale: [1, 1.3, 1],
                    x: [0, -5, 0, 5, 0],
                    y: [0, 5, 0, -5, 0]
                  }}
                  transition={{ 
                    duration: 8, 
                    // Removed infinite animation to prevent CPU/GPU overheating
                    ease: "easeInOut", 
                    delay: 0.5,
                    times: [0, 0.25, 0.5, 0.75, 1]
                  }}
                />
              </motion.div>
              
              {/* Enhanced heading with accent */}
              <h3 className="text-2xl font-bold text-[#2D3142] text-center mb-4 relative">
                {/* Accent line to replace WabiSabiHeading accent */}
                <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 h-1 w-16 bg-[#D9713C] rounded-full"></span>
                אין שיעורים שנצפו עדיין
              </h3>
              
              {/* Enhanced message with better paper texture styling */}
              <motion.div 
                className="text-[#3D3D3D] max-w-md font-light bg-white bg-opacity-60 px-8 py-4 rounded-2xl shadow-md relative overflow-hidden mb-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, type: "spring", stiffness: 100, damping: 15 }}
              >
                {/* Paper texture removed */}
                <p className="relative z-10">
                  השיעורים שתצפה בהם יופיעו כאן לצפייה מחדש
                </p>
              </motion.div>
              
              {/* Added call-to-action button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, type: "spring", stiffness: 100, damping: 15 }}
                className="relative overflow-hidden"
              >
                <Link
                  href="/explore"
                  className="flex items-center gap-2 bg-gradient-to-r from-[#D5C4B7] to-[#B8A99C] text-[#2D3142] px-6 py-3 rounded-full shadow-md relative overflow-hidden group"
                >
                  {/* Paper texture removed */}
                  <motion.span 
                    className="relative z-10 font-medium"
                    whileHover={{ opacity: 0.9 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    גלה שיעורים חדשים
                  </motion.span>
                  <motion.div
                    className="relative z-10"
                    animate={{ x: [0, 5, 0] }}
                    // Removed infinite animation to prevent CPU/GPU overheating
                  >
                    <FaArrowRight size={16} />
                  </motion.div>
                </Link>
              </motion.div>
            </motion.div>
          ) : (
            videos.map((video, index) => (
              <motion.div
                key={video.uri}
                className="relative bg-white rounded-2xl overflow-hidden shadow-md border border-[#D5C4B7] border-opacity-30"
                variants={itemVariants}
                whileHover="hover"
                whileTap="tap"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 100, 
                  damping: 15,
                  delay: index * 0.1
                }}
              >
                {/* Paper texture overlay for Wabi-Sabi style */}
                {/* Paper texture removed */}
                
                <div className="flex flex-col h-full">
                  {/* Video thumbnail with progress indicator */}
                  <div
                    className="relative aspect-w-16 aspect-h-9 cursor-pointer group"
                    onClick={() => setSelectedVideo(video.embedHtml)}
                  >
                    <img
                      src={video.thumbnailUri}
                      alt={video.name}
                      className="object-cover w-full h-full rounded-t-2xl transition-all duration-500 group-hover:opacity-90 "
                    />
                    
                    {/* Play overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                      <motion.div 
                        className="bg-[#D9713C] bg-opacity-90 w-16 h-16 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg"
                        whileHover={{ opacity: 0.9 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="absolute inset-0 bg-[url('/paper-texture.png')] opacity-10 mix-blend-overlay rounded-full"></div>
                        <FaPlay size={20} className="text-white ml-1" />
                      </motion.div>
                    </div>
                    
                    {/* Progress badge positioned at bottom right */}
                    <div className="absolute bottom-3 right-3 z-10">
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.1 + 0.3 }}
                      >
                        <NewVideoProgressBadge 
                          progress={Math.min(Math.round(video.progress || 0), 100)}
                          size="md"
                          variant="fancy"
                          showLabel={true}
                        />
                      </motion.div>
                    </div>
                  </div>

                  {/* Video info */}
                  <div className="flex-1 flex flex-col justify-between p-5 relative">
                    {/* Subtle decorative element */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#D5C4B7] opacity-5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    <div>
                      <h2 className="text-lg font-medium text-[#2D3142] mb-1 line-clamp-2 font-heebo relative z-10">
                        {video.name}
                      </h2>
                      
                      <div className="inline-flex items-center text-sm text-[#3D3D3D] opacity-80 mb-3 bg-[#F7F3EB] bg-opacity-50 px-2 py-1 rounded-full w-auto">
                        <IoTime size={14} className="ml-1 text-[#D9713C]" />
                        <span>משך: {Math.ceil(video.duration / 60)} דקות</span>
                      </div>
                      
                      {video.description && (
                        <p className="text-sm text-[#3D3D3D] line-clamp-2">
                          {video.description}
                        </p>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex justify-between items-center pt-4 mt-2 border-t border-[#D5C4B7] border-opacity-30">
                      <motion.button
                        title="נגן"
                        className="bg-[#D5C4B7] hover:bg-[#B8A99C] text-[#2D3142] px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium transition-all duration-300 shadow-sm relative overflow-hidden"
                        onClick={() => openVideo(video.embedHtml)}
                        whileHover={{ opacity: 0.9 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="absolute inset-0 bg-[url('/paper-texture.png')] opacity-10 mix-blend-overlay"></div>
                        <FaPlay size={12} />
                        <span className="font-heebo">נגן שוב</span>
                      </motion.button>

                      <motion.button
                        title="הסר סימון כנצפה"
                        className="text-[#3D3D3D] hover:text-[#D9713C] p-2 rounded-full transition-all duration-300 bg-[#F7F3EB] bg-opacity-50 hover:bg-opacity-70"
                        onClick={() => handleUnwatch(video.uri)}
                        whileHover={{ opacity: 0.9 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FaEyeSlash size={16} />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>

      {/* Video player using shared VideoPlayer component */}
      {selectedVideo && (
        <VideoPlayer
          videoUri={selectedVideoUri}
          embedHtml={selectedVideo}
          onClose={() => {
            setSelectedVideo(null);
            setSelectedVideoUri(null);
          }}
          initialResumeTime={resumeTime}
          isSubscriber={true} // Assuming watched videos are for subscribers
          isAdmin={(session?.user as any)?.isAdmin}
        />
      )}
      {/* Load More Button */}
      {hasMore && videos.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center mt-8 mb-12"
        >
          <motion.button
            onClick={() => fetchWatchedVideos(page + 1, true)}
            disabled={loadingMore}
            className="px-6 py-3 bg-[#D5C4B7] hover:bg-[#B8A99C] text-[#2D3142] rounded-full shadow-md transition-all duration-300 flex items-center space-x-2 disabled:opacity-50 relative overflow-hidden"
            whileHover={{ opacity: 0.9 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            {/* Paper texture removed */}
            {loadingMore ? (
              <>
                <motion.div 
                  className="relative h-6 w-6 ml-2"
                  animate={{ rotate: 360 }}
                  // Removed infinite animation to prevent CPU/GPU overheating
                >
                  <div className="absolute inset-0 rounded-full border-2 border-[#2D3142] border-t-transparent" />
                </motion.div>
                <span className="font-heebo">טוען...</span>
              </>
            ) : (
              <>
                <span className="font-heebo">טען עוד</span>
                <motion.div
                  animate={{ y: [0, 3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <FaChevronDown className="mr-1" />
                </motion.div>
              </>
            )}
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Page;
