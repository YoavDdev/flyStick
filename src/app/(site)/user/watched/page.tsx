"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Player from "@vimeo/player";
import { FaEyeSlash, FaPlay } from "react-icons/fa";

const Page = () => {
  const { data: session } = useSession();
  const [watchedUris, setWatchedUris] = useState<{ uri: string; progress: number; resumeTime?: number }[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [player, setPlayer] = useState<Player | null>(null);

    type WatchedVideo = {
      uri: string;
      progress: number;
      resumeTime?: number; // ✅ זה השדה החסר
    };
    const [watchedVideos, setWatchedVideos] = useState<WatchedVideo[]>([]);  

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
    
  
  const handleUnwatch = async (videoUri: string) => {
    if (!session?.user?.email) return toast.error("You must be logged in");

    try {
      await axios.delete("/api/mark-watched", {
        data: {
          userEmail: session.user.email,
          videoUri,
        },
      });

      setWatchedUris((prev) => prev.filter((v) => v.uri !== videoUri));
      setVideos((prev) => prev.filter((v) => v.uri !== videoUri));
      toast.success("הוסר מהרשימה");
    } catch (err) {
      console.error("Failed to remove watched status", err);
      toast.error("שגיאה בהסרה");
    }
  };

  useEffect(() => {
    const fetchVimeoVideos = async () => {
      if (watchedVideos.length === 0) return;
  
      const accessToken = process.env.VIMEO_TOKEN;
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };
  
      const promises = watchedVideos.map(async ({ uri, progress, resumeTime }) => {
        const res = await axios.get(`https://api.vimeo.com${uri}`, {
          headers,
          params: {
            fields: "uri,embed.html,name,description,pictures",
          },
        });
  
        return {
          uri: res.data.uri,
          embedHtml: res.data.embed.html,
          name: res.data.name,
          description: res.data.description,
          thumbnailUri: res.data.pictures.sizes[5].link,
          progress,
          resumeTime: resumeTime ?? 0, // ✅ קריטי
        };
      });
  
      const fetched = await Promise.all(promises);
      setVideos(fetched);
    };
  
    fetchVimeoVideos();
  }, [watchedVideos]);
  

  return (
    <div className="bg-white min-h-screen text-white pt-20">
      <div className="container mx-auto p-6">
        <h1 className="text-4xl font-semibold text-gray-700 mb-4 text-center capitalize">
          סרטונים שסומנו כנצפו
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {videos.map((video) => (
            <div
              key={video.uri}
              className="bg-[#FCF6F5] rounded-lg overflow-hidden shadow-md transform hover:scale-105 transition-transform"
            >
              <div className="flex flex-col h-full">
                <div
                  className="aspect-w-16 aspect-h-9 cursor-pointer"
                  onClick={() => setSelectedVideo(video.embedHtml)}
                >
                  <img
                    src={video.thumbnailUri}
                    alt={video.name}
                    className="object-cover w-full h-full"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between p-4">
                  <div>
                    <h2 className="text-lg font-semibold mb-2 text-black">
                      {video.name}
                    </h2>
                    {video.description && (
                      <p className="text-sm mb-2 text-gray-600">
                        {video.description.length > 100
                          ? video.description.slice(0, 100) + "..."
                          : video.description}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-4 mt-4 gap-2">
                    <button
                      title="נגן"
                      className="transition-transform hover:scale-110 bg-[#2D3142] hover:bg-[#4F5D75] text-white w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center"
                      onClick={() => setSelectedVideo(video.embedHtml)}
                    >
                      <FaPlay size={16} />
                    </button>

                    <div
  className={`text-[11px] text-center px-3 py-1 rounded-full font-semibold shadow whitespace-nowrap ${
    video.progress >= 99
      ? "bg-green-100 text-green-700"
      : "bg-[#F3E9E8] text-[#833414]"
  }`}
>
  {video.progress >= 99 ? "✔ נצפה במלואו" : `התקדמות: ${video.progress}%`}
</div>

                    <button
                      title="הסר סימון כנצפה"
                      className="transition-transform hover:scale-110 bg-gray-500 hover:bg-gray-600 text-white w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center"
                      onClick={() => handleUnwatch(video.uri)}
                    >
                      <FaEyeSlash size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
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
            onClick={() => setSelectedVideo(null)}
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
