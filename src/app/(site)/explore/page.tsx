"use client";

import React, { useEffect, useState, useRef } from "react";
import axios, { AxiosResponse } from "axios";
import { useSession, signOut } from "next-auth/react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import Player from "@vimeo/player";

const Page = () => {
  const [watchedVideos, setWatchedVideos] = useState<string[]>([]);

  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [resumeTime, setResumeTime] = useState<number>(0);

  const [videos, setVideos] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [descriptionQuery, setDescriptionQuery] = useState<string>("");
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null); // Track the selected video URI
  const [selectedVideoData, setSelectedVideoData] = useState<any | null>(null); // Track the selected video data
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showHashtagDropdown, setShowHashtagDropdown] = useState(false);
  const { data: session } = useSession();
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
          fields: "uri,embed.html,name,description,pictures",
        },
      });

      const data = response.data;
      const videosData = data.data;

      if (videosData.length === 0 && page === 1) {
        // Set noResults to true if no videos are found on the first page
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
    if (selectedVideo && videoContainerRef.current) {
      const uri = selectedVideo.match(/player\.vimeo\.com\/video\/(\d+)/)?.[1];
      if (!uri) return;

      const vimeoPlayer = new Player(videoContainerRef.current, {
        id: Number(uri),
        width: 640,
      });

      setPlayer(vimeoPlayer);

      // Resume from saved time
      vimeoPlayer.on("loaded", () => {
        vimeoPlayer.setCurrentTime(resumeTime);
      });

      // Update the resume time on pause or timeupdate
      vimeoPlayer.on("timeupdate", (data) => {
        setResumeTime(data.seconds);
      });

      // Optional: auto play
      vimeoPlayer.play();

      return () => {
        vimeoPlayer.unload(); // Clean up
      };
    }
  }, [selectedVideo]);

  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [loading, setLoading] = useState(true);
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
        <h1 className="text-4xl font-semibold text-gray-700 mb-4">טעינה...</h1>
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
      <div className="bg-white min-h-screen pt-20">
        <div className="container mx-auto p-6">
          <div className="mx-auto max-w-7xl px-8 pb-10">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-base font-semibold leading-7 text-[#990011] no-wrap">
                המסע שלך והצרכים שלך בהתאמה אישית
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                גלו את השיעור הבא שלכם
              </p>
              <div className="text-center mt-2 sm:hidden">
                <p className="text-gray-500">
                  הקלידו נושא אחד או יותר או בחרו מתפריט ה-#
                </p>
              </div>
            </div>
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

              <button
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
              </button>
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
              videos
                .filter((video) => !video.name.startsWith("[PRV]"))
                .map((video, index) => (
                  <div
                    key={video.uri}
                    className="bg-[#FCF6F5] rounded-lg overflow-hidden shadow-md transform hover:scale-105 transition-transform"
                  >
                    <div
                      className="aspect-w-16 aspect-h-9 cursor-pointer" // Add cursor-pointer for better UX
                      onClick={() => openVideo(video.embedHtml)}
                    >
                      <img
                        src={video.thumbnailUri}
                        alt="Video Thumbnail"
                        className={`object-cover w-full h-full ${
                          watchedVideos.includes(video.uri)
                            ? "grayscale opacity-70"
                            : ""
                        }`}
                      />
                    </div>
                    <div className="p-4">
                      <h2 className="text-lg font-semibold mb-2 text-black">
                        {video.name}
                      </h2>
                      <p className="text-sm mb-2 text-gray-600">
                        {expandedDescriptions[index]
                          ? video.description
                          : video.description
                          ? video.description
                              .split(" ")
                              .slice(0, 10)
                              .join(" ") + " ..."
                          : ""}
                      </p>
                      {!expandedDescriptions[index] && video.description && (
                        <button
                          className="text-blue-500 hover:underline focus:outline-none"
                          onClick={toggleDescription(index)}
                        >
                          קרא/י עוד
                        </button>
                      )}
                      {expandedDescriptions[index] && (
                        <button
                          className="text-blue-500 hover:underline focus:outline-none"
                          onClick={toggleDescription(index)}
                        >
                          צמצם/י
                        </button>
                      )}
                      <div className="pt-4 flex flex-wrap gap-2 justify-between">
                        <button
                          className="bg-[#2D3142] hover:bg-[#4F5D75] text-white px-4 py-2 rounded-full focus:outline-none"
                          onClick={() => openVideo(video.embedHtml)}
                        >
                          נגן
                        </button>

                        <button
                         className={`whitespace-nowrap ${
                          watchedVideos.includes(video.uri)
                            ? "bg-gray-400 hover:bg-gray-500"
                            : "bg-[#833414] hover:bg-[#A3442D]"
                          } text-white px-3 py-1 rounded-full focus:outline-none text-xs`}
                          onClick={async () => {
                            if (!session || !session.user) {
                              toast.error("Please log in");
                              return;
                            }

                            const alreadyWatched = watchedVideos.includes(
                              video.uri,
                            );

                            try {
                              if (alreadyWatched) {
                                await axios.delete("/api/mark-watched", {
                                  data: {
                                    userEmail: session.user.email,
                                    videoUri: video.uri,
                                  },
                                });
                                setWatchedVideos((prev) =>
                                  prev.filter((uri) => uri !== video.uri),
                                );
                              } else {
                                await axios.post("/api/mark-watched", {
                                  userEmail: session.user.email,
                                  videoUri: video.uri,
                                });
                                setWatchedVideos((prev) => [
                                  ...prev,
                                  video.uri,
                                ]);
                              }
                            } catch (err) {
                              console.error(err);
                              toast.error("Something went wrong");
                            }
                          }}
                        >
                          {watchedVideos.includes(video.uri)
                            ? "✔ נצפה (לחץ לביטול)"
                            : "סימון כנצפה"}
                        </button>

                        <button
                          className="bg-[#EF8354] hover:bg-[#D9713C] text-white px-4 py-2 rounded-full focus:outline-none"
                          onClick={() => {
                            setSelectedVideoUri(video.uri);
                            openModal();
                            theUserId();
                          }}
                        >
                          +
                        </button>
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
              onClick={closeVideo}
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
