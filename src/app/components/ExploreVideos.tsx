"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import Player from "@vimeo/player";
import { FaPlay, FaEye, FaEyeSlash, FaPlus, FaSearch } from "react-icons/fa";
// Removed framer-motion import
import VideoProgressBadge from "@/app/components/VideoProgressBadge";
import VideoPlayer from "@/app/components/VideoPlayer";
import PlaylistModal from "@/app/components/PlaylistModal";
import VideoCard from "@/app/components/VideoCard";
import SearchBar from "@/app/components/SearchBar";
// WabiSabiHeading import removed


// Removed standardAnimations import

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
    
    // Handle back button for video player
    const handleBackButton = (event: PopStateEvent) => {
      if (isVideoOpenRef.current) {
        event.preventDefault();
        closeVideo();
      }
    };
    
    window.addEventListener("popstate", handleBackButton);
    
    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, [initialHashtag, session]);

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
    isVideoOpenRef.current = true; // Set video open state
    window.history.pushState({}, "Video", ""); // Push new state when opening video
  };

  const closeVideo = async () => {
    isVideoOpenRef.current = false;
    setSelectedVideo(null);
    window.history.replaceState({}, "", window.location.pathname);
  };

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
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("שגיאה בטעינת נתוני משתמש");
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
      
      // We're now using a static list of hashtags defined at the component level
      // No need to extract hashtags from video descriptions
      
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
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchVideos(nextPage);
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
    if (!session?.user?.email) return;

    try {
      const response = await axios.post("/api/create-playlist", {
        userEmail: session.user.email,
        playlistName,
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

  return (
    <div className={`bg-[#F7F3EB] py-8 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="relative mb-10 overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute -top-16 -right-16 w-64 h-64 opacity-10 transform rotate-12">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path
                fill="#D5C4B7"
                d="M39.5,-65.3C50.2,-55.1,57.2,-42.1,63.4,-28.8C69.6,-15.5,74.9,-1.9,73.1,10.7C71.3,23.3,62.3,34.8,51.6,42.8C40.9,50.8,28.5,55.3,15.3,60.5C2.2,65.7,-11.7,71.7,-24.4,69.9C-37.1,68.1,-48.5,58.6,-57.4,47C-66.3,35.4,-72.6,21.7,-74.3,7.2C-76,-7.3,-73,-22.5,-65.3,-34.2C-57.6,-45.9,-45.2,-54,-32.5,-63.8C-19.8,-73.6,-6.6,-85.1,5.2,-83.3C17,-81.5,28.8,-75.5,39.5,-65.3Z"
              />
            </svg>
          </div>
          
          {/* Header content */}
          <div className="relative z-10 text-center max-w-3xl mx-auto bg-[#F7F3EB] bg-opacity-80 py-6 px-4 rounded-2xl shadow-md border border-[#D5C4B7] border-opacity-30">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/paper-texture.png')] opacity-5 mix-blend-overlay"></div>
            
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-right md:w-2/3">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#EF8354] bg-opacity-20 border border-[#EF8354] border-opacity-30 mb-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#EF8354] text-white text-xs font-bold mr-2">2</span>
                  <span className="text-[#2D3142] text-sm font-medium">דקות צפייה חינמית מכל סרטון</span>
                </div>
                
                <h2 className="text-xl font-bold text-[#2D3142] mb-1">
                  חפש וצפה בכל הסרטונים שלנו
                </h2>
                
                <p className="text-[#3D3D3D] text-sm">
                  כל הסרטונים זמינים לצפייה מקדימה - הירשם למנוי מלא לצפייה ללא הגבלה
                </p>
              </div>
              
              <div className="md:w-1/3">
            </div>
          </div>
        </div>
      </div>

      <div 
        className="bg-white rounded-xl shadow-lg overflow-hidden relative"
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
      </div>

      {/* Scrollable video container with fixed height */}
      <div 
        className="relative border border-[#D5C4B7] border-opacity-40 rounded-xl overflow-hidden shadow-md bg-[#F7F3EB] bg-opacity-50 mb-6"
      >
        {/* Paper texture overlay for container */}
        {/* Paper texture removed */}
        {/* Container header with subtle gradient */}
        <div className="sticky top-0 z-10 bg-gradient-to-b from-[#F7F3EB] to-transparent py-3 px-5 flex justify-between items-center border-b border-[#D5C4B7] border-opacity-30 overflow-hidden">
          {/* Paper texture removed */}
          <h3 className="text-[#2D3142] font-medium font-heebo relative z-10">סרטונים זמינים</h3>
          {!noMoreVideos && (
            <button
              className="bg-[#D5C4B7] hover:bg-[#B8A99C] text-[#2D3142] px-4 py-1.5 text-sm rounded-full focus:outline-none shadow-sm transition-all duration-300 hover:shadow-md font-medium relative overflow-hidden"
              onClick={loadMore}
            >
              {/* Paper texture removed */}
              טען עוד
            </button>
          )}
        </div>
        
        {/* Scrollable content area */}
        <div className="h-[600px] overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-[#D5C4B7] scrollbar-track-transparent relative">
          {/* Subtle floating elements in the background */}

          {noResults ? (
            <div 
              className="text-center py-10 px-6 bg-[#F0E9DF] rounded-xl shadow-sm border border-[#D5C4B7] mt-8 relative overflow-hidden"
            >
              {/* Paper texture removed */}
              <p className="text-[#2D3142] text-lg font-heebo">
                <span className="font-bold text-[#EF8354]">אופס!</span> 🤷‍♂️ לא
                נמצאו סרטונים עבור הנושא{" "}
                <span className="font-bold">&quot;{searchQuery}&quot;</span> .
                נסה להשתמש בכמות קטנה יותר של נושאים לתוצאות טובות יותר!{" "}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {videos
                .filter((video) => !video.name.startsWith("[PRV]"))
                .map((video, index) => (
                  <div 
                    key={video.uri} 
                    className="transform hover:scale-105 transition-transform duration-300 hover:shadow-lg"
                  >
                    <VideoCard
                      video={video}
                      watchedVideos={watchedVideos}
                      isExpanded={expandedDescriptions[index]}
                      onToggleDescription={() => toggleDescription(index)()}
                      onPlayVideo={(embedHtml) => openVideo(embedHtml || video.embedHtml, video.uri)}
                      onAddToFavorites={() => {}}
                    />
                  </div>
                ))}
            </div>
          )}
          
          {/* Status message at the bottom of scrollable area */}
          {noMoreVideos && videos.length > 0 && (
            <div 
              className="text-center py-3 px-4 mt-6"
            >
              <p className="text-[#2D3142] text-sm bg-[#F0E9DF] inline-block py-2 px-6 rounded-full shadow-sm border border-[#D5C4B7] relative overflow-hidden">
                {/* Paper texture removed */}
                <span className="relative z-10 font-heebo">אין עוד סרטונים לטעון</span>
              </p>
            </div>
          )}
        </div>
      </div>
        
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
