"use client";
import { FC, useEffect, useState, useRef } from "react";
import axios, { AxiosResponse } from "axios";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { FaPlay, FaEye, FaEyeSlash, FaPlus, FaSearch } from "react-icons/fa";
import NewVideoProgressBadge from "@/app/components/NewVideoProgressBadge";
import VideoPlayer from "@/app/components/VideoPlayer";
import VideoCard from "@/app/components/VideoCard";
import PlaylistModal from "@/app/components/PlaylistModal";
import SearchBar from "@/app/components/SearchBar";


interface pageProps {
  params: { name: string };
}

const Page: FC<pageProps> = ({ params }) => {
  const folderNameFromUrl = decodeURIComponent(params.name); // Extract the folder name from URL

   type WatchedVideo = {
      uri: string;
      progress: number;
      resumeTime?: number; // ✅ זה השדה החסר
    };
    const [watchedVideos, setWatchedVideos] = useState<WatchedVideo[]>([]);  
  

  const [resumeTime, setResumeTime] = useState<number>(0);

  const [folderName, setFolderName] = useState<string>(""); // Initialize folderName state
  const [folderUri, setFolderUri] = useState<string>(""); // Store folder URI for API calls
  const [videos, setVideos] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [descriptionQuery, setDescriptionQuery] = useState<string>("");
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null); // Track the selected video URI
  const [selectedVideoData, setSelectedVideoData] = useState<any | null>(null); // Track the selected video data
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showHashtagDropdown, setShowHashtagDropdown] = useState(false);
  const { data: session } = useSession();
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionId, setSubscriptionId] = useState(null);
  const [hasContentAccess, setHasContentAccess] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedVideoUri, setSelectedVideoUri] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [playlistName, setPlaylistName] = useState("");
  const [folderNames, setFolderNames] = useState([]);
  const [expandedDescriptions, setExpandedDescriptions] = useState<boolean[]>(
    videos.map(() => false),
  );
  const [noResults, setNoResults] = useState(false);
  const [noMoreVideos, setNoMoreVideos] = useState<boolean>(false); // State to track if there are no more videos to load
  const [videosLoading, setVideosLoading] = useState(false); // Loading state for videos
  const [initialLoading, setInitialLoading] = useState(true); // Initial page loading state
  const [loadingMore, setLoadingMore] = useState(false); // Loading more videos state
  const isVideoOpenRef = useRef<boolean>(false);

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
    // Fetch folder name and details from our API
    const fetchFolderData = async () => {
      try {
        // Fetch all folders first to find the one matching our name
        const foldersResponse = await fetch('/api/admin/folder-metadata');
        const foldersData = await foldersResponse.json();
        
        if (foldersData.success && foldersData.folders) {
          const targetFolder = foldersData.folders.find((f: any) => f.name === folderNameFromUrl);
          
          if (targetFolder) {
            setFolderName(targetFolder.name);
            setFolderUri(targetFolder.uri);
          }
        }
      } catch (error) {
        console.error("Error fetching folder details:", error);
      }
    };

    // Call the fetchFolderData function when the component mounts
    fetchFolderData();
  }, [folderNameFromUrl]); // Include folderNameFromUrl as a dependency to re-fetch when it changes

  useEffect(() => {
    // Reset the videos and currentPage when a new search is performed or when folderUri changes
    if (folderUri) {
      setVideos([]);
      setCurrentPage(1);
      setNoMoreVideos(false);
      setNoResults(false);

      fetchVideos(1).finally(() => {
        setInitialLoading(false);
      });
    }
  }, [descriptionQuery, folderUri]); // Include both descriptionQuery and folderUri as dependencies

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

  // Use our server-side API endpoint instead of direct Vimeo calls
  // We'll construct the URL dynamically when we have the folderUri

  /*   const fetchVideos = async (page: number): Promise<boolean> => {
    try {
      const response: AxiosResponse = await axios.get(apiUrl, {
        headers,
        params: {
          page,
          query: descriptionQuery,
          fields: "uri,embed.html,name,description,pictures",
        },
      });

      const data = response.data;
      const videosData = data.data;

      if (videosData.length === 0 && page === 1) {
        // Set noResults to true if no videos are found on the first page
        setNoResults(true);
        setNoMoreVideos(true);
      } else {
        const newVideos = videosData.map((video: any) => ({
          uri: video.uri,
          embedHtml: video.embed.html,
          name: video.name,
          description: video.description,
          thumbnailUri: video.pictures.sizes[5].link,
        }));

        setVideos((prevVideos) => [...prevVideos, ...newVideos]);

        if (page < data.paging.total_pages) {
          setCurrentPage(page + 1);
          return true; // Indicate there are more videos
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
    return false; // Indicate no more videos
  }; */

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

  const fetchVideos = async (page: number): Promise<boolean> => {
    try {
      // Set loading states
      if (page === 1) {
        setVideosLoading(true);
        setNoResults(false);
      } else {
        setLoadingMore(true);
      }

      // Don't fetch videos if we don't have the folder URI yet
      if (!folderUri) {
        setVideosLoading(false);
        setLoadingMore(false);
        return false;
      }

      const apiUrl = `/api/vimeo/folders/${encodeURIComponent(folderUri)}/videos`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (!data.success || !data.videos?.length) {
        if (page === 1) {
          setNoResults(true);
        }
        setVideosLoading(false);
        setLoadingMore(false);
        return false; // No more videos to fetch
      }

      // Filter videos based on search query if provided
      let filteredVideos = data.videos;
      if (descriptionQuery) {
        filteredVideos = data.videos.filter((video: any) => 
          video.name.toLowerCase().includes(descriptionQuery.toLowerCase()) ||
          video.description.toLowerCase().includes(descriptionQuery.toLowerCase())
        );
      }

      // Implement pagination by slicing the videos
      const videosPerPage = 12; // Load 12 videos at a time
      const startIndex = (page - 1) * videosPerPage;
      const endIndex = startIndex + videosPerPage;
      const paginatedVideos = filteredVideos.slice(startIndex, endIndex);

      const newVideos = paginatedVideos.map((video: any) => {
        const watched = watchedVideos.find((v) => v.uri === video.uri);
        return {
          uri: video.uri,
          embedHtml: video.embed?.html || '',
          name: video.name,
          description: video.description,
          thumbnailUri: video.pictures?.sizes?.[5]?.link || video.pictures?.sizes?.[0]?.link || '',
          progress: watched?.progress || 0,
          resumeTime: watched?.resumeTime || 0,
          duration: video.duration,
        };
      });

      if (page === 1) {
        setVideos(newVideos);
      } else {
        setVideos((prevVideos) => [...prevVideos, ...newVideos]);
      }

      // Check if there are more videos to load
      const hasMoreVideos = endIndex < filteredVideos.length;
      setNoMoreVideos(!hasMoreVideos);

      setVideosLoading(false);
      setLoadingMore(false);
      return hasMoreVideos;
    } catch (error) {
      console.error("Error fetching videos:", error);
      setVideosLoading(false);
      setLoadingMore(false);
      return false;
    }
  };
  

  const hashtagOptions = [
    "הריוןלידה",
    "רצפתאגן",
    "עריסתאגן",
    "בריאותהאשה",
    "עמודשדרה",
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
    "שיעורפתיחה",
    "שכמות",
    "חגורתכתפיים",
    "כתפיים",
    "פלגגוףעליון",
    "שורשים",
    "שורשכףיד",
    "ניעורים",
    "ניעוריגוף",
    "צוואר",
    "Flystick",
    "אקסטנשיין",
    "פלקשיין",
    "גב",
    "רגליים",
    "ברכיים",
    "פלגגוףתחתון",
    "אגן",
    "גבתחתון",
    "בטן",
    "שלושתהפופיקים",
    "אלכסונים",
    "הליכה",
    "ריצה",
    "אביזרים",
    "קונצנטרי",
    "איזומטרי",
    "מתיחות",
    "לורדוזה",
    "לחצים",
    "תאיאיכסון",
    "דיוקים",
    "נסיגתפנים",
    "Sml",
    "מדיטציה",
    "כפותרגליים",
    "תודעה",
    "אימון קיר",
    "כפות רגליים",
  ];

  const folderDescriptions: { [key: string]: string } = {
    Contrology: `שיטת התרגול של ג׳וזף. ה. פילאטיס המבוססת על 34 תרגילים שאסף מעולם היוגה, האקרובטיקה ומחיקוי חיות וילדים ואירגן בסדר מסוים, שמטרתם ליצור הרמוניה בין הגוף לנפש. דרך מקצבי תנועה ידועים מראש וניהול 34 דפוסי נשימה, הגוף מגיע למצב אופטימאלי תפקודי, מתחזק, מתגמש, מקבל אנרגיה ומשתחרר ממכאובים. תוכלו למצוא כאן פרשנויות שונות שלי לשיטה, דקויות ייחודיות וכיווני הסבר לאלו ממכם שרוצים להעמיק הן בתנועה, בהבנת השיטה, באנטומיה וחקר הגוף.`,
    אביזרים: `כאן תמצאו שיעורי גליל, כדור, צלחות ועוד. מטרתם לחדד ולהעמיק עקרונות שיתמכו בטכניקות השונות ובגוף במיוחד.`,
    "אימוני קיר": `שיעורי כח וגמישות בעזרת הקיר בבית. הקיר תומך ופותח לגוף אפשרויות נוספות לשדרוג האימונים והבנת התשתיות שלו בתנועה. סוגר שרשראות תנועה ומאפשר להגיע לעומקים ביחס לכבידה. הקיר הופך להיות הרצפה.`,
    "הריון ולידה": `שיעורים והרצאות חשובים לכל השלבים בזמן הריון ולידה. הכנות חשובות לקראת הלידה, גופניות ומנטאליות, הבנה עמוקה של תהליך טבעי זה ותרגולים חיוניים גם לאחר הלידה כדי להשיב את הגוף למצבו המקורי.`,
    "הרצאות סדנאות והשתלמויות": `עולם של תוכן חכם וחשוב לכל אדם בנושאים שונים ומגוונים הקשורים להבנת הגוף וחשיבות התנועה בחייו של אדם.`,
    "לימודי תודעה": `פרקים נבחרים של תובנות התבוננות וחקירה עצמית מוגשים לכם כדי להבין טוב את יותר את המציאות בה אנו חיים, לתרגם טוב יותר את הגוף הרגשי ולהיות בהרמוניה מול תנועת הארועים וחיי היומיום.`,
    "סטרונג-מובילי (פילאטיס מתקדמים)": `(פילאטיס מתקדמים) תרגולי זרימה מתקדמים ועשירים בדרגת כח וגמישות גבוהים המעודדים שליטה מלאה וחיות אנרגטית לכל השבוע. השיעורים עשירים בדיוקים בנושאים שונים ומלמדים את הגוף לנוע בחופשיות ובעוצמה באותה מידה.`,
    "פילאטיס-לייט (פילאטיס לימודי)": `(פילאטיס לימודי למתחילים) כאן תמצאו ׳שיעורי פתיחה׳ בהם אני פותח בהסבר מדויק על הנושא הנבחר, שיעורים בקצב איטי לתחילת הדרך ואף למתקדמים הרוצים להעמיק בפרטים הקטנים.`,
    "פילאטיס מכשירים": `שיעורים מטכניקת ה׳רפומר-פלו׳ המוגשת עד היום ברחבי הארץ. כאן תוכלו למצוא שיעורי מורות מרחבי הארץ ומסדנאות בנושאים רבים המחדדים את התנועה של הגוף בזרימה.`,
    "פלייסטיק-Flystick": `שיטה מרהיבה המחברת בין רקמות הגוף ורכבות האנטומיה הטבעיות בעזרת מקל. תורמת לחיוניות, לכח, לגמישות ויציבה ללא מאמץ.`,
    "קוויקיז Quickies": `שיעורים קצרים בזמן המתאימים לרגע של תנועה ושחרור הגוף, בנושאים שונים וממוקדים.`,
    "קורס מורות\\ים קונטרולוג׳י": `מאגר שיעורים במסגרת הכשרה של קורס המורות מורים שלי ה׳קונטרולוג׳י׳.`,
    "שיעורי כסא מרפאים": `שיעורים המתמקדים בעמוד השדרה, במערכת הנשימה, באנרגית החיוניות של הגוף וכמובן בכח וגמישות.`,
  };

  const [isExpanded, setIsExpanded] = useState(false);

  // This gets the description for the folder or shows a default message.
  const description =
    folderDescriptions[folderName as keyof typeof folderDescriptions] ||
    "אין תיאור זמין";

  // Function to toggle between showing more or less
  const toggleReadMore = () => {
    setIsExpanded(!isExpanded);
  };

  // Truncate the description to 50 characters if it's not expanded
  const truncatedDescription = description.slice(0, 200);

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

  /*  const loadMore = () => {
    // Increment the current page to fetch the next page of videos
    const nextPage = currentPage + 1;
    

    

    fetchVideos(nextPage).then((hasMoreVideos) => {
      if (!hasMoreVideos) {
        // If there are no more videos, set a state variable
        setNoMoreVideos(true);
      }
      setCurrentPage(nextPage); // Increment currentPage here
    });
  }; */

  const loadMore = () => {
    if (loadingMore) return; // Prevent multiple simultaneous requests
    
    const nextPage = currentPage + 1;

    fetchVideos(nextPage).then((hasMoreVideos) => {
      if (hasMoreVideos) {
        setCurrentPage(nextPage); // Increment only if more videos exist
      } else {
        setNoMoreVideos(true); // Stop loading if no more videos
      }
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
  
  const createPlaylist = (newPlaylistName: string) => {
    // Create a new playlist and add the selected video to it
    if (newPlaylistName.trim() === "") {
      alert("Please enter a valid playlist name");
      return;
    }
    
    // Add the video to the new playlist
    addToFavorites(selectedVideoUri, newPlaylistName);
    closeModal();
  };

  // This function is already defined elsewhere in the file, so we'll remove this duplicate


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

          // Skip PayPal API call for admin users to prevent 400 errors
          if (subscriptionId === "Admin") {
            setSubscriptionStatus("ACTIVE"); // Admin always has active status
            return; // Exit early for admin users
          }

          // Only fetch PayPal subscription details for non-admin users with valid subscription IDs
          if (subscriptionId && subscriptionId !== "trial_30" && subscriptionId !== "free") {
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
          } else {
            // For trial or free users, set appropriate status
            setSubscriptionStatus(subscriptionId === "trial_30" ? "TRIAL" : "FREE");
          }

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

  if (
    hasContentAccess ||
    subscriptionId === "Admin" ||
    subscriptionStatus === "ACTIVE" ||
    subscriptionStatus === "PENDING_CANCELLATION"
  ) {
    // Render content for users with an active subscription
    return (
      <div className="bg-[#F7F3EB] min-h-screen pt-20">
        <div className="container mx-auto p-6 ">
          <h1 className="text-4xl font-bold mb-8 text-[#2D3142] text-center">
            {folderName}
          </h1>

          <div className="bg-[#F0E9DF] rounded-xl shadow-sm border border-[#D5C4B7] p-6 mb-8">
            <p className="text-lg text-[#2D3142] text-center">
              {isExpanded
                ? description
                : `${truncatedDescription}${
                    description.length > 200 ? "..." : ""
                  }`}

              {/* Only show the button if the description is longer than 200 characters */}
              {description.length > 200 && (
                <button
                  className="text-[#EF8354] hover:text-[#D5C4B7] focus:outline-none ml-2 transition-colors duration-300"
                  onClick={toggleReadMore}
                >
                  {isExpanded ? "קרא פחות" : "קרא עוד"}
                </button>
              )}
            </p>
          </div>

          <div
            style={{ direction: "ltr" }}
            className="flex items-center justify-start mb-6"
          >
            <Link 
              href="/styles" 
              className="text-[#2D3142] bg-[#D5C4B7]/50 hover:bg-[#D5C4B7] px-4 py-2 rounded-md transition-colors duration-300 flex items-center gap-2 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>חזרה לטכניקות</span>
            </Link>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {initialLoading || videosLoading ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 border-4 border-[#D5C4B7] border-t-[#B8A99C] rounded-full animate-spin"></div>
                <p className="mt-4 text-[#2D3142] font-medium text-lg">טוען סרטונים...</p>
              </div>
            ) : noResults ? (
              <div className="col-span-full text-center py-10 px-6 bg-[#F0E9DF] rounded-xl shadow-sm border border-[#D5C4B7] mt-8">
                <p className="text-[#2D3142] text-lg">
                  <span className="font-bold text-[#EF8354]">אופס!</span> 🤷‍♂️ לא
                  נמצאו סרטונים עבור הנושא{" "}
                  <span className="font-bold">&quot;{searchQuery}&quot;</span> .
                  נסה להשתמש בכמות קטנה יותר של נושאים לתוצאות טובות יותר!{" "}
                </p>
              </div>
            ) : (
              videos.map((video, index) => {
                console.log('Video data in styles page:', video);
                return (
                  <div key={video.uri} className="transform hover:opacity-90 transition-all duration-300 hover:shadow-lg">
                    <VideoCard
                      video={video}
                      watchedVideos={watchedVideos}
                      isExpanded={expandedDescriptions[index]}
                      onToggleDescription={() => toggleDescription(index)()}
                      onPlayVideo={(embedHtml) => openVideo(embedHtml, video.uri)}
                      onAddToFavorites={(videoUri) => {
                        setSelectedVideoUri(videoUri);
                        openModal();
                        theUserId();
                      }}
                    />
                  </div>
                );
              })
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
            {noMoreVideos && !loadingMore && (
              <p className="text-center text-[#2D3142] py-4 px-8 bg-[#F0E9DF] rounded-lg shadow-sm border border-[#D5C4B7]">
                אין עוד סרטונים לטעון.
              </p>
            )}
            {loadingMore && (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-[#D5C4B7] border-t-[#B8A99C] rounded-full animate-spin"></div>
                <p className="mt-2 text-[#2D3142] font-medium">טוען עוד סרטונים...</p>
              </div>
            )}
            {!noMoreVideos && !loadingMore && (
              <button
                className="bg-[#D5C4B7] hover:bg-[#B8A99C] text-[#2D3142] px-8 py-4 rounded-lg focus:outline-none shadow-md transition-all duration-300 hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={loadMore}
                disabled={loadingMore}
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
            isSubscriber={hasContentAccess || (session?.user as any)?.activeSubscription}
            isAdmin={(session?.user as any)?.isAdmin}
          />
        )}
      </div>
    );
  }

  if (!session || (!hasContentAccess && !(session.user as any)?.activeSubscription)) {
    // Render content for users without an active subscription or content access
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