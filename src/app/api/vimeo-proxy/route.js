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

    // Process videos with error handling
    const results = [];
    
    for (const videoId of videoIds) {
      try {
        // Skip empty or invalid video IDs
        if (!videoId || typeof videoId !== 'string') {
          continue;
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
          continue;
        }
          
        const apiUrl = `https://api.vimeo.com/videos/${cleanVideoId}`;
        
        const res = await axios.get(apiUrl, {
          headers,
          params: {
            fields: "uri,embed.html,name,description,pictures,duration",
          },
        });
        
        if (!res.data || !res.data.uri) {
          continue;
        }
        
        // Add to results array
        results.push({
          uri: res.data.uri,
          embedHtml: res.data.embed?.html || "",
          name: res.data.name || "Untitled Video",
          description: res.data.description || "",
          thumbnailUri: res.data.pictures?.sizes?.[5]?.link || "",
          duration: res.data.duration || 0,
        });
      } catch (error) {
        // Silently continue with other videos
      }
    }

    return NextResponse.json({ videos: results }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
