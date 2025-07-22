"use client";

import React, { useEffect, useState, useRef } from "react";
import axios, { AxiosResponse } from "axios";
import { useSession, signOut } from "next-auth/react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import Player from "@vimeo/player";
import { FaPlay, FaEye, FaEyeSlash, FaPlus, FaSearch } from "react-icons/fa";
import VideoProgressBadge from "@/app/components/VideoProgressBadge";
import VideoPlayer from "@/app/components/VideoPlayer";
import PlaylistModal from "@/app/components/PlaylistModal";
import SearchBar from "@/app/components/SearchBar";
import VideoCard from "@/app/components/VideoCard";

const Page = () => {
  type WatchedVideo = {
    uri: string;
    progress: number;
    resumeTime?: number; // 
  };
  const [watchedVideos, setWatchedVideos] = useState<WatchedVideo[]>([]);  

  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [resumeTime, setResumeTime] = useState<number>(0);

  const [videos, setVideos] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [descriptionQuery, setDescriptionQuery] = useState<string>("");
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedVideoUri, setSelectedVideoUri] = useState<string>(""); // Track the selected video URI
  const [selectedVideoData, setSelectedVideoData] = useState<any | null>(null); // Track the selected video data
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showHashtagDropdown, setShowHashtagDropdown] = useState(false);
  const { data: session } = useSession();
  const [showModal, setShowModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [playlistName, setPlaylistName] = useState("");
  const [folderNames, setFolderNames] = useState([]);
  const [expandedDescriptions, setExpandedDescriptions] = useState<boolean[]>(
    videos.map(() => false),
  );
  const [noResults, setNoResults] = useState(false);
  const [noMoreVideos, setNoMoreVideos] = useState<boolean>(false); // State to track if there are no more videos to load
  const isVideoOpenRef = useRef<boolean>(false);
  const [videoToOpenFromUrl, setVideoToOpenFromUrl] = useState<string | null>(null);
  const openedFromLink = useRef(false);



  const handleBackButton = (event: PopStateEvent) => {
    if (isVideoOpenRef.current) {
      event.preventDefault(); // Prevent default action
      closeVideo(); // Close the video
    }
  };

  const openVideo = async (embedHtml: string, videoUri: string) => {
    // Always fetch the latest watched videos data before opening a video
    // This ensures we have the most up-to-date progress information
    if (session?.user) {
      try {
        const res = await axios.post("/api/get-watched-videos", {
          userEmail: session.user.email,
        });
        if (res.status === 200) {
          // Update the watchedVideos state with fresh data from the backend
          setWatchedVideos(res.data.watchedVideos);
          
          // Find if this video has been watched before and has a resumeTime
          // Use the fresh data from the API response
          const freshWatchedVideo = res.data.watchedVideos.find((v: { uri: string; progress: number; resumeTime?: number }) => {
            // Extract video ID from both URIs for comparison
            const watchedVideoId = v.uri.split('/').pop();
            const currentVideoId = videoUri.split('/').pop();
            return watchedVideoId === currentVideoId;
          });
          
          if (freshWatchedVideo && freshWatchedVideo.resumeTime) {
            setResumeTime(freshWatchedVideo.resumeTime);
          } else {
            setResumeTime(0); // Reset resume time if no previous watch history
          }
        }
      } catch (err) {
        console.error("Failed to fetch latest watched videos", err);
        // Fallback to using the existing watchedVideos state
        const watchedVideo = watchedVideos.find((v: { uri: string; progress: number; resumeTime?: number }) => {
          const watchedVideoId = v.uri.split('/').pop();
          const currentVideoId = videoUri.split('/').pop();
          return watchedVideoId === currentVideoId;
        });
        
        if (watchedVideo && watchedVideo.resumeTime) {
          setResumeTime(watchedVideo.resumeTime);
        } else {
          setResumeTime(0);
        }
      }
    } else {
      // No session, just reset resume time
      setResumeTime(0);
    }
    
    setSelectedVideo(embedHtml);
    setSelectedVideoUri(videoUri);
    isVideoOpenRef.current = true; // Set video open state
    window.history.pushState({}, "Video", ""); // Push new state when opening video
  };

  const closeVideo = async () => {
    if (player) {
      const currentTime = await player.getCurrentTime();
      const duration = await player.getDuration();
      const percent = Math.floor((currentTime / duration) * 100);
      const uri = selectedVideo?.match(/player\.vimeo\.com\/video\/(\d+)/)?.[1];
      const videoUri = uri ? `/videos/${uri}` : null;
  
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
                  : v
              );
            } else {
              return [...prev, { uri: videoUri, progress: percent, resumeTime: currentTime }];
            }
          });
        } catch (err) {
          console.error("❌ Failed to save on closeVideo:", err);
        }
      }
    }
  
    setSelectedVideo(null); // Close the video
    isVideoOpenRef.current = false; // Reset video open state
    if (openedFromLink.current) {
      window.location.reload(); // רענון רגיל
    }
    window.history.pushState({}, ""); // Reset history state
  };
  useEffect(() => {
    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, []); // No dependencies needed here

  // ✅ Extract ?video=name from URL and trigger search
  useEffect(() => {
    const url = new URL(window.location.href);
    const videoParam = url.searchParams.get("video");
  
    if (videoParam) {
      setSearchQuery(videoParam);
      setDescriptionQuery(videoParam);
      setVideoToOpenFromUrl(videoParam); // 💥 נשמר לשימוש מאוחר
    }
  }, []);

  useEffect(() => {
    // Reset the videos and currentPage when a new search is performed
    setVideos([]);
    setCurrentPage(1);
    fetchVideos(currentPage);
    setNoMoreVideos(false);
  }, [descriptionQuery]); // Include descriptionQuery as a dependency

  const theUserId = async () => {
    try {
      if (session && session.user) {
        const response = await axios.post("/api/all-user-folder-names", {
          userEmail: session.user.email,
        });

        if (response.status === 200) {
          setFolderNames(response.data.folderNames);
        }
      } else {
        console.error("Failed to fetch folder names. Status code:");
      }
    } catch (error) {
      console.error("Error fetching folder names:", error);
    }
  };

  const accessToken = process.env.VIMEO_TOKEN;
  const apiUrl = "https://api.vimeo.com/me/videos";
  const headers = {
    Authorization: `Bearer ${accessToken}`,
  };
  //console.log("VIMEO_ACCESS_TOKEN:", process.env.VIMEO_TOKEN);

  const fetchVideos = async (page: number) => {
    try {
      const response: AxiosResponse = await axios.get(apiUrl, {
        headers,
        params: {
          page,
          query: descriptionQuery,
          fields: "uri,embed.html,name,description,pictures,duration",
        },
      });

      const data = response.data;
      const videosData = data.data;

      if (videosData.length === 0 && page === 1) {
        // Set noResults to true if no videos are found on the first page
        setNoMoreVideos(true);
      } else {
        const newVideos = videosData.map((video: any) => {
          const matched = watchedVideos.find((v) => v.uri === video.uri);
        
          return {
            uri: video.uri,
            embedHtml: video.embed.html,
            name: video.name,
            description: video.description,
            thumbnailUri: video.pictures.sizes[5].link,
            progress: matched?.progress || 0,
            resumeTime: matched?.resumeTime || 0, // ✅ זה הקריטי
            duration: video.duration,
          };
        });

        setVideos((prevVideos) => [...prevVideos, ...newVideos]);

        if (page < data.paging.total_pages) {
          setCurrentPage(page + 1);
        }

        return true; // Indicate that more videos are available
      }
    } catch (error) {
      console.error("Error:", error);
      return false; // Indicate that no more videos are available due to error
    }
  };


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
    "הליכה",
    "ריצה",
    "אביזרים",
    "קונצנטרי",
    "איזומטרי",
    "מתיחות",
    "לורדוזה",
    "לחצים",
    "תאי איכסון",
    "דיוקים",
    "נסיגת פנים",
    "Sml",
    "מדיטציה",
    "כפות רגליים",
    "תודעה",
    "אימון קיר",
  ];

  const handleHashtagClick = (hashtag: string) => {
    setSearchQuery((prevQuery) => {
      // Check if the selected hashtag is already in the search query
      if (prevQuery.includes(hashtag)) {
        // If it's already in the query, remove it
        return prevQuery
          .replace(new RegExp(`\\s*${hashtag}\\s*`, "g"), " ")
          .trim();
      } else {
        // If it's not in the query, add it
        return prevQuery ? `${prevQuery} ${hashtag}` : hashtag;
      }
    });
    // Close the dropdown after clicking
  };
  const toggleHashtagDropdown = () => {
    setShowHashtagDropdown(!showHashtagDropdown);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setNoResults(false);

    // You might also want to return early or handle this case differently
    // Set the search query
    setDescriptionQuery(searchQuery);
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

  const [showFullDescription, setShowFullDescription] =
    useState<boolean>(false);

  const toggleDescription = (index: number) => () => {
    setExpandedDescriptions((prevExpanded) => {
      const newExpanded = [...prevExpanded];
      newExpanded[index] = !newExpanded[index];
      return newExpanded;
    });
  };

  const addToFavorites = async (videoUri: string, folderName: string) => {
    try {
      if (session && session.user) {
        const response = await axios.post("/api/add-to-favorites", {
          userEmail: session.user.email,
          videoUri: videoUri,
          folderName: folderName,
        });

        if (response.status === 200) {
          if (response.data.message === "Add to favorites") {
            toast.success(`הסרטון נוסף ל${folderName}`);
          } else if (response.data.message === "Video already in favorites") {
            toast.error("הסרטון כבר נמצא במועדפים");
          } else if (
            response.data.message === "videoUri already exists in the folder"
          ) {
            toast.error(`הסרטון כבר נמצא ב${folderName}`);
          } else {
            toast.error("אירעה שגיאה");
          }
        } else {
          toast.error("אירעה שגיאה");
        }
      } else {
        console.error("User session is not available.");
        toast.error("אנא התחבר");
      }
    } catch (error) {
      console.error("Error adding video to favorites:", error);
      toast.error("אירעה שגיאה");
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
    // Handle form submission, e.g., save the playlist name
    //console.log("Playlist Name:", playlistName);
    if (playlistName.trim() === "") {
      alert("Please enter a valid playlist name");
    } else {
      addToFavorites(selectedVideoUri, playlistName);
      setPlaylistName("");
      setShowForm(false);
      closeModal();
    }
  };
  
  // Create playlist function for the PlaylistModal component
  const createPlaylist = (playlistName: string) => {
    if (playlistName.trim() === "") {
      toast.error("Please enter a valid playlist name");
      return;
    }
    
    addToFavorites(selectedVideoUri, playlistName);
    closeModal();
  };

useEffect(() => {
  const fetchWatchedVideos = async () => {
    if (!session?.user) return;
    try {
      const res = await axios.post("/api/get-watched-videos", {
        userEmail: session.user.email,
      });
      if (res.status === 200) {
        setWatchedVideos(res.data.watchedVideos); // [{ uri, progress }]
      }
    } catch (err) {
      console.error("Failed to fetch watched videos", err);
    }
  };

  fetchWatchedVideos();
}, [session]);

useEffect(() => {
  if (selectedVideo && videoContainerRef.current) {
    const uri = selectedVideo.match(/player\.vimeo\.com\/video\/(\d+)/)?.[1];
    if (!uri) return;

    const vimeoPlayer = new Player(videoContainerRef.current, {
      id: Number(uri),
      width: 640,
    });

    setPlayer(vimeoPlayer);

    let lastSaved = 0; // ✅ משתנה עזר חדש

    const saveProgress = async () => {
      const now = Date.now();
      if (now - lastSaved < 30000) return; // ✅ שמור רק אם עברו 30 שניות - מופחת עומס CPU
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
                  : v
              );
            } else {
              return [...prev, { uri: videoUri, progress: percent, resumeTime: currentTime }];
            }
          });
        } catch (err) {
          console.error("❌ Failed to save progress:", err);
        }
      }
    };

    // Resume from saved time
    vimeoPlayer.on("loaded", async () => {
      const resumeFrom = watchedVideos.find((v) => v.uri === `/videos/${uri}`)?.resumeTime ?? 0;

      try {
        if (resumeFrom > 0) {
          await vimeoPlayer.setCurrentTime(resumeFrom);
        }
        await vimeoPlayer.play();
      } catch (err) {
        console.error("❌ Failed to resume video:", err);
      }
    });

    // Track progress with throttling
    vimeoPlayer.on("timeupdate", saveProgress);

    // Save on pause immediately
    vimeoPlayer.on("pause", saveProgress);

    window.addEventListener("beforeunload", saveProgress);

    return () => {
      // Properly destroy player to prevent memory leaks - critical for CPU/GPU performance
      vimeoPlayer.destroy();
      window.removeEventListener("beforeunload", saveProgress);
    };
  }
}, [selectedVideo]);


  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionId, setSubscriptionId] = useState(null);
  const [hasContentAccess, setHasContentAccess] = useState(false);

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
          
          // Check if user has admin access or is free/trial user
          const adminCheckResponse = await axios.post("/api/check-admin", {
            email: session.user.email,
          });
          
          // Set content access based on response
          setHasContentAccess(adminCheckResponse.data.hasContentAccess);
          
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
        setLoading(false);
      }
    };

    // Fetch user data when the component mounts or when the session changes
    fetchUserData();
  }, [session]);


  // ✅ After videos are loaded, auto-open matching video if ?video= was used
  useEffect(() => {
    if (!videoToOpenFromUrl || videos.length === 0) return;
  
    // Match by video ID from URI (e.g., /videos/1102449243)
    const match = videos.find((v) => {
      const videoId = v.uri.split('/').pop();
      return videoId === videoToOpenFromUrl;
    });
  
    if (match) {
      // ✅ השהייה קטנה מבטיחה שה־DOM מוכן
      setTimeout(() => {
        openVideo(match.embedHtml, match.uri);
        openedFromLink.current = true;
        setVideoToOpenFromUrl(null);
        window.history.replaceState({}, "", "/explore");
      }, 1000);
      
    }
  }, [videos, videoToOpenFromUrl]);
  

  if (loading) {
    // Display loading spinner with Wabi-Sabi style background
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#F7F3EB]">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-[#D5C4B7] border-t-[#B8A99C] rounded-full animate-spin"></div>
          <p className="mt-4 text-[#3D3D3D] font-medium">טעינה...</p>
        </div>
      </div>
    );
  }

  // Legacy isSubscriber check combined with hasContentAccess
  const isSubscriber = 
      hasContentAccess ||
      subscriptionId === "Admin" ||
      subscriptionStatus === "ACTIVE" ||
      subscriptionStatus === "PENDING_CANCELLATION";
    
  // Render content for all users
    return (
      <div className="bg-[#F7F3EB] min-h-screen pt-20">
        <div className="container mx-auto p-6">
          <div className="mx-auto max-w-7xl px-8 pb-10">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-base font-semibold leading-7 text-[#B56B4A] no-wrap">
                המסע שלך והצרכים שלך בהתאמה אישית
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-[#2D3142] sm:text-4xl">
                גלו את השיעור הבא שלכם
              </p>
              
            </div>
            
           
          </div>

           {/* Search Bar with Wabi-Sabi styling */}
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
          {/* The old search form has been removed and replaced with the SearchBar component above */}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {noResults ? (
              <div className="col-span-full text-center py-10 px-6 bg-[#F0E9DF] rounded-xl shadow-sm border border-[#D5C4B7] mt-8">
                <p className="text-[#2D3142] text-lg">
                  <span className="font-bold text-[#B56B4A]">אופס!</span> 🤷‍♂️ לא
                  נמצאו סרטונים עבור הנושא{" "}
                  <span className="font-bold">&quot;{searchQuery}&quot;</span> .
                  נסה להשתמש בכמות קטנה יותר של נושאים לתוצאות טובות יותר!{" "}
                </p>
              </div>
            ) : (
              videos
                .filter((video) => !video.name.startsWith("[PRV]"))
                .map((video, index) => (
                  <div key={video.uri} className="transform hover:opacity-90 transition-all duration-300 hover:shadow-lg">
                    <VideoCard
                      video={video}
                      watchedVideos={watchedVideos}
                      isExpanded={expandedDescriptions[index]}
                      onToggleDescription={() => toggleDescription(index)()}
                      onPlayVideo={(embedHtml) => openVideo(embedHtml || video.embedHtml, video.uri)}
                      onAddToFavorites={(videoUri) => {
                        setSelectedVideoUri(videoUri);
                        openModal();
                        theUserId();
                      }}
                      isAdmin={subscriptionId === "Admin"}
                    />
                  </div>
                ))
            )}

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
          <div className="mt-10 flex justify-center">
            {noMoreVideos && (
              <p className="text-center text-[#2D3142] py-4 px-8 bg-[#F0E9DF] rounded-lg shadow-sm border border-[#D5C4B7]">
                אין עוד סרטונים לטעון.
              </p>
            )}
            {!noMoreVideos && (
              <button
                className="bg-[#D5C4B7] hover:bg-[#B8A99C] text-[#2D3142] px-8 py-4 rounded-lg focus:outline-none shadow-md transition-all duration-300 hover:shadow-lg font-medium"
                onClick={loadMore}
              >
                טען עוד
              </button>
            )}
          </div>
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

export default Page;