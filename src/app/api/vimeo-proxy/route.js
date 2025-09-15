import { NextResponse } from "next/server";
import axios from "axios";

// Cache for individual video data
const videoDataCache = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes for individual videos

export async function POST(request) {
  try {
    const body = await request.json();
    const { videoIds } = body;
    
    if (!videoIds || !Array.isArray(videoIds) || videoIds.length === 0) {
      return NextResponse.json({ message: "Missing or invalid videoIds" }, { status: 400 });
    }

    // Get Vimeo token from server environment
    const accessToken = process.env.VIMEO_TOKEN;
    
    if (!accessToken) {
      return NextResponse.json({ message: "Server configuration error" }, { status: 500 });
    }
    
    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };
    
    // Check cache first and separate cached from uncached videos
    const cachedVideos = [];
    const uncachedVideoIds = [];
    
    videoIds.forEach(videoId => {
      if (!videoId || typeof videoId !== 'string') return;
      
      const cached = videoDataCache.get(videoId);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        cachedVideos.push(cached.data);
      } else {
        uncachedVideoIds.push(videoId);
      }
    });

    // Only fetch uncached videos
    const videoPromises = uncachedVideoIds.map(async (videoId) => {
      try {
        // Extract video ID from URI if needed
        let cleanVideoId;
        
        if (videoId.includes('/videos/')) {
          const parts = videoId.split('/videos/');
          cleanVideoId = parts[1];
        } else {
          cleanVideoId = videoId.replace(/\D/g, '');
        }
        
        // Skip if we don't have a valid ID after cleaning
        if (!cleanVideoId) {
          return null;
        }
        
        const apiUrl = `https://api.vimeo.com/videos/${cleanVideoId}`;
        
        const res = await axios.get(apiUrl, {
          headers,
          params: {
            fields: "uri,embed.html,name,description,pictures.sizes,duration",
          },
          timeout: 8000 // Increased timeout for production
        });
        
        if (!res.data || !res.data.uri) {
          return null;
        }
        
        // Create video data object
        const videoData = {
          uri: res.data.uri,
          embedHtml: res.data.embed?.html || "",
          name: res.data.name || "Untitled Video",
          description: res.data.description || "",
          thumbnailUri: res.data.pictures?.sizes?.[5]?.link || "",
          duration: res.data.duration || 0,
        };
        
        // Cache the result
        videoDataCache.set(videoId, {
          data: videoData,
          timestamp: Date.now()
        });
        
        return videoData;
      } catch (error) {
        console.warn(`Failed to fetch video ${videoId}:`, error.message);
        return null;
      }
    });
    
    // Wait for all uncached requests to complete
    const settledResults = await Promise.allSettled(videoPromises);
    
    // Extract successful results from API calls
    const newResults = settledResults
      .filter(result => result.status === 'fulfilled' && result.value !== null)
      .map(result => result.value);
    
    // Combine cached and new results
    const allResults = [...cachedVideos, ...newResults];
    
    // Clean old cache entries periodically
    if (videoDataCache.size > 200) {
      const entries = Array.from(videoDataCache.entries());
      const oldEntries = entries
        .filter(([key, value]) => Date.now() - value.timestamp > CACHE_DURATION)
        .slice(0, 50); // Remove 50 old entries at a time
      
      oldEntries.forEach(([key]) => videoDataCache.delete(key));
    }

    return NextResponse.json({ videos: allResults }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
