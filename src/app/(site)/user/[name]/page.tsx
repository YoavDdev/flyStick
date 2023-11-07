"use client";

import { FC, useEffect, useState } from "react";
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
        });
    }
  }, [session, params.name]);
  const accessToken = "a7acf4dcfec3abd4ebab0f8162956c65";
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

  return (
    <div className="bg-white min-h-screen text-white pt-20">
      <div className="container mx-auto p-6">
        {loading ? ( // Display a loading indicator when loading is true
          <h1 className="text-4xl font-bold mb-8 text-black">Loading...</h1>
        ) : videos.length === 0 ? (
          <h1 className="text-4xl font-bold mb-8 text-black">
            This folder is empty ({decodedString})
          </h1>
        ) : (
          <h1 className="text-4xl font-bold mb-8 text-black">
            {decodedString}
          </h1>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {videos.map((video) => (
            <div
              key={video.uri}
              className="bg-[#FCF6F5] rounded-lg overflow-hidden shadow-md transform hover:scale-105 transition-transform"
            >
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={video.thumbnailUri}
                  alt="Video Thumbnail"
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-2 text-black">
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
                    Read More
                  </button>
                )}
                {showFullDescription && (
                  <button
                    className="text-blue-500 hover:underline focus:outline-none"
                    onClick={toggleDescription}
                  >
                    Show Less
                  </button>
                )}
                <div className="py-8">
                  <button
                    className="bg-[#2D3142] hover:bg-[#4F5D75] text-white px-4 py-2 rounded-full focus:outline-none absolute bottom-4 right-4" // Position the button at the bottom-right corner
                    onClick={() => {
                      setSelectedVideo(video.embedHtml);
                      setSelectedVideoData(video);
                    }}
                  >
                    Play
                  </button>
                </div>
                <Link
                  href={`/user/${value}`}
                  onClick={() => removeVideo(video.uri)}
                  className="bg-red-800 hover:bg-red-700 text-white px-4 py-2 rounded-full focus:outline-none absolute bottom-4 left-4"
                >
                  Remove
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
};

export default Page;
