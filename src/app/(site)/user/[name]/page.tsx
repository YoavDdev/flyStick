"use client";

import { FC, useEffect, useState, useRef } from "react";
import axios, { AxiosResponse } from "axios";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { toast } from "react-hot-toast";
// Removed direct Player import as we're using VideoPlayer component
import { FaTrash, FaPlay, FaEye, FaEyeSlash, FaArrowRight } from "react-icons/fa";
import { IoTime } from "react-icons/io5";
import NewVideoProgressBadge from "@/app/components/NewVideoProgressBadge";
import VideoPlayer from "@/app/components/VideoPlayer";
import VideoCard from "@/app/components/VideoCard";
import PlaylistModal from "@/app/components/PlaylistModal";
import { motion, AnimatePresence, Variants } from "framer-motion";

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

interface pageProps {
  params: { name: string };
}

const Page: FC<pageProps> = ({ params }) => {
  const value = params.name; // Extract the value
  const decodedString = decodeURIComponent(value);

  type WatchedVideo = {
    uri: string;
    progress: number;
    resumeTime?: number;
  };
  const [watchedVideos, setWatchedVideos] = useState<WatchedVideo[]>([]);  

  const [videos, setVideos] = useState<any[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedVideoUri, setSelectedVideoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLoading, setShowLoading] = useState(true); // Separate state for minimum loading duration
  const [selectedVideoData, setSelectedVideoData] = useState<any | null>(null);
  const [folderUrls, setFolderUrls] = useState<string[]>([]);
  const { data: session } = useSession();
  const [displayEmptyMessage, setDisplayEmptyMessage] = useState(false);
  const isVideoOpenRef = useRef<boolean>(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  const [resumeTime, setResumeTime] = useState<number>(0);
  const [expandedDescriptions, setExpandedDescriptions] = useState<boolean[]>(
    videos.map(() => false),
  );

  const handleBackButton = (event: PopStateEvent) => {
    if (isVideoOpenRef.current) {
      event.preventDefault(); // Prevent default action
      closeVideo(); // Close the video
    }
  };

  const openVideo = (embedHtml: string, videoUri: string) => {
    // Find if this video has been watched before and has a resumeTime
    const watchedVideo = watchedVideos.find(v => {
      // Extract video ID from both URIs for comparison
      const watchedVideoId = v.uri.split('/').pop();
      const currentVideoId = videoUri.split('/').pop();
      return watchedVideoId === currentVideoId;
    });
    
    if (watchedVideo && watchedVideo.resumeTime) {
      setResumeTime(watchedVideo.resumeTime);
    } else {
      setResumeTime(0); // Reset resume time if no previous watch history
    }
    
    setSelectedVideo(embedHtml);
    setSelectedVideoUri(videoUri);
    isVideoOpenRef.current = true;
    window.history.pushState({}, "Video", "");
  };

  const closeVideo = () => {
    setSelectedVideo(null);
    isVideoOpenRef.current = false;
    window.history.pushState({}, "");
  };
  

  useEffect(() => {
    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, []); // No dependencies needed here

  useEffect(() => {
    setLoading(true);
    if (session && session.user) {
      const folderName = decodeURIComponent(params.name);

      // Ensure loading animation shows for at least 4 seconds
      const minLoadingTimer = setTimeout(() => {
        setShowLoading(false);
      }, 4000);

      axios
        .post("/api/urls-video", {
          userEmail: session.user.email,
          folderName,
        })
        .then((response) => {
          if (response.status === 200) {
            setFolderUrls(response.data.newFolderUrls);
            fetchVideos(response.data.newFolderUrls);
          }
        })
        .catch((error) => {
          toast.error("שגיאה בטעינת הסרטונים");
        })
        .finally(() => {
          setLoading(false);
          // Set a timeout to display the empty message after 4 seconds
          setTimeout(() => setDisplayEmptyMessage(true), 4000);
        });
        
      return () => clearTimeout(minLoadingTimer);
    }
  }, [session, params.name]);

  const accessToken = process.env.VIMEO_TOKEN;
  const headers = {
    Authorization: `Bearer ${accessToken}`,
  };

  interface Video {
    uri: string;
    embedHtml: string;
    name: string;
    description: string;
    thumbnailUri: string;
    duration: number;
  }

  const fetchVideos = async (videoIds: string[]) => {
    try {
      const fetchedVideos: Video[] = [];

      for (const videoId of videoIds) {
        const apiUrl = `https://api.vimeo.com${videoId}`;
        const response: AxiosResponse = await axios.get(apiUrl, {
          headers,
          params: {
            fields: "uri,embed.html,name,description,pictures,duration", 
          },
        });

        const videoData = response.data;
        const video: Video = {
          uri: videoData.uri,
          embedHtml: videoData.embed.html,
          name: videoData.name,
          description: videoData.description,
          thumbnailUri: videoData.pictures.sizes[5].link,
          duration: videoData.duration,
        };

        fetchedVideos.push(video);
      }

      setVideos(fetchedVideos);
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  const [showFullDescription, setShowFullDescription] =
    useState<boolean>(false);

    const toggleDescription = (index: number) => () => {
      const newExpandedDescriptions = [...expandedDescriptions];
      newExpandedDescriptions[index] = !newExpandedDescriptions[index];
      setExpandedDescriptions(newExpandedDescriptions);
    };
  
  // Function to get video progress for the NewVideoProgressBadge
  const getVideoProgress = (uri: string): number => {
    // Extract video ID from URI if it's in the format like "/videos/123456789"
    const videoId = uri.match(/\/videos\/([0-9]+)/);
    const videoUri = videoId ? `/videos/${videoId[1]}` : uri;
    
    // Find the watched video by URI
    const watchedVideo = watchedVideos.find(v => {
      // Compare either direct match or ID match
      return v.uri === videoUri || v.uri === uri;
    });
    
    return watchedVideo ? watchedVideo.progress : 0;
  };

  const removeVideo = async (videoUri: any) => {
    try {
      const folderName = decodedString; // Get the folder name
      const userEmail = session?.user?.email;

      const response = await axios.delete("/api/delete-a-video", {
        data: {
          userEmail,
          folderName,
          videoUrl: videoUri, // Assuming videoUri is the URL of the video to remove
        },
      });

      if (response.status === 200) {
        // Video removed successfully, you can update the UI accordingly
        toast.success("Folder deleted");
        // Refresh the list of videos or perform any other necessary UI updates
        // For example, you can filter the videos array to remove the deleted video
        setVideos((prevVideos) =>
          prevVideos.filter((video) => video.uri !== videoUri),
        );
      }
    } catch (error) {
      console.error("Error removing video:", error);
      // Handle error, show a notification, or take appropriate action
    }
  };

  useEffect(() => {
    const fetchWatchedVideos = async () => {
      if (!session?.user) return;
      try {
        const res = await axios.post("/api/get-watched-videos", {
          userEmail: session.user.email,
        });
        if (res.status === 200) {
          setWatchedVideos(res.data.watchedVideos); // Array of videoUri strings
        }
      } catch (err) {
        console.error("Failed to fetch watched videos", err);
      }
    };

    fetchWatchedVideos();
  }, [session]);

  useEffect(() => {
    // This effect is now handled by the VideoPlayer component
  }, [selectedVideo]);
  
  // The toggleDescription function is already defined elsewhere in the file

  

  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [loading2, setLoading2] = useState(true);
  const [subscriptionId, setSubscriptionId] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (session?.user) {
          // Fetch user data including subscriptionId from the new API route
          const response = await axios.post("/api/get-user-subsciptionId", {
            userEmail: session.user.email,
          });

          const userData = response.data;

          // Extract subscriptionId from userData
          const subscriptionId = userData.subscriptionId;
          setSubscriptionId(subscriptionId);

          // Fetch subscription details using the retrieved subscriptionId
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

          // Update your database with the updated subscription status if needed
        }
      } catch (error) {
        console.error(
          "Error fetching user data or subscription details:",
          error,
        );
      } finally {
        // Set loading to false when the request is completed
        setLoading2(false);
      }
    };

    // Fetch user data when the component mounts or when the session changes
    fetchUserData();
  }, [session]);

  if (loading2) {
    // Display loading message while fetching videos
    return (
      <motion.div 
        className="bg-[#F7F3EB] min-h-screen text-[#2D3142] pt-20 pb-12"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="container mx-auto px-4 sm:px-6 relative">
          {/* Decorative elements for Wabi-Sabi style */}
          <div className="absolute -top-10 right-10 w-32 h-32 bg-[#D5C4B7] opacity-20 rounded-full blur-3xl"></div>
          <div className="absolute top-40 left-10 w-40 h-40 bg-[#B8A99C] opacity-10 rounded-full blur-3xl"></div>
          
          
        </div>
      </motion.div>
    );
  }

  // Check if the videos array is empty
  if (videos.length === 0 && !loading && displayEmptyMessage) {
    return (
      <motion.div 
        className="bg-[#F7F3EB] min-h-screen text-[#2D3142] pt-20 pb-12"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="container mx-auto px-4 sm:px-6 relative">
          {/* Decorative elements for Wabi-Sabi style */}
          <div className="absolute -top-10 right-10 w-32 h-32 bg-[#D5C4B7] opacity-20 rounded-full blur-3xl"></div>
          <div className="absolute top-40 left-10 w-40 h-40 bg-[#B8A99C] opacity-10 rounded-full blur-3xl"></div>
          
          <motion.div 
            className="relative z-10 mb-10 text-right"
            variants={itemVariants}
          >
            <h1 className="text-4xl font-bold text-[#2D3142] mb-4 text-center capitalize">
              {decodedString}
            </h1>
            
            <motion.div 
              className="flex justify-end mb-6"
              variants={itemVariants}
            >
              <motion.div
                whileHover={{ x: -5 }}
                whileTap={{ scale: 0.98 }}
              >
            <Link 
              href="/user" 
              className="text-[#2D3142] bg-[#D5C4B7]/50 hover:bg-[#D5C4B7] px-4 py-2 rounded-md transition-colors duration-300 flex items-center gap-2 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>חזרה לספירה שלי</span>
            </Link>
              </motion.div>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="col-span-full flex flex-col items-center justify-center py-20 text-center"
            variants={itemVariants}
          >
            <div className="w-20 h-20 bg-[#D5C4B7] rounded-full flex items-center justify-center mb-4">
              <IoTime size={32} className="text-[#2D3142]" />
            </div>
            <h3 className="text-xl font-medium text-[#2D3142] mb-2 capitalize">
              {decodedString} התיקייה ריקה
            </h3>
            <p className="text-[#3D3D3D] max-w-md">אין סרטונים בתיקייה זו כרגע</p>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  if (
    subscriptionId === "Admin" ||
    subscriptionStatus === "ACTIVE" ||
    subscriptionStatus === "PENDING_CANCELLATION"
  ) {
    // Render content for users with an active subscription

    return (
      <motion.div 
        className="bg-[#F7F3EB] min-h-screen text-[#2D3142] pt-20 pb-12"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="container mx-auto px-4 sm:px-6 relative">
          {/* Decorative elements for Wabi-Sabi style */}
          <div className="absolute -top-10 right-10 w-32 h-32 bg-[#D5C4B7] opacity-20 rounded-full blur-3xl"></div>
          <div className="absolute top-40 left-10 w-40 h-40 bg-[#B8A99C] opacity-10 rounded-full blur-3xl"></div>
          
          {/* Page header with Wabi-Sabi styling */}
          <motion.div 
            className="relative z-10 mb-10 text-right"
            variants={itemVariants}
          >
            <h1 className="text-4xl font-bold text-[#2D3142] mb-4 text-center capitalize">
              {decodedString}
            </h1>
            
            <motion.div 
              className="flex justify-end mb-6"
              variants={itemVariants}
            >
              <motion.div
                whileHover={{ x: -5 }}
                whileTap={{ scale: 0.98 }}
              >
            <Link 
              href="/user" 
              className="text-[#2D3142] bg-[#D5C4B7]/50 hover:bg-[#D5C4B7] px-4 py-2 rounded-md transition-colors duration-300 flex items-center gap-2 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>חזרה לספירה שלי</span>
            </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Video grid with Wabi-Sabi styling */}
          {(loading || showLoading) ? (
            // Loading animation matching explore/page.tsx style
            <motion.div 
              className="flex flex-col items-center justify-center py-20 text-center"
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
          ) : (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
              variants={containerVariants}
            >
              {videos.map((video, index) => (
                <motion.div
                  key={video.uri}
                  className="relative bg-white rounded-2xl overflow-hidden shadow-md"
                  variants={itemVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <div className="relative aspect-video overflow-hidden rounded-t-2xl">
                    {/* Paper texture overlay for Wabi-Sabi style */}
                    <div className="absolute inset-0 bg-[url('/paper-texture.png')] opacity-10 mix-blend-overlay z-10"></div>
                    
                    <img 
                      src={video.thumbnailUri || '/placeholder-thumbnail.jpg'} 
                      alt={video.name} 
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Progress badge positioned at upper right */}
                    <div className="absolute top-3 right-3 z-10">
                      <NewVideoProgressBadge 
                        progress={Math.min(Math.round(getVideoProgress(video.uri) || 0), 100)}
                        size="md"
                        variant="fancy"
                        showLabel={true}
                      />
                    </div>
                    
                    {/* Play button overlay */}
                    <div 
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer z-10"
                      onClick={() => openVideo(video.embedHtml, video.uri)}
                    >
                      <motion.div
                        className="bg-[#D9713C] text-white p-4 rounded-full"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FaPlay size={20} />
                      </motion.div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-white">
                    <h3 className="font-medium text-lg mb-2 line-clamp-2 text-[#2D3142]">{video.name}</h3>
                    
                    <div className="flex justify-between items-center mt-4">
                      <div className="text-sm text-[#3D3D3D]">
                        {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                      </div>
                      
                      <motion.button
                        title="הסר מהתיקייה"
                        className="text-[#3D3D3D] hover:text-[#D9713C] p-2 rounded-full transition-all duration-300"
                        onClick={() => removeVideo(video.uri)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FaTrash size={16} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
        
        {/* Video player using shared VideoPlayer component */}
        {selectedVideo && (
          <VideoPlayer
            videoUri={selectedVideoUri}
            embedHtml={selectedVideo}
            onClose={closeVideo}
            initialResumeTime={resumeTime}
            isSubscriber={true} // Assuming this page is for subscribers
            isAdmin={(session?.user as any)?.isAdmin}
          />
        )}
      </motion.div>
    );
  } else {
    // Render content for users without an active subscription
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
};

export default Page;
