import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// Cache for video data to reduce API calls
const videoCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// This API route proxies requests to the Vimeo API to keep the token secure
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const query = searchParams.get("query") || "";
    
    // Create cache key
    const cacheKey = `${page}-${query}`;
    const cached = videoCache.get(cacheKey);
    
    // Return cached data if available and not expired
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data);
    }
    
    // Use the same Vimeo API URL and headers as explore/page.tsx
    const apiUrl = "https://api.vimeo.com/me/videos";
    const accessToken = process.env.VIMEO_TOKEN;
    
    if (!accessToken) {
      console.error("Missing Vimeo access token");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }
    
    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };
    
    // Make the request to Vimeo API with timeout and optimized fields
    const response = await axios.get(apiUrl, {
      headers,
      params: {
        page,
        query,
        fields: "uri,embed.html,name,description,pictures.sizes,duration",
        per_page: 25, // Increased from default 20 for better batching
      },
      timeout: 10000, // 10 second timeout
    });
    
    // Cache the response
    videoCache.set(cacheKey, {
      data: response.data,
      timestamp: Date.now()
    });
    
    // Clean old cache entries (simple cleanup)
    if (videoCache.size > 100) {
      const oldestKey = videoCache.keys().next().value;
      videoCache.delete(oldestKey);
    }
    
    // Return the data from Vimeo
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error proxying to Vimeo API:", error.message);
    
    // Return appropriate error response
    return NextResponse.json(
      { error: "Failed to fetch videos from Vimeo" },
      { status: error.response?.status || 500 }
    );
  }
}
