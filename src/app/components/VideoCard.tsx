"use client";

import React, { useState } from 'react';
import { FaPlay, FaPlus, FaShare, FaCheck } from 'react-icons/fa';
import NewVideoProgressBadge from './NewVideoProgressBadge';
import toast from 'react-hot-toast';

interface VideoCardProps {
  video: any;
  watchedVideos: any[];
  isExpanded: boolean;
  onToggleDescription: () => void;
  onPlayVideo: (embedHtml: string) => void;
  onAddToFavorites: (videoUri: string) => void;
  isAdmin?: boolean;
}

const VideoCard = ({
  video,
  watchedVideos,
  isExpanded,
  onToggleDescription,
  onPlayVideo,
  onAddToFavorites,
  isAdmin = false
}: VideoCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Helper function to format duration from seconds to H:MM:SS or MM:SS
  const formatDuration = (seconds: number): string => {
    if (!seconds || seconds <= 0) return "--:--";
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
  };
  
  const copyVideoId = async () => {
    const videoId = video.uri.split('/').pop();
    try {
      await navigator.clipboard.writeText(videoId);
      setCopied(true);
      toast.success(`מזהה סרטון הועתק: ${videoId}`);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('שגיאה בהעתקת מזהה הסרטון');
    }
  };
  
  // Debug the video prop
  console.log('VideoCard received video prop:', video);
  console.log('Video name property:', video?.name);
  
  // Find if this video has been watched
  const watchedVideo = watchedVideos.find((v) => {
    // Extract video ID from both URIs for comparison
    const watchedVideoId = v.uri.split('/').pop();
    const currentVideoId = video.uri.split('/').pop();
    return watchedVideoId === currentVideoId;
  });

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      <div
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img
          src={video.thumbnailUri || video.pictures?.sizes?.[5]?.link || video.pictures?.sizes?.[4]?.link || '/placeholder-image.svg'}
          alt={video.name || 'Video'}
          className="w-full h-48 object-cover"
        />
        
        {/* Video Duration Badge */}
        {video.duration && (
          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md font-medium">
            {formatDuration(video.duration)}
          </div>
        )}
        {/* Admin Copy Icon */}
        {isAdmin && (
          <button
            onClick={copyVideoId}
            className="absolute top-2 left-2 bg-[#D5C4B7] hover:bg-[#B8A99C] text-[#2D3142] p-2 rounded-full transition-all duration-200 z-20 shadow-md hover:shadow-lg"
            title="העתק מזהה סרטון להודעה"
          >
            {copied ? <FaCheck className="text-green-600" /> : <FaShare />}
          </button>
        )}
        
        {/* Create a placeholder div that reserves space but doesn't affect layout */}
        <div className="absolute top-2 right-2 w-12 h-12 pointer-events-none"></div>
        {watchedVideo && (
          <NewVideoProgressBadge
            progress={watchedVideo.progress}
            className="top-2 right-2 z-10"
            size="md"
            variant="fancy"
            showLabel={true}
          />
        )}
        <div
          className={`absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            onClick={() => onPlayVideo(video.embed?.html || `<iframe src="https://player.vimeo.com/video/${video.uri?.split('/').pop()}" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>`)}
            className="bg-[#EF8354] hover:bg-[#D9713C] text-white p-3 rounded-full transition-all duration-300 transform hover:opacity-90"
          >
            <FaPlay />
          </button>
        </div>
      </div>
      <div className="p-4 flex-grow">
        <div className="flex justify-between items-start w-full">
          <h3 className="text-lg font-semibold mb-2 text-right flex-grow text-black">
            {video.name || 'Untitled Video'}
          </h3>
          <button
            onClick={() => onAddToFavorites(`/videos/${video.uri.split('/').pop()}`)}
            className="text-gray-500 hover:text-[#EF8354] transition-colors duration-300 ml-2"
          >
            <FaPlus />
          </button>
        </div>
        <div className="mb-2">
          <p
            className={`text-gray-600 text-sm text-right ${
              isExpanded ? "" : "line-clamp-2"
            }`}
          >
            {video.description}
          </p>
          {video.description && video.description.length > 100 && (
            <button
              onClick={onToggleDescription}
              className="text-[#4F5D75] hover:text-[#2D3142] text-xs mt-1 focus:outline-none text-right block w-full"
            >
              {isExpanded ? "הצג פחות" : "הצג יותר"}
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1 mt-2 justify-end">
          {video.tags?.length > 0 ? (
            video.tags.map((tag: string, idx: number) => (
              <span
                key={idx}
                className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
