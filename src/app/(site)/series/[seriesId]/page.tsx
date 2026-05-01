"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Link from "next/link";
import { FaArrowLeft, FaPlay, FaLock, FaVideo, FaClock } from "react-icons/fa";
import VideoCard from "@/app/components/VideoCard";
import VideoPlayer from "@/app/components/VideoPlayer";

interface SeriesAccess {
  hasAccess: boolean;
  accessType: string;
  reason: string;
  series: {
    id: string;
    title: string;
    description: string;
    price: number;
    videoCount: number;
    vimeoFolderId: string;
    vimeoFolderName: string;
    isComingSoon: boolean;
  };
}

interface Video {
  uri: string;
  name: string;
  description: string;
  duration: number;
  pictures: {
    sizes: Array<{
      width: number;
      height: number;
      link: string;
    }>;
  };
  embed: {
    html: string;
  };
}

const SeriesViewPage = () => {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const seriesId = params.seriesId as string;

  const [accessData, setAccessData] = useState<SeriesAccess | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [videosLoading, setVideosLoading] = useState(false);
  const [watchedVideos, setWatchedVideos] = useState<any[]>([]);
  const [expandedVideo, setExpandedVideo] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<{ embedHtml: string; uri: string; name: string } | null>(null);
  const [infoModal, setInfoModal] = useState<'videos' | 'access' | 'stats' | 'unlimited' | null>(null);

  useEffect(() => {
    if (seriesId) {
      checkAccess();
    }
  }, [seriesId]);

  const checkAccess = async () => {
    try {
      const response = await fetch(`/api/series/${seriesId}/access`);
      const data = await response.json();
      
      setAccessData(data);
      
      if (data.hasAccess && data.series.vimeoFolderId) {
        await fetchSeriesVideos(data.series.vimeoFolderId);
      }
    } catch (error) {
      console.error("Error checking access:", error);
      toast.error("שגיאה בבדיקת הגישה");
    } finally {
      setLoading(false);
    }
  };

  const fetchSeriesVideos = async (vimeoFolderId: string) => {
    try {
      setVideosLoading(true);
      const response = await fetch(`/api/vimeo/folders/${vimeoFolderId}/videos`);
      
      if (response.ok) {
        const data = await response.json();
        const sortedVideos = sortVideosByLessonNumber(data.videos || []);
        setVideos(sortedVideos);
        // Fetch watched videos for progress tracking
        fetchWatchedVideos();
      } else {
        toast.error("שגיאה בטעינת הסרטונים");
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
      toast.error("שגיאה בטעינת הסרטונים");
    } finally {
      setVideosLoading(false);
    }
  };

  const sortVideosByLessonNumber = (videos: Video[]) => {
    const hebrewNumbers: { [key: string]: number } = {
      'ראשון': 1, 'שני': 2, 'שלישי': 3, 'רביעי': 4, 'חמישי': 5,
      'שישי': 6, 'שביעי': 7, 'שמיני': 8, 'תשיעי': 9, 'עשירי': 10,
      'אחד עשר': 11, 'שנים עשר': 12, 'שלושה עשר': 13, 'ארבעה עשר': 14, 'חמישה עשר': 15
    };

    return videos.sort((a, b) => {
      // Extract lesson number from video name
      const getLessonNumber = (name: string) => {
        // Special case: "שיעור פתיחה" should always be first
        if (name.includes('שיעור פתיחה') || name.includes('פתיחה')) {
          return 0;
        }
        
        // Look for "שיעור" followed by Hebrew number
        const hebrewMatch = name.match(/שיעור\s+(\S+)/);
        if (hebrewMatch) {
          const hebrewNum = hebrewMatch[1];
          if (hebrewNumbers[hebrewNum]) {
            return hebrewNumbers[hebrewNum];
          }
        }
        
        // Look for numeric patterns like "שיעור 1", "1", etc.
        const numericMatch = name.match(/(\d+)/);
        if (numericMatch) {
          return parseInt(numericMatch[1]);
        }
        
        // Default to high number if no pattern found
        return 999;
      };

      return getLessonNumber(a.name) - getLessonNumber(b.name);
    });
  };

  const fetchWatchedVideos = async () => {
    try {
      const response = await fetch("/api/watched-videos");
      if (response.ok) {
        const data = await response.json();
        setWatchedVideos(data.watchedVideos || []);
      }
    } catch (error) {
      console.error("Error fetching watched videos:", error);
    }
  };

  const handlePlayVideo = (embedHtml: string, video?: any) => {
    if (video) {
      setSelectedVideo({
        embedHtml,
        uri: video.uri,
        name: video.name
      });
    }
  };

  const handleToggleDescription = (videoUri: string) => {
    setExpandedVideo(expandedVideo === videoUri ? null : videoUri);
  };

  const handleAddToFavorites = async (videoUri: string) => {
    try {
      const response = await fetch("/api/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoUri }),
      });

      if (response.ok) {
        toast.success("הסרטון נוסף למועדפים");
      } else {
        toast.error("שגיאה בהוספה למועדפים");
      }
    } catch (error) {
      console.error("Error adding to favorites:", error);
      toast.error("שגיאה בהוספה למועדפים");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-24">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#D5C4B7]"></div>
          <p className="mt-4 text-[#2D3142]">בודק הרשאות גישה...</p>
        </div>
      </div>
    );
  }

  if (!accessData?.hasAccess && accessData?.reason) {
    return (
      <div className="container mx-auto px-6 py-24">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#2D3142] mb-4">{accessData.reason.includes('התחברות') ? 'נדרשת התחברות' : 'אין גישה לסדרה'}</h1>
          <p className="text-[#5D5D5D] mb-6">{accessData.reason}</p>
          <Link href="/login">
            <motion.button
              className="bg-[#B8A99C] text-white px-6 py-3 rounded-lg hover:bg-[#D5C4B7] transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              התחבר
            </motion.button>
          </Link>
        </div>
      </div>
    );
  }

  // Coming Soon Series - Special Layout
  if (accessData?.series?.isComingSoon) {
    return (
      <div className="min-h-screen bg-[#F7F3EB] relative">
        {/* Background texture */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full bg-[url('/backgrounds/paper-texture.png')] bg-repeat opacity-30"></div>
        </div>
        
        <div className="container mx-auto px-6 py-24">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Back Button */}
            <div className="flex justify-start mb-8">
              <Link href="/series">
                <motion.button
                  className="flex items-center gap-2 text-[#2D3142] hover:text-[#B8A99C] transition-colors bg-white/80 px-4 py-2 rounded-xl backdrop-blur-sm border border-[#D5C4B7]/30 shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaArrowLeft />
                  <span>חזור לסדרות</span>
                </motion.button>
              </Link>
            </div>

            {/* Coming Soon Badge */}
            <motion.div
              className="inline-block bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-full text-lg font-bold mb-8 shadow-xl"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              🚀 בקרוב
            </motion.div>

            {/* Series Title */}
            <motion.h1 
              className="text-5xl lg:text-6xl font-bold text-[#2D3142] mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {accessData.series.title}
            </motion.h1>

            {/* Description */}
            <motion.div
              className="bg-white/90 backdrop-blur-xl rounded-3xl border border-[#D5C4B7]/30 p-8 shadow-2xl mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <p className="text-[#5D5D5D] text-xl leading-relaxed mb-6">
                {accessData.series.description || "סדרה מרגשת בדרך! אנחנו עובדים קשה כדי להביא תוכן איכותי ומקצועי."}
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 text-[#2D3142]">
                <div className="flex items-center gap-2 bg-[#D5C4B7]/20 px-4 py-2 rounded-xl">
                  <FaClock className="text-[#B8A99C]" />
                  <span>בהכנה</span>
                </div>
                <div className="flex items-center gap-2 bg-[#B8A99C]/20 px-4 py-2 rounded-xl">
                  <FaVideo className="text-[#B8A99C]" />
                  <span>תוכן מקצועי</span>
                </div>
              </div>
            </motion.div>

            {/* What to Expect */}
            <motion.div
              className="bg-white/90 backdrop-blur-xl rounded-3xl border border-[#D5C4B7]/30 p-8 shadow-2xl mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <h3 className="text-2xl font-bold text-[#2D3142] mb-6">מה לצפות</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-gradient-to-r from-[#B8A99C] to-[#D5C4B7] p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-xl">
                    <FaVideo className="text-white text-2xl" />
                  </div>
                  <h4 className="font-bold text-[#2D3142] mb-2">סרטונים איכותיים</h4>
                  <p className="text-[#5D5D5D]">תוכן מקצועי ומעמיק</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-gradient-to-r from-[#D5C4B7] to-[#B8A99C] p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-xl">
                    <FaPlay className="text-white text-2xl" />
                  </div>
                  <h4 className="font-bold text-[#2D3142] mb-2">גישה מיידית</h4>
                  <p className="text-[#5D5D5D]">ברגע שהסדרה תהיה מוכנה</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-gradient-to-r from-[#B8A99C]/80 to-[#D5C4B7]/80 p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-xl">
                    <FaClock className="text-white text-2xl" />
                  </div>
                  <h4 className="font-bold text-[#2D3142] mb-2">שווה ההמתנה</h4>
                  <p className="text-[#5D5D5D]">תוכן שיעזור להתקדם</p>
                </div>
              </div>
            </motion.div>

            {/* Call to Action */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
            >

            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!accessData?.hasAccess) {
    return (
      <div className="container mx-auto px-6 py-24">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
            <FaLock className="text-red-500 text-4xl mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[#2D3142] mb-4">אין גישה לסדרה</h1>
            <p className="text-[#5D5D5D] mb-6">{accessData?.reason}</p>
            
            <div className="space-y-3">
              <Link href="/series">
                <motion.button
                  className="w-full bg-[#B8A99C] text-white px-6 py-3 rounded-lg hover:bg-[#D5C4B7] transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  חזור לסדרות
                </motion.button>
              </Link>
              
              <Link href="/#Pricing">
                <motion.button
                  className="w-full bg-[#D5C4B7] text-[#2D3142] px-6 py-3 rounded-lg hover:bg-[#B8A99C] transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  הפעל מנוי
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F3EB] relative">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full bg-[url('/backgrounds/paper-texture.png')] bg-repeat opacity-30"></div>
      </div>
      
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#D5C4B7]/10 to-[#B8A99C]/10"></div>
        <div className="container mx-auto px-6 pt-20 pb-12 relative">
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <Link href="/series">
                <motion.button
                  className="flex items-center gap-2 text-[#2D3142] hover:text-[#B8A99C] transition-colors bg-white/80 px-4 py-2 rounded-xl backdrop-blur-sm border border-[#D5C4B7]/30 shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaArrowLeft />
                  <span>חזור לסדרות</span>
                </motion.button>
              </Link>
            </div>

            <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-[#D5C4B7]/30 p-8 shadow-2xl hover:shadow-3xl transition-all duration-500">
              <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
                <div className="flex-1">
                  <motion.h1 
                    className="text-4xl lg:text-5xl font-bold text-[#2D3142] mb-4 leading-tight"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {accessData.series.title}
                  </motion.h1>
                  
                  <motion.div 
                    className="flex flex-wrap items-center gap-6 text-[#5D5D5D] mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <motion.button
                      onClick={() => setInfoModal('videos')}
                      className="flex items-center gap-2 bg-[#D5C4B7]/20 px-4 py-2 rounded-xl border border-[#D5C4B7]/30 hover:bg-[#D5C4B7]/30 hover:border-[#D5C4B7]/50 transition-all cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaVideo className="text-[#B8A99C]" />
                      <span className="text-[#2D3142] font-medium">{accessData.series.videoCount} פרקים</span>
                    </motion.button>
                    
                    <motion.button
                      onClick={() => setInfoModal('access')}
                      className="flex items-center gap-2 bg-gradient-to-r from-[#B8A99C]/20 to-[#D5C4B7]/20 px-4 py-2 rounded-xl border border-[#B8A99C]/30 hover:from-[#B8A99C]/30 hover:to-[#D5C4B7]/30 hover:border-[#B8A99C]/50 transition-all cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="w-2 h-2 bg-[#B8A99C] rounded-full animate-pulse"></span>
                      <span className="text-[#2D3142] font-medium">
                        {accessData.accessType === 'subscription' ? '✨ כלול במנוי' : 
                         accessData.accessType === 'purchased' ? 'נרכש' : 
                         accessData.accessType === 'admin' ? '👑 גישת מנהל' : '🚀 גישה פעילה'}
                      </span>
                    </motion.button>
                  </motion.div>

                  <motion.p
                    className="text-[#5D5D5D] text-lg leading-relaxed max-w-2xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    {accessData.series.description || "סדרת ווידאו מקצועית למסע מעשיר. כל פרק בנוי בקפידה לליווי שלב אחר שלב לעומק הנושא."}
                  </motion.p>
                </div>

                <motion.div
                  className="flex flex-col gap-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <motion.button
                    onClick={() => setInfoModal('stats')}
                    className="bg-gradient-to-r from-[#B8A99C] to-[#D5C4B7] p-6 rounded-2xl text-center text-white shadow-xl hover:shadow-2xl transition-all cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="text-3xl font-bold mb-1">{videos.length}</div>
                    <div className="text-sm opacity-90">סרטונים זמינים</div>
                  </motion.button>
                  
                  <motion.button
                    onClick={() => setInfoModal('unlimited')}
                    className="bg-white/80 p-4 rounded-2xl text-center border border-[#D5C4B7]/30 shadow-lg hover:bg-white hover:shadow-xl transition-all cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="text-xl font-bold text-[#2D3142] mb-1">∞</div>
                    <div className="text-xs text-[#5D5D5D]">גישה ללא הגבלה</div>
                  </motion.button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Videos Section */}
      <div className="container mx-auto px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold text-[#2D3142] mb-8 text-center">פרקי הסדרה</h2>
          
          {videosLoading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#B8A99C]"></div>
              <p className="mt-4 text-[#5D5D5D] text-lg">טוען סרטונים...</p>
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-white/80 rounded-3xl p-12 border border-[#D5C4B7]/30 shadow-lg">
                <FaVideo className="text-6xl text-[#D5C4B7] mx-auto mb-4" />
                <p className="text-[#5D5D5D] text-lg">אין סרטונים זמינים בסדרה זו</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {videos.map((video, index) => (
                <motion.div
                  key={video.uri}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="group"
                >
                  <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-[#D5C4B7]/30 p-6 shadow-xl hover:shadow-2xl hover:border-[#B8A99C]/50 transition-all duration-500 h-full">
                    <VideoCard 
                      video={video}
                      watchedVideos={watchedVideos}
                      isExpanded={expandedVideo === video.uri}
                      onToggleDescription={() => handleToggleDescription(video.uri)}
                      onPlayVideo={(embedHtml) => handlePlayVideo(embedHtml, video)}
                      onAddToFavorites={handleAddToFavorites}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Enhanced Series Info */}
        <motion.div
          className="mt-16 bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-[#D5C4B7]/30 shadow-2xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-2xl font-bold text-[#2D3142] mb-8 text-center">מה כלול בסדרה</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              className="text-center group"
              whileHover={{ scale: 1.05 }}
            >
              <div className="bg-gradient-to-r from-[#B8A99C] to-[#D5C4B7] p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-xl group-hover:shadow-[#B8A99C]/25 transition-all duration-300">
                <FaVideo className="text-white text-2xl" />
              </div>
              <h4 className="font-bold text-[#2D3142] text-lg mb-2">סרטונים איכותיים</h4>
              <p className="text-[#5D5D5D]">{accessData.series.videoCount} שיעורים מקצועיים</p>
            </motion.div>
            
            <motion.div 
              className="text-center group"
              whileHover={{ scale: 1.05 }}
            >
              <div className="bg-gradient-to-r from-[#D5C4B7] to-[#B8A99C] p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-xl group-hover:shadow-[#D5C4B7]/25 transition-all duration-300">
                <FaPlay className="text-white text-2xl" />
              </div>
              <h4 className="font-bold text-[#2D3142] text-lg mb-2">גישה מיידית</h4>
              <p className="text-[#5D5D5D]">צפייה ללא הגבלת זמן</p>
            </motion.div>
            
            <motion.div 
              className="text-center group"
              whileHover={{ scale: 1.05 }}
            >
              <div className="bg-gradient-to-r from-[#B8A99C]/80 to-[#D5C4B7]/80 p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-xl group-hover:shadow-[#B8A99C]/25 transition-all duration-300">
                <FaClock className="text-white text-2xl" />
              </div>
              <h4 className="font-bold text-[#2D3142] text-lg mb-2">מעקב התקדמות</h4>
              <p className="text-[#5D5D5D]">נשמר אוטומטית</p>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Info Modal */}
      {infoModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setInfoModal(null)}
        >
          <motion.div
            className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-[#D5C4B7]/30 relative"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
          >
            <button
              onClick={() => setInfoModal(null)}
              className="absolute top-4 left-4 text-[#5D5D5D] hover:text-[#2D3142] text-2xl font-bold transition-colors"
            >
              ×
            </button>

            {infoModal === 'videos' && (
              <>
                <div className="bg-gradient-to-r from-[#D5C4B7] to-[#B8A99C] p-4 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-xl">
                  <FaVideo className="text-white text-3xl" />
                </div>
                <h3 className="text-2xl font-bold text-[#2D3142] mb-4 text-center">מידע על הסדרה</h3>
                <div className="space-y-4 text-[#5D5D5D] leading-relaxed">
                  <p>הסדרה כוללת <strong className="text-[#2D3142]">{accessData.series.videoCount} פרקים מקצועיים</strong> שנבנו בקפידה.</p>
                  <ul className="list-disc list-inside space-y-2 mr-4">
                    <li>כל פרק מתמקד בנושא ספציפי</li>
                    <li>מיועד ללמידה הדרגתית ועמוקה</li>
                    <li>מתאים לכל הרמות</li>
                    <li>תוכן עדכני ורלוונטי</li>
                  </ul>
                  <p className="text-sm bg-[#D5C4B7]/10 p-3 rounded-lg mt-4">
                    💡 <strong>טיפ:</strong> מומלץ לעבור על הפרקים לפי הסדר לחוויית למידה אופטימלית
                  </p>
                </div>
              </>
            )}

            {infoModal === 'access' && (
              <>
                <div className="bg-gradient-to-r from-[#B8A99C] to-[#D5C4B7] p-4 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-xl">
                  <span className="text-4xl">👑</span>
                </div>
                <h3 className="text-2xl font-bold text-[#2D3142] mb-4 text-center">סוג הגישה</h3>
                <div className="space-y-4 text-[#5D5D5D] leading-relaxed">
                  <div className="bg-gradient-to-r from-[#B8A99C]/10 to-[#D5C4B7]/10 p-4 rounded-xl border border-[#D5C4B7]/30">
                    <p className="text-center text-xl font-bold text-[#2D3142] mb-2">
                      {accessData.accessType === 'subscription' ? '✨ כלול במנוי' : 
                       accessData.accessType === 'purchased' ? '✅ נרכש' : 
                       accessData.accessType === 'admin' ? '👑 גישת מנהל' : '🚀 גישה פעילה'}
                    </p>
                  </div>
                  <p className="mt-4">גישה מלאה זמינה לכל התכנים בסדרה זו:</p>
                  <ul className="list-disc list-inside space-y-2 mr-4">
                    <li>צפייה בכל הפרקים ללא הגבלה</li>
                    <li>מעקב אחרי ההתקדמות</li>
                    <li>גישה מכל מכשיר</li>
                    <li>תמיכה טכנית מלאה</li>
                  </ul>
                  <p className="text-sm bg-[#B8A99C]/10 p-3 rounded-lg mt-4">
                    ✨ <strong>הערה:</strong> ההתקדמות נשמרת אוטומטית
                  </p>
                </div>
              </>
            )}

            {infoModal === 'stats' && (
              <>
                <div className="bg-gradient-to-r from-[#B8A99C] to-[#D5C4B7] p-4 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-xl">
                  <span className="text-4xl font-bold text-white">{videos.length}</span>
                </div>
                <h3 className="text-2xl font-bold text-[#2D3142] mb-4 text-center">סרטונים זמינים</h3>
                <div className="space-y-4 text-[#5D5D5D] leading-relaxed">
                  <p>בסדרה זו יש <strong className="text-[#2D3142]">{videos.length} סרטונים</strong> שכבר זמינים לצפייה מיידית.</p>
                  <div className="bg-[#D5C4B7]/10 p-4 rounded-xl">
                    <p className="text-sm">📊 <strong>סטטיסטיקה:</strong></p>
                    <ul className="text-sm mt-2 space-y-1">
                      <li>• {videos.length} סרטונים להשמעה</li>
                      <li>• איכות HD מלאה</li>
                      <li>• נגן וידאו מתקדם</li>
                    </ul>
                  </div>
                  <p className="text-sm bg-[#B8A99C]/10 p-3 rounded-lg mt-4">
                    🎯 <strong>התחל עכשיו:</strong> גלול למטה כדי לראות את כל הסרטונים
                  </p>
                </div>
              </>
            )}

            {infoModal === 'unlimited' && (
              <>
                <div className="bg-gradient-to-r from-[#D5C4B7] to-[#B8A99C] p-4 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-xl">
                  <span className="text-5xl font-bold text-white">∞</span>
                </div>
                <h3 className="text-2xl font-bold text-[#2D3142] mb-4 text-center">גישה ללא הגבלה</h3>
                <div className="space-y-4 text-[#5D5D5D] leading-relaxed">
                  <p>הסדרה לתמיד! <strong className="text-[#2D3142]">ללא הגבלת זמן או צפיות.</strong></p>
                  <ul className="list-disc list-inside space-y-2 mr-4">
                    <li><strong className="text-[#2D3142]">אין תפוגה</strong> - הסדרה לצמיתות</li>
                    <li><strong className="text-[#2D3142]">צפיות בלתי מוגבלות</strong> - ניתן לחזור כמה שרוצים</li>
                    <li><strong className="text-[#2D3142]">עדכונים עתידיים</strong> - אוטומטית וחינם</li>
                    <li><strong className="text-[#2D3142]">זמין תמיד</strong> - 24/7 מכל מקום</li>
                    <li><strong className="text-[#2D3142]">כל המכשירים</strong> - מחשב, טאבלט, נייד</li>
                  </ul>
                  <p className="text-sm bg-[#D5C4B7]/10 p-3 rounded-lg mt-4">
                    🌟 <strong>הבטחה:</strong> ברגע הרכישה, הסדרה שייכת לתמיד
                  </p>
                </div>
              </>
            )}

            <button
              onClick={() => setInfoModal(null)}
              className="mt-8 w-full bg-gradient-to-r from-[#B8A99C] to-[#D5C4B7] text-white py-3 rounded-xl font-medium hover:shadow-xl transition-all duration-300"
            >
              הבנתי, תודה!
            </button>
          </motion.div>
        </div>
      )}

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayer
          videoUri={selectedVideo.uri}
          embedHtml={selectedVideo.embedHtml}
          onClose={() => setSelectedVideo(null)}
          videoName={selectedVideo.name}
          isSubscriber={true}
        />
      )}
    </div>
  );
};

export default SeriesViewPage;
