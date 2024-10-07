"use client";

import { FC, useEffect, useState , useRef } from "react";
import axios, { AxiosResponse } from "axios";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { toast } from "react-hot-toast";

interface pageProps {
  params: { name: string };
}

const Page: FC<pageProps> = ({ params }) => {
  const value = params.name; // Extract the value
  const decodedString = decodeURIComponent(value);

  const [videos, setVideos] = useState<any[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVideoData, setSelectedVideoData] = useState<any | null>(null);
  const [folderUrls, setFolderUrls] = useState<string[]>([]);
  const { data: session } = useSession();
  const [displayEmptyMessage, setDisplayEmptyMessage] = useState(false);
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
    setLoading(true);
    if (session && session.user) {
      const folderName = decodeURIComponent(params.name);

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
          console.error("Error fetching folder URLs:", error);
        })
        .finally(() => {
          setLoading(false);
          // Set a timeout to display the empty message after 2 seconds
          setTimeout(() => setDisplayEmptyMessage(true), 4000);
        });
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
  }

  const fetchVideos = async (videoIds: string[]) => {
    try {
      const fetchedVideos: Video[] = [];

      for (const videoId of videoIds) {
        const apiUrl = `https://api.vimeo.com${videoId}`;
        const response: AxiosResponse = await axios.get(apiUrl, {
          headers,
          params: {
            fields: "uri,embed.html,name,description,pictures",
          },
        });

        const videoData = response.data;
        const video: Video = {
          uri: videoData.uri,
          embedHtml: videoData.embed.html,
          name: videoData.name,
          description: videoData.description,
          thumbnailUri: videoData.pictures.sizes[5].link,
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

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
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
      <div className="text-center pt-28 h-screen">
        <h1 className="text-4xl font-semibold text-gray-700 mb-4">
          טעינה...
        </h1>
      </div>
    );
  }

  // Check if the videos array is empty
  if (videos.length === 0 && !loading && displayEmptyMessage) {
    return (
      <div className="text-center mt-28 h-screen">
        <h1 className="text-4xl font-semibold text-gray-700 mb-4 capitalize">
          {decodedString} folder is empty
        </h1>
      </div>
    );
  }

  if (subscriptionId === "Admin" || subscriptionStatus === "ACTIVE" || subscriptionStatus === "PENDING_CANCELLATION") {
    // Render content for users with an active subscription

    return (
      <div className="bg-white min-h-screen text-white pt-20">
        <div className="container mx-auto p-6">
          <h1 className="text-4xl font-semibold text-gray-700 mb-4 text-center capitalize">
            {decodedString}
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {videos.map((video) => (
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
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="p-4">
                  <h2 className="text-lg font-semibold mb-2 text-black ">
                    {video.name}
                  </h2>
                  <p className="text-sm mb-2 text-gray-600 ">
                    {showFullDescription && video.description}
                    {!showFullDescription &&
                      (video.description
                        ? video.description.split(" ").slice(0, 10).join(" ") +
                          " ..."
                        : "")}
                  </p>
                  {!showFullDescription && video.description && (
                    <button
                      className="text-blue-500 hover:underline focus:outline-none"
                      onClick={toggleDescription}
                    >
                      קראה עוד
                    </button>
                  )}
                  {showFullDescription && (
                    <button
                      className="text-blue-500 hover:underline focus:outline-none"
                      onClick={toggleDescription}
                    >
                      הצג פחות
                    </button>
                  )}
                  <div className="py-8">
                    <button
                      className="bg-[#2D3142] hover:bg-[#4F5D75] text-white px-4 py-2 rounded-full focus:outline-none absolute bottom-4 right-4" // Position the button at the bottom-right corner
                      onClick={() => openVideo(video.embedHtml)}
                    >
                      נגן
                    </button>
                  </div>
                  <Link
                    href={`/user/${value}`}
                    onClick={() => removeVideo(video.uri)}
                    className="bg-red-800 hover:bg-red-700 text-white px-4 py-2 rounded-full focus:outline-none absolute bottom-4 left-4"
                  >
                    הסר
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
        {selectedVideo && (
          // Display the selected video player

          <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-70 z-50 flex items-center justify-center">
            <div className="video-container">
              <div dangerouslySetInnerHTML={{ __html: selectedVideo }} />
            </div>

            <button
              className="absolute top-4 right-4 text-white text-xl cursor-pointer bg-red-600 p-2 rounded-full hover:bg-red-700 transition-all duration-300"
              onClick={() => setSelectedVideo(null)} // Close the video player
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
