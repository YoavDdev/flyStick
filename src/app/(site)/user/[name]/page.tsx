"use client";

import React, { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { useSession, signOut } from "next-auth/react";
import { toast } from "react-hot-toast";

const Page = () => {
  const [videos, setVideos] = useState<any[]>([]);

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

  const videoIds = ["874531983", "822936523", "822654166"];

  useEffect(() => {
    setVideos([]);

    videoIds.forEach((videoId) => {
      fetchVideo(videoId);
    });
  }, [descriptionQuery]);

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

  const accessToken = "a7acf4dcfec3abd4ebab0f8162956c65";
  const videoId = [""];
  const apiUrl = `https://api.vimeo.com/videos/${videoId}`;
  const headers = {
    Authorization: `Bearer ${accessToken}`,
  };

  const fetchVideo = async (videoId: string) => {
    try {
      const apiUrl = `https://api.vimeo.com/videos/${videoId}`;
      const response: AxiosResponse = await axios.get(apiUrl, {
        headers,
        params: {
          fields: "uri,embed.html,name,description,pictures",
        },
      });

      const videoData = response.data;

      const video = {
        uri: videoData.uri,
        embedHtml: videoData.embed.html,
        name: videoData.name,
        description: videoData.description,
        thumbnailUri: videoData.pictures.sizes[5].link,
      };

      // Add the retrieved video to the 'videos' array
      setVideos((prevVideos) => [...prevVideos, video]);
    } catch (error) {
      console.error("Error fetching video:", error);
    }
  };

  const [showFullDescription, setShowFullDescription] =
    useState<boolean>(false);

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
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
            toast.success("Added to favorites");
          } else if (response.data.message === "Video already in favorites") {
            toast.error("Video is already in favorites");
          } else if (
            response.data.message === "videoUri already exists in the folder"
          ) {
            toast.error("videoUri already exists in the folder");
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
    addToFavorites(selectedVideoUri, playlistName);
    setPlaylistName("");
    setShowForm(false);
    closeModal();
  };

  return (
    <div className="bg-white min-h-screen text-white pt-20">
      <div className="container mx-auto p-6">
        <h1 className="text-4xl font-bold mb-8  text-black">Explore Videos</h1>

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
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full focus:outline-none absolute bottom-4 right-4" // Position the button at the bottom-right corner
                    onClick={() => {
                      setSelectedVideo(video.embedHtml);
                      setSelectedVideoData(video);
                    }}
                  >
                    Play
                  </button>
                </div>
                <button
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full focus:outline-none absolute bottom-4 left-4"
                  onClick={() => {
                    setSelectedVideoUri(video.uri); // Set the selected video URI
                    openModal(); // Open the modal
                    theUserId();
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    fontSize: "24px",
                  }}
                >
                  +
                </button>
              </div>
            </div>
          ))}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-70">
              <div className="absolute w-96 p-4 rounded-lg shadow-lg bg-white text-black">
                <button
                  className="absolute top-2 right-2 text-2xl text-red-600 hover:text-red-800 px-2"
                  onClick={closeModal}
                >
                  X
                </button>
                <h2 className="text-2xl mb-4">Save video to ...</h2>
                <ul>
                  <ul>
                    {folderNames.map((folderName) => (
                      <li key={folderName}>
                        <input
                          type="checkbox"
                          onChange={() =>
                            addToFavorites(selectedVideoUri, folderName)
                          }
                        />
                        <label className="px-4">{folderName}</label>
                      </li>
                    ))}
                  </ul>
                </ul>
                <div>
                  {showForm ? null : (
                    <button
                      className="text-red-600 hover:text-red-800 pt-4"
                      onClick={openForm}
                    >
                      Create new playlist
                    </button>
                  )}
                </div>
                {showForm && (
                  <form onSubmit={handleSubmit} className="p-2">
                    <label>
                      Name:
                      <input
                        type="text"
                        value={playlistName}
                        onChange={handlePlaylistNameChange}
                        className="w-full  rounded-md bg-white text-black focus:outline-none"
                        placeholder="Enter Playlist name..."
                      />
                    </label>
                    <div>
                      <button
                        className="text-red-600 hover:text-red-800 pt-4"
                        type="submit"
                      >
                        Create
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
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
