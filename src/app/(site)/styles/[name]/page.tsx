"use client";
import { FC, useEffect, useState, useRef } from "react";
import axios, { AxiosResponse } from "axios";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import Player from "@vimeo/player";
import { FaPlay, FaEye, FaEyeSlash, FaPlus } from "react-icons/fa";

interface pageProps {
  params: { name: string };
}

const Page: FC<pageProps> = ({ params }) => {
  const value = params.name; // Extract the value

   type WatchedVideo = {
      uri: string;
      progress: number;
      resumeTime?: number; // ✅ זה השדה החסר
    };
    const [watchedVideos, setWatchedVideos] = useState<WatchedVideo[]>([]);  
  

  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [resumeTime, setResumeTime] = useState<number>(0);

  const [folderName, setFolderName] = useState<string>(""); // Initialize folderName state
  const [videos, setVideos] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [descriptionQuery, setDescriptionQuery] = useState<string>("");
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null); // Track the selected video URI
  const [selectedVideoData, setSelectedVideoData] = useState<any | null>(null); // Track the selected video data
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showHashtagDropdown, setShowHashtagDropdown] = useState(false);
  const { data: session } = useSession();
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionId, setSubscriptionId] = useState(null);
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
  const isVideoOpenRef = useRef<boolean>(false);

  const handleBackButton = (event: PopStateEvent) => {
    if (isVideoOpenRef.current) {
      event.preventDefault(); // Prevent default action
      closeVideo(); // Close the video
    }
  };

  const openVideo = (embedHtml: string) => {
    setSelectedVideo(embedHtml);
    isVideoOpenRef.current = true; // Set video open state
    window.history.pushState({}, "Video", ""); // Push new state when opening video
  };

  const closeVideo = () => {
    setSelectedVideo(null); // Close the video
    isVideoOpenRef.current = false; // Reset video open state
    window.history.pushState({}, ""); // Push an empty state to avoid returning to video
  };

  useEffect(() => {
    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, []); // No dependencies needed here

  useEffect(() => {
    // Fetch folder name based on folder ID (value)

    const fetchFolderName = async () => {
      try {
        const accessToken = process.env.VIMEO_TOKEN;
        const headers = {
          Authorization: `Bearer ${accessToken}`,
        };

        const folderDetailsResponse: AxiosResponse = await axios.get(
          `https://api.vimeo.com/me/projects/${value}`,
          {
            headers,
          },
        );

        const folderDetails = folderDetailsResponse.data;
        const name = folderDetails.name; // Extract the folder name
        setFolderName(name); // Update folderName state with the folder name
      } catch (error) {
        console.error("Error fetching folder details:", error);
      }
    };

    // Call the fetchFolderName function when the component mounts
    fetchFolderName();
  }, [value]); // Include value as a dependency to re-fetch when it changes

  useEffect(() => {
    // Reset the videos and currentPage when a new search is performed

    setVideos([]);
    setCurrentPage(1);
    setNoMoreVideos(false);

    fetchVideos(currentPage);
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
  const apiUrl = `https://api.vimeo.com/me/projects/${value}/videos`;
  const headers = {
    Authorization: `Bearer ${accessToken}`,
  };

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
      const response: AxiosResponse = await axios.get(apiUrl, {
        headers,
        params: {
          page,
          query: descriptionQuery,
          per_page: 50, // Max per request
          fields: "uri,embed.html,name,description,pictures",
        },
      });
  
      const data = response.data;
      const videosData = data.data;
  
      if (!videosData.length) {
        return false; // No more videos to fetch
      }
  
      const newVideos = videosData.map((video: any) => {
        const watched = watchedVideos.find((v) => v.uri === video.uri);
        return {
          uri: video.uri,
          embedHtml: video.embed.html,
          name: video.name,
          description: video.description,
          thumbnailUri: video.pictures.sizes[5].link,
          progress: watched?.progress || 0,
          resumeTime: watched?.resumeTime || 0,
        };
      });
  
      setVideos((prevVideos) => [...prevVideos, ...newVideos]);
  
      // Return true if there's another page
      return !!data.paging?.next;
    } catch (error) {
      console.error("Error fetching videos:", error);
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
            toast.success(`The video add to ${folderName}`);
          } else if (response.data.message === "Video already in favorites") {
            toast.error("Video is already in favorites");
          } else if (
            response.data.message === "videoUri already exists in the folder"
          ) {
            toast.error(`Video already in ${folderName}`);
          } else {
            toast.error("An error occurred");
          }
        } else {
          toast.error("An error occurred");
        }
      } else {
        console.error("User session is not available.");
        toast.error("Please logIn");
      }
    } catch (error) {
      console.error("Error adding video to favorites:", error);
      toast.error("An error occurred");
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
        const uri = selectedVideo.match(/player\.vimeo\.com\/video\/(\d+)/)?.[1];
        const videoUri = uri ? `/videos/${uri}` : null;
        const resumeFrom = watchedVideos.find((v) => v.uri === videoUri)?.resumeTime ?? 0;
      
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
      vimeoPlayer.on("timeupdate", async (data) => {
        const uri = selectedVideo.match(/player\.vimeo\.com\/video\/(\d+)/)?.[1];
        const videoUri = uri ? `/videos/${uri}` : null;
        const duration = await vimeoPlayer.getDuration();
        const percent = Math.floor((data.seconds / duration) * 100);
      
        if (session?.user && videoUri) {
          try {
            await axios.post("/api/mark-watched", {
              userEmail: session.user.email,
              videoUri,
              progress: percent,
              resumeTime: data.seconds,
            });
      
            setWatchedVideos((prev) => {
              const existing = prev.find((v) => v.uri === videoUri);
              if (existing) {
                return prev.map((v) =>
                  v.uri === videoUri
                    ? { ...v, progress: percent, resumeTime: data.seconds }
                    : v
                );
              } else {
                return [...prev, { uri: videoUri, progress: percent, resumeTime: data.seconds }];
              }
            });            
          } catch (err) {
            console.error("❌ Failed to save progress:", err);
          }
        }
      });
      
      // Optional: auto play
      vimeoPlayer.play();

      return () => {
        vimeoPlayer.unload(); // Clean up
      };
    }
  }, [selectedVideo]);


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
        setLoading(false);
      }
    };

    // Fetch user data when the component mounts or when the session changes
    fetchUserData();
  }, [session]);

  if (loading) {
    // Display loading message while checking the subscription status
    return (
      <div className="text-center pt-28">
        <h1 className="text-4xl font-semibold text-gray-700 mb-4">
          Loading...
        </h1>
      </div>
    );
  }

  if (
    subscriptionId === "Admin" ||
    subscriptionStatus === "ACTIVE" ||
    subscriptionStatus === "PENDING_CANCELLATION"
  ) {
    // Render content for users with an active subscription
    return (
      <div className="bg-white min-h-screen text-white pt-20">
        <div className="container mx-auto p-6">
          <h1 className="text-4xl font-bold mb-8 text-black text-center">
            {folderName}
          </h1>

          <p className="text-lg text-gray-700 text-center mb-6">
            {isExpanded
              ? description
              : `${truncatedDescription}${
                  description.length > 200 ? "..." : ""
                }`}

            {/* Only show the button if the description is longer than 200 characters */}
            {description.length > 200 && (
              <button
                className="text-blue-500 hover:text-blue-700 focus:outline-none ml-2"
                onClick={toggleReadMore}
              >
                {isExpanded ? "קרא פחות" : "קרא עוד"}
              </button>
            )}
          </p>

          <div
            style={{ direction: "ltr" }}
            className="flex items-center text-[#EF8354] hover:underline pb-3"
          >
            <Link href="/styles">חזרה לסגנונות</Link>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(e);
            }}
            className="mb-8"
            style={{ direction: "ltr" }}
          >
            <div className="flex items-center relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="חיפוש"
                className="w-full p-3 rounded-l-xl bg-white text-black focus:outline-none border-slate-500 border-2 focus:ring-0"
              />

              <button
                type="submit"
                className="bg-slate-500 hover:bg-slate-700 p-3 rounded-r-xl focus:outline-none border-slate-500 border-2"
              >
                <span role="img" aria-label="Search icon">
                  🔍
                </span>
              </button>

              <button
                className="bg-slate-600 hover:bg-slate-700 w-10 h-10 sm:w-12 sm:h-12 rounded-full ml-2 focus:outline-none focus:ring-4 focus:ring-slate-300 transition duration-200 ease-in-out transform hover:scale-110 flex items-center justify-center text-white"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search query"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* <button
                className="bg-slate-600 hover:bg-slate-700 w-10 h-10 sm:w-12 sm:h-12 rounded-full ml-2 focus:outline-none focus:ring-4 focus:ring-slate-300 transition duration-200 ease-in-out transform hover:scale-110 flex items-center justify-center text-white"
                onClick={toggleHashtagDropdown}
                aria-label="Toggle hashtag dropdown"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 3h14M5 9h14M5 15h14M5 21h14"
                  />
                </svg>
              </button> */}
            </div>

            {showHashtagDropdown && (
              <div className="dropdown relative top-full left-0 mt-1 bg-[#FCF6F5] border border-gray-300 shadow-lg rounded-lg z-10 text-black hashtag-container">
                <p className="text-center text-gray-500 mt-1 text-sm sm:text-base">
                  .בחרו נושא אחד או יותר לחוויה מותאמת אישית
                </p>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 sm:gap-4 p-2 max-h-60 overflow-y-auto">
                  {hashtagOptions.map((hashtag, index) => (
                    <div
                      key={index}
                      className={`px-2 py-1 sm:px-4 sm:py-2 cursor-pointer rounded-md ${
                        searchQuery.includes(hashtag)
                          ? "bg-slate-700 text-white"
                          : "bg-[#FCF6F5]"
                      } hover:bg-slate-500`}
                      onClick={() => handleHashtagClick(hashtag)}
                    >
                      <span
                        className="block overflow-hidden text-ellipsis whitespace-nowrap"
                        dir="rtl"
                      >
                        {hashtag}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-2 text-gray-400 text-xs">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            )}
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {noResults ? (
              <p className="text-center text-gray-500 mt-8">
                <span className="font-bold text-red-600">Oops!</span> 🤷‍♂️ לא
                נמצאו סרטונים עבור הנושא{" "}
                <span className="font-bold">&quot;{searchQuery}&quot;</span> .
                נסה להשתמש בכמות קטנה יותר של נושאים לתוצאות טובות יותר!{" "}
              </p>
            ) : (
              videos.map((video, index) => (
                <div
                  key={video.uri}
                  className="bg-[#FCF6F5] rounded-lg overflow-hidden shadow-md transform hover:scale-105 transition-transform"
                >
                  
                  <div className="flex flex-col h-full">
  {/* תמונה */}
  <div
    className="aspect-w-16 aspect-h-9 cursor-pointer"
    onClick={() => openVideo(video.embedHtml)}
  >
    <img
      src={video.thumbnailUri}
      alt="Video Thumbnail"
      className={`object-cover w-full h-full ${
        watchedVideos.includes(video.uri) ? "grayscale opacity-70" : ""
      }`}
    />
  </div>

  {/* טקסט ותיאור */}
  <div className="flex-1 flex flex-col justify-between p-4">
    <div>
      <h2 className="text-lg font-semibold mb-2 text-black">{video.name}</h2>
      {video.description && (
  <>
    <p className="text-sm mb-2 text-gray-600">
      {expandedDescriptions[index] || video.description.length <= 100
        ? video.description
        : video.description.split(" ").slice(0, 10).join(" ") + " ..."}
    </p>

    {video.description.length > 100 && (
      <button
        className="text-blue-500 hover:underline focus:outline-none"
        onClick={toggleDescription(index)}
      >
        {expandedDescriptions[index] ? "צמצם/י" : "קרא/י עוד"}
      </button>
    )}
  </>
)}
    </div>

    {/* אייקונים בצמוד לתחתית */}
    <div className="flex justify-between items-center pt-4 mt-4">
        <button
          title="נגן"
          className="transition-transform hover:scale-110 bg-[#2D3142] hover:bg-[#4F5D75] text-white w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center"
          onClick={() => openVideo(video.embedHtml)}
        >
          <FaPlay size={16} />
        </button>
      
        {/* סטטוס נצפה */}
        {(() => {
          const watchedInfo = watchedVideos.find((v) => v.uri === video.uri);
          const progress = watchedInfo?.progress || 0;
      
          return (
<div
  className={`text-[11px] text-center px-3 py-1 rounded-full font-semibold shadow whitespace-nowrap ${
    progress >= 99
      ? "bg-green-100 text-green-700"
      : "bg-[#F3E9E8] text-[#833414]"
  }`}
>
  {progress >= 99 ? "✔ נצפה במלואו" : `התקדמות: ${progress}%`}
</div>
          );
        })()}
      
        {/* כפתור מועדפים */}
        <button
          title="הוסף למועדפים"
          className="transition-transform hover:scale-110 bg-[#EF8354] hover:bg-[#D9713C] text-white w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center"
          onClick={() => {
            setSelectedVideoUri(video.uri);
            openModal();
            theUserId();
          }}
        >
          <FaPlus size={16} />
        </button>
      </div>
  </div>
</div>

</div>

              ))
            )}
            {showModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="w-96 p-4 rounded-lg shadow-lg bg-white text-black relative">
                  <button
                    className="absolute top-4 left-4 text-white text-xl cursor-pointer bg-red-500 p-2 rounded-full hover:bg-red-600 transition-all duration-300"
                    onClick={closeModal} // Close the video player
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                  <h2 className="text-2xl mb-4 font-semibold">
                    שמור את הסרטון ל...
                  </h2>
                  <ul className="space-y-3 capitalize font-semibold pt-6">
                    {folderNames.map((folderName) => (
                      <li
                        key={folderName}
                        className="flex items-center justify-between"
                      >
                        <span className="text-lg">{folderName}</span>
                        <button
                          className="ml-2 px-4 py-2 rounded-md bg-[#2D3142] hover:bg-[#4F5D75] text-white  focus:outline-none font-normal"
                          onClick={() => {
                            addToFavorites(selectedVideoUri, folderName);
                            closeModal(); // Close the modal after addToFavorites
                          }}
                        >
                          הוסף לתיקייה
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4">
                    {showForm ? null : (
                      <button
                        className="text-white py-2 px-4 rounded-md bg-[#EF8354] hover:bg-[#D9713C] focus:outline-none"
                        onClick={openForm}
                      >
                        צור רשימת חדשה
                      </button>
                    )}
                  </div>
                  {showForm && (
                    <form onSubmit={handleSubmit} className="mt-4">
                      <label className="block mb-2">
                        <span className="text-lg font-semibold">שם:</span>
                        <input
                          type="text"
                          value={playlistName}
                          onChange={handlePlaylistNameChange}
                          className="w-full rounded-md bg-gray-100 text-black py-1 px-2 focus:outline-none"
                          placeholder="הכנס שם"
                        />
                      </label>
                      <div className="mt-2">
                        <button
                          className="text-white py-2 px-4 rounded-md bg-[#EF8354] hover:bg-[#D9713C] focus:outline-none"
                          type="submit"
                        >
                          צור
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="mt-8">
            {noMoreVideos && (
              <p className="text-center text-gray-500 mt-8">
                אין עוד סרטונים לטעון.
              </p>
            )}
            {!noMoreVideos && (
              <button
                className="bg-[#2D3142] hover:bg-[#4F5D75] text-white px-6 py-4 rounded-md focus:outline-none"
                onClick={loadMore}
              >
                טען עוד
              </button>
            )}
          </div>
        </div>
        {selectedVideo && (
          <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-70 z-50 flex items-center justify-center">
            <div
              className="video-container w-full max-w-4xl aspect-video"
              ref={videoContainerRef}
            />

            <button
              className="absolute top-4 right-4 text-white text-xl cursor-pointer bg-red-600 p-2 rounded-full hover:bg-red-700 transition-all duration-300"
              onClick={() => {
                setSelectedVideo(null);
                setResumeTime(0);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    );
  } else {
    // Render content for users without an active subscription
    return (
      <div className="text-center mt-28">
        <h1 className="text-4xl font-semibold text-gray-700 mb-4">
          המנוי שלך אינו פעיל.
        </h1>
        <div className="mt-10 flex items-center justify-center">
          <a
            href="/#Pricing"
            className="rounded-full bg-[#2D3142] px-6 py-3 text-lg text-white shadow-lg hover:bg-[#4F5D75] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            הירשם כאן
          </a>
        </div>
      </div>
    );
  }
};

export default Page;
