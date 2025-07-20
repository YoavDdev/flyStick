"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import Player from "@vimeo/player";
import { FaPlay, FaEye, FaEyeSlash, FaPlus, FaSearch } from "react-icons/fa";
import { motion } from "framer-motion";
import VideoPlayer from "@/app/components/VideoPlayer";
import PlaylistModal from "@/app/components/PlaylistModal";
import VideoCard from "@/app/components/VideoCard";
import SearchBar from "@/app/components/SearchBar";
import Image from "next/image";
import { useVideoPlayer } from "../context/VideoPlayerContext";

interface ExploreVideosProps {
  title?: string;
  subtitle?: string;
  initialSearchQuery?: string;
  initialHashtag?: string;
  className?: string;
}

const ExploreVideos = ({
  title = "",
  subtitle = "",
  initialSearchQuery = "",
  initialHashtag = "",
  className = "",
}: ExploreVideosProps) => {
  type WatchedVideo = {
    uri: string;
    progress: number;
    resumeTime?: number;
  };
  const [watchedVideos, setWatchedVideos] = useState<WatchedVideo[]>([]);

  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [resumeTime, setResumeTime] = useState<number>(0);

  const [videos, setVideos] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedVideoUri, setSelectedVideoUri] = useState<string>("");
  const [selectedVideoData, setSelectedVideoData] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery);
  const [showHashtagDropdown, setShowHashtagDropdown] = useState(false);
  const { data: session } = useSession();
  const [showModal, setShowModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [playlistName, setPlaylistName] = useState("");
  const [folderNames, setFolderNames] = useState<string[]>([]);
  const [expandedDescriptions, setExpandedDescriptions] = useState<boolean[]>([]);
  const [noResults, setNoResults] = useState(false);
  const [noMoreVideos, setNoMoreVideos] = useState<boolean>(false);
  const isVideoOpenRef = useRef<boolean>(false);
  const [isSubscriber, setIsSubscriber] = useState<boolean>(false);
  const hashtagOptions = [
    "הריון לידה",
    "רצפת אגן",
    "עריסת אגן",
    "בריאות האשה",
    "עמוד שדרה",
    "סנכרון",
    "זרימה",
    "ליבה",
    "רקמות",
    "פאשיה",
    "משטחים",
    "פושאנפול",
    "נשימה",
    "קול",
    "יציבה",
    "סקרבינג",
    "שיעור  פתיחה",
    "שכמות",
    "חגורת כתפיים",
    "כתפיים",
    "פלג גוף עליון",
    "שורשים",
    "שורש כף יד",
    "ניעורים",
    "ניעורי גוף",
    "צוואר",
    "Flystick",
    "אקסטנשיין",
    "פלקשיין",
    "גב",
    "רגליים",
    "ברכיים",
    "פלג גוף תחתון",
    "אגן",
    "גב תחתון",
    "בטן",
    "אלכסונים",
  ];

  // Define these functions before they're used in useEffect
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setNoMoreVideos(false);
    fetchVideos(1);
  };

  const fetchWatchedVideos = async () => {
    if (!session?.user?.email) return;

    try {
      const response = await axios.get("/api/watched-videos", {
        params: { email: session.user.email },
      });
      setWatchedVideos(response.data);
    } catch (error) {
      console.error("Error fetching watched videos:", error);
    }
  };

  const fetchUserData = async () => {
    if (!session?.user?.email) return;

    try {
      const response = await axios.get("/api/user", {
        params: { email: session.user.email },
      });

      if (response.data) {
        // Check if the user is a subscriber
        const userData = response.data;
        setIsSubscriber(userData.isSubscriber || false);

        // Get folder names for the user
        if (userData.folders) {
          setFolderNames(userData.folders.map((folder: any) => folder.name));
        } else {
          // Fetch folders separately if not included in user data
          const foldersResponse = await axios.get("/api/folders", {
            params: { email: session.user.email },
          });

          if (foldersResponse.data && foldersResponse.data.length > 0) {
            const names = foldersResponse.data.map(
              (folder: any) => folder.name
            );
            setFolderNames(names);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      // Set default values in case of error
      setIsSubscriber(false);
      setFolderNames([]);
    }
  };

  useEffect(() => {
    // Initialize with any initial hashtag if provided
    if (initialHashtag) {
      setSearchQuery(`# ${initialHashtag}`);
      handleSearch({ preventDefault: () => {} } as React.FormEvent);
    } else {
      fetchVideos(1);
    }
    
    // Only fetch watched videos and user data if there's a session
    if (session) {
      fetchWatchedVideos();
      fetchUserData();
    } else {
      // Set default values for non-logged in users
      setIsSubscriber(false);
      setWatchedVideos([]);
      setFolderNames([]);
    }
  }, [initialHashtag, session]);

  useEffect(() => {
    function preventDefault(e: Event) {
      e.preventDefault();
    }

    // Add event listener to prevent scrolling when modal is open
    if (selectedVideo) {
      document.body.style.overflow = "hidden";
      document.addEventListener("wheel", preventDefault, { passive: false });
    } else {
      document.body.style.overflow = "";
      document.removeEventListener("wheel", preventDefault);
    }

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("wheel", preventDefault);
    };
  }, [selectedVideo]);

  useEffect(() => {
    // Handle back button for video player
    const handleBackButton = (event: PopStateEvent) => {
      if (isVideoOpenRef.current) {
        closeVideo();
        isVideoOpenRef.current = false;
      }
    };

    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    setNoMoreVideos(false);
    fetchVideos(1);
  }, [initialSearchQuery, initialHashtag]);

  const { setIsVideoOpen } = useVideoPlayer();

  const openVideo = useCallback((embedHtml: string, videoUri: string) => {
    // Find if this video has been watched before
    const watchedVideo = watchedVideos.find((v) => v.uri === videoUri);
    
    // Set resume time if available
    if (watchedVideo && watchedVideo.resumeTime) {
      setResumeTime(watchedVideo.resumeTime);
    } else {
      setResumeTime(0);
    }
    
    // Set the selected video
    setSelectedVideo(embedHtml);
    setSelectedVideoUri(videoUri);
    
    // Push state to handle back button
    window.history.pushState({ videoOpen: true }, "");
    isVideoOpenRef.current = true;
    setIsVideoOpen(true);
  }, [watchedVideos, setIsVideoOpen]);

  const closeVideo = useCallback(async () => {
    isVideoOpenRef.current = false;
    setSelectedVideo(null);
    window.history.replaceState({}, "", window.location.pathname);
    setIsVideoOpen(false);
  }, [setIsVideoOpen]);

  const theUserId = async () => {
    if (!session?.user?.email) {
      toast.error("יש להתחבר כדי להוסיף לרשימות");
      return;
    }

    try {
      const response = await axios.get("/api/user", {
        params: { email: session.user.email },
      });

      if (response.data && response.data.folders) {
        setFolderNames(response.data.folders.map((folder: any) => folder.name));
      }
      
      return session.user.email;
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("שגיאה בטעינת נתוני משתמש");
      return null;
    }
  };

  const fetchVideos = async (page: number) => {
    try {
      // Use our server-side API proxy to securely call the Vimeo API
      const apiUrl = "/api/videos";
      
      // Use the same query parameters structure
      let query = "";
      if (searchQuery.startsWith("# ")) {
        // Handle hashtag search by looking for videos with the hashtag in description
        query = searchQuery.substring(2);
      } else if (searchQuery) {
        query = searchQuery;
      }

      const response = await axios.get(apiUrl, {
        params: {
          page,
          query,
        },
      });

      const data = response.data;
      const videosData = data.data;

      if (videosData.length === 0 && page === 1) {
        // No results found for the search query
        setNoResults(true);
        setVideos([]);
        return false; // No more videos to load
      } else {
        setNoResults(false);
      }

      // If this is the first page, replace the videos array
      // Otherwise, append the new videos to the existing array
      if (page === 1) {
        setVideos(videosData);
      } else {
        setVideos((prevVideos) => [...prevVideos, ...videosData]);
      }

      // If we received fewer videos than expected, there are no more to load
      if (videosData.length < 20) {
        setNoMoreVideos(true);
      }

      // Initialize expanded descriptions state for the new videos
      if (page === 1) {
        setExpandedDescriptions(new Array(videosData.length).fill(false));
      } else {
        setExpandedDescriptions((prev) => [
          ...prev,
          ...new Array(videosData.length).fill(false),
        ]);
      }
      
      return videosData.length > 0; // Indicate if more videos are available
    } catch (error) {
      console.error("Error fetching videos:", error);
      toast.error("שגיאה בטעינת סרטונים");
      return false; // Indicate that no more videos are available due to error
    }
  };

  const handleHashtagClick = (hashtag: string) => {
    setSearchQuery(`# ${hashtag}`);
    setCurrentPage(1);
    setNoMoreVideos(false);
    fetchVideos(1);
    closeHashtagDropdown();
  };

  const toggleHashtagDropdown = () => {
    setShowHashtagDropdown(!showHashtagDropdown);
  };

  const closeHashtagDropdown = () => {
    setShowHashtagDropdown(false);
  };

  const loadMore = () => {
    // Increment the current page to fetch the next page of videos
    const nextPage = currentPage + 1;

    fetchVideos(nextPage).then((hasMoreVideos) => {
      if (!hasMoreVideos) {
        // If there are no more videos, set a state variable
        setNoMoreVideos(true);
      }
      setCurrentPage(nextPage); // Increment currentPage here
    });
  };

  const toggleDescription = (index: number) => () => {
    const newExpandedDescriptions = [...expandedDescriptions];
    newExpandedDescriptions[index] = !newExpandedDescriptions[index];
    setExpandedDescriptions(newExpandedDescriptions);
  };

  const addToFavorites = async (videoUri: string, folderName: string) => {
    if (!session?.user?.email) {
      toast.error("יש להתחבר כדי להוסיף לרשימות");
      return;
    }

    try {
      const response = await axios.post("/api/add-to-favorites", {
        userEmail: session.user.email,
        videoUri,
        folderName,
      });

      if (response.status === 200) {
        toast.success("הסרטון נוסף בהצלחה");
        closeModal();
      }
    } catch (error) {
      console.error("Error adding to favorites:", error);
      toast.error("שגיאה בהוספה למועדפים");
    }
  };

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setShowForm(false);
  };

  const openForm = () => {
    setShowForm(true);
  };

  const handlePlaylistNameChange = (event: any) => {
    setPlaylistName(event.target.value);
  };

  const handleSubmit = (event: any) => {
    event.preventDefault();
    createPlaylist(playlistName);
    setPlaylistName("");
    setShowForm(false);
  };

  // Create playlist function for the PlaylistModal component
  const createPlaylist = async (playlistName: string) => {
    try {
      const response = await axios.post("/api/folders", {
        name: playlistName,
        email: session?.user?.email,
      });
      if (response.status === 200) {
        setFolderNames([...folderNames, playlistName]);
        toast.success("הרשימה נוצרה בהצלחה");
      }
    } catch (error) {
      console.error("Error creating playlist:", error);
      toast.error("שגיאה ביצירת רשימה");
    }
  };
  
  // Memoize animation variants to prevent recreating on each render
  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05, // Reduced from 0.1 for better performance
        when: "beforeChildren"
      }
    }
  }), []);

  const itemVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 80, // Reduced from 100 for better performance
        damping: 12
      }
    }
  }), []);

  return (
    <div className={`w-full relative ${className}`}>
      {/* Semi-transparent overlay for this section */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/10 to-black/5" />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Desert Journey Video Banner */}
        <motion.div 
          className="relative mb-10 overflow-hidden backdrop-blur-md rounded-2xl shadow-lg border border-white/20"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute -top-16 -right-16 w-64 h-64 opacity-10 transform rotate-12">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path
                fill="#D5C4B7"
                d="M39.5,-65.3C50.2,-55.1,57.2,-42.1,63.4,-28.8C69.6,-15.5,74.9,-1.9,73.1,10.7C71.3,23.3,62.3,34.8,51.6,42.8C40.9,50.8,28.5,55.3,15.3,60.5C2.2,65.7,-11.7,71.7,-24.4,69.9C-37.1,68.1,-48.5,58.6,-57.4,47C-66.3,35.4,-72.6,21.7,-74.3,7.2C-76,-7.3,-73,-22.5,-65.3,-34.2C-57.6,-45.9,-45.2,-54,-32.5,-63.8C-19.8,-73.6,-6.6,-85.1,5.2,-83.3C17,-81.5,28.8,-75.5,39.5,-65.3Z"
              />
            </svg>
          </div>
          
          <div className="relative z-10 text-center md:text-right max-w-3xl mx-auto py-8 px-6 md:px-8">
            
            <div className="relative flex flex-col items-center justify-center text-center">
              <div className="max-w-4xl mx-auto">

                
                <motion.h2 
                  className="text-3xl md:text-4xl font-light mb-4 leading-tight"
                  style={{ color: '#F5F1EB', textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  אוסף התרגולים שלנו
                </motion.h2>
                
                <motion.p 
                  className="text-lg md:text-xl font-light leading-relaxed max-w-2xl"
                  style={{ color: '#F5F1EB', textShadow: '0 1px 4px rgba(0, 0, 0, 0.6)', opacity: '0.95' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  גלו את עולם התרגול שלנו דרך חוויה אישית ומותאמת. כל סרטון מזמין אתכם לטעימה ראשונה - התחילו את המסע שלכם עכשיו.
                </motion.p>
              </div>
              

            </div>
          </div>
        </motion.div>

        {/* Search Bar with Autocomplete */}
        <motion.div 
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <SearchBar 
            onSearch={(query) => {
              setSearchQuery(query);
              handleSearch({ preventDefault: () => {} } as React.FormEvent);
            }}
            hashtags={hashtagOptions}
            onHashtagClick={(hashtag) => {
              setSearchQuery(`# ${hashtag}`);
              handleSearch({ preventDefault: () => {} } as React.FormEvent);
            }}
          />
        </motion.div>

        <motion.div 
          className="backdrop-blur-md rounded-2xl shadow-lg overflow-hidden border border-white/20 mb-10"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {/* Container header with desert theme */}
          <div className="sticky top-0 z-10 py-3 px-5 flex justify-between items-center border-b border-white/20 overflow-hidden" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>

            {!noMoreVideos && (
              <motion.button
                className="px-4 py-1.5 text-sm rounded-full focus:outline-none shadow-sm transition-all duration-300 hover:shadow-md font-medium relative overflow-hidden backdrop-blur-md border border-white/30"
                style={{ backgroundColor: 'rgba(212, 165, 116, 0.8)', color: '#F5F1EB' }}
                onClick={loadMore}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                טען עוד
              </motion.button>
            )}
          </div>
          
          {/* Scrollable content area */}
          <div className="h-[800px] overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-[#D5C4B7] scrollbar-track-transparent relative">
            {noResults ? (
              <motion.div 
                className="text-center py-10 px-6 bg-[#F0E9DF] rounded-xl shadow-sm border border-[#D5C4B7] mt-8 relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-[#2D3142] text-lg font-heebo">
                  <span className="font-bold text-[#EF8354]">אופס!</span> 🤷‍♂️ לא
                  נמצאו סרטונים עבור הנושא{" "}
                  <span className="font-bold">&quot;{searchQuery}&quot;</span> .
                  נסה להשתמש בכמות קטנה יותר של נושאים לתוצאות טובות יותר!{" "}
                </p>
              </motion.div>
            ) : (
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {/* Render all videos */}
                {videos
                  .filter((video) => !video.name.startsWith("[PRV]"))
                  .map((video, index) => (
                    <motion.div 
                      key={video.uri} 
                      className="transform hover:scale-105 transition-transform duration-300 hover:shadow-lg"
                      variants={itemVariants}
                      /* Reduce motion complexity */
                      transition={{ duration: 0.2 }}
                      whileHover={{ scale: 1.03 }} /* Less intense hover effect */
                    >
                      <VideoCard
                        video={video}
                        watchedVideos={watchedVideos}
                        isExpanded={expandedDescriptions[index]}
                        onToggleDescription={() => toggleDescription(index)()}
                        onPlayVideo={(embedHtml) => openVideo(embedHtml || video.embedHtml, video.uri)}
                        onAddToFavorites={() => {}}
                      />
                    </motion.div>
                  ))}
              </motion.div>
            )}
            
            {/* Status message at the bottom of scrollable area */}
            {noMoreVideos && videos.length > 0 && (
              <motion.div 
                className="text-center py-3 px-4 mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <p className="text-[#2D3142] text-sm bg-[#F0E9DF] inline-block py-2 px-6 rounded-full shadow-sm border border-[#D5C4B7] relative overflow-hidden">
                  <span className="relative z-10 font-heebo">אין עוד סרטונים לטעון</span>
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
        
        {showModal && (
          <PlaylistModal
            isOpen={showModal}
            onClose={closeModal}
            folderNames={folderNames}
            selectedVideoUri={selectedVideoUri}
            onAddToFavorites={addToFavorites}
            onCreatePlaylist={createPlaylist}
          />
        )}
      </div>
      {selectedVideo && (
        <VideoPlayer
          videoUri={selectedVideoUri}
          embedHtml={selectedVideo}
          onClose={closeVideo}
          initialResumeTime={resumeTime}
          isSubscriber={isSubscriber}
          isAdmin={(session?.user as any)?.isAdmin}
        />
      )}
    </div>
  );
};

export default ExploreVideos;
