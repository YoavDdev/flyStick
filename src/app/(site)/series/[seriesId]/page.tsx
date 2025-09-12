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
      
      if (data.hasAccess) {
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
                    <div className="flex items-center gap-2 bg-[#D5C4B7]/20 px-4 py-2 rounded-xl border border-[#D5C4B7]/30">
                      <FaVideo className="text-[#B8A99C]" />
                      <span className="text-[#2D3142] font-medium">{accessData.series.videoCount} פרקים</span>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-gradient-to-r from-[#B8A99C]/20 to-[#D5C4B7]/20 px-4 py-2 rounded-xl border border-[#B8A99C]/30">
                      <span className="w-2 h-2 bg-[#B8A99C] rounded-full animate-pulse"></span>
                      <span className="text-[#2D3142] font-medium">
                        {accessData.accessType === 'subscription' ? '✨ כלול במנוי' : 
                         accessData.accessType === 'purchased' ? 'נרכש' : 
                         accessData.accessType === 'admin' ? '👑 גישת מנהל' : '🚀 גישה פעילה'}
                      </span>
                    </div>
                  </motion.div>

                  <motion.p
                    className="text-[#5D5D5D] text-lg leading-relaxed max-w-2xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    {accessData.series.description || "התחל את המסע שלך עם סדרת הווידאו המקצועית הזו. כל פרק בנוי בקפידה כדי לקחת אותך שלב אחר שלב לעומק הנושא."}
                  </motion.p>
                </div>

                <motion.div
                  className="flex flex-col gap-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <div className="bg-gradient-to-r from-[#B8A99C] to-[#D5C4B7] p-6 rounded-2xl text-center text-white shadow-xl">
                    <div className="text-3xl font-bold mb-1">{videos.length}</div>
                    <div className="text-sm opacity-90">סרטונים זמינים</div>
                  </div>
                  
                  <div className="bg-white/80 p-4 rounded-2xl text-center border border-[#D5C4B7]/30 shadow-lg">
                    <div className="text-xl font-bold text-[#2D3142] mb-1">∞</div>
                    <div className="text-xs text-[#5D5D5D]">גישה ללא הגבלה</div>
                  </div>
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
          <h3 className="text-2xl font-bold text-[#2D3142] mb-8 text-center">מה תקבלו בסדרה הזו</h3>
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
