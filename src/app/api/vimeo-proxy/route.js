import { NextResponse } from "next/server";
import axios from "axios";

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

    // Use Promise.allSettled to parallelize all API calls and prevent blocking
    const videoPromises = videoIds.map(async (videoId) => {
      try {
        // Skip empty or invalid video IDs
        if (!videoId || typeof videoId !== 'string') {
          return null;
        }
        
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
            fields: "uri,embed.html,name,description,pictures,duration",
          },
          timeout: 5000 // Prevent hanging requests
        });
        
        if (!res.data || !res.data.uri) {
          return null;
        }
        
        // Return video data
        return {
          uri: res.data.uri,
          embedHtml: res.data.embed?.html || "",
          name: res.data.name || "Untitled Video",
          description: res.data.description || "",
          thumbnailUri: res.data.pictures?.sizes?.[5]?.link || "",
          duration: res.data.duration || 0,
        };
      } catch (error) {
        console.warn(`Failed to fetch video ${videoId}:`, error.message);
        return null; // Return null for failed requests
      }
    });
    
    // Wait for all requests to complete (successful or failed)
    const settledResults = await Promise.allSettled(videoPromises);
    
    // Extract successful results
    const results = settledResults
      .filter(result => result.status === 'fulfilled' && result.value !== null)
      .map(result => result.value);

    return NextResponse.json({ videos: results }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
