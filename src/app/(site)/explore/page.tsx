"use client";

import React, { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";

const Page = () => {
  const [videos, setVideos] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [descriptionQuery, setDescriptionQuery] = useState<string>("");
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null); // Track the selected video URI
  const [selectedVideoData, setSelectedVideoData] = useState<any | null>(null); // Track the selected video data
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showHashtagDropdown, setShowHashtagDropdown] = useState(false);
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);

  useEffect(() => {
    // Reset the videos and currentPage when a new search is performed
    setVideos([]);
    setCurrentPage(1);
    fetchVideos(currentPage);
  }, [descriptionQuery]); // Include descriptionQuery as a dependency

  const accessToken = "a7acf4dcfec3abd4ebab0f8162956c65";
  const apiUrl = "https://api.vimeo.com/me/videos";
  const headers = {
    Authorization: `Bearer ${accessToken}`,
  };

  const fetchVideos = async (page: number) => {
    try {
      const response: AxiosResponse = await axios.get(apiUrl, {
        headers,
        params: {
          page,
          query: descriptionQuery, // Include the description query in the API request
          fields: "uri,embed.html,name,description,pictures", // Request embed HTML and video title
        },
      });

      const data = response.data;
      const videosData = data.data;
      const newVideos = videosData.map((video: any) => ({
        uri: video.uri,
        embedHtml: video.embed.html,
        name: video.name,
        description: video.description,
        thumbnailUri: video.pictures.sizes[5].link,
        // Extract the video title from the API response
      }));

      console.log("Response Data:", response.data);
      // Append the new videos to the existing list of videos
      setVideos((prevVideos) => [...prevVideos, ...newVideos]);

      // Check if there are more pages to fetch
      if (page < data.paging.total_pages) {
        // If there are more pages, increment the current page
        setCurrentPage(page + 1);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const hashtagOptions = [
    "תרגול",
    "לב",
    "flystick",
    "רגלים",
    "גב",
    "useclient",
    "webdevelopment",
    "coding",
    "frontend",
    "reactjs",
    "useclient",
    "webdevelopment",
    "coding",
    "frontend",
    "reactjs",
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

    // Close the hashtag dropdown

    // Set the search query
    setDescriptionQuery(searchQuery);
  };

  const loadMore = () => {
    // Increment the current page to fetch the next page of videos
    setCurrentPage(currentPage + 1); // Increment currentPage here
    fetchVideos(currentPage + 1); // Pass the updated currentPage
  };

  const [showFullDescription, setShowFullDescription] =
    useState<boolean>(false);

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  return (
    <div className="bg-white min-h-screen text-white pt-20">
      <div className="container mx-auto p-6">
        <h1 className="text-4xl font-bold mb-8">Explore Videos</h1>
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex items-center relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for videos..."
              className="w-full p-4 rounded-l-md bg-white text-black focus:outline-none"
            />
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 px-6 py-4 rounded-r-md focus:outline-none"
              onClick={handleSearch}
            >
              Search
            </button>
            <button
              className="bg-blue-600 hover:bg-blue-700 px-4 py-4 rounded-md ml-2 focus:outline-none"
              onClick={toggleHashtagDropdown} // Toggle dropdown visibility
            >
              Hashtag
            </button>
          </div>
          {showHashtagDropdown && (
            <div className="dropdown relative top-full left-0 mt-1 bg-white border border-gray-300 shadow-lg rounded-lg z-10 text-black hashtag-container">
              <div className="grid md:grid-cols-5 sm:grid-cols-3">
                {hashtagOptions.map((hashtag, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleHashtagClick(hashtag)}
                  >
                    {hashtag}
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>
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
            </div>
          ))}
        </div>
        <div className="mt-8">
          <button
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-md focus:outline-none"
            onClick={loadMore}
          >
            Load More
          </button>
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

{
  /* <div className=" absolute video-info bottom-0 left-0 bg-black  text-white sm:px-20 ">
            <h2 className="text-lg font-semibold mb-2">
              {selectedVideoData.name}
            </h2>
            <p className="text-sm mb-2">{selectedVideoData.description}</p>
          </div> */
}
