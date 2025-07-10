import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// This API route proxies requests to the Vimeo API to keep the token secure
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const query = searchParams.get("query") || "";
    
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
    
    // Make the request to Vimeo API
    const response = await axios.get(apiUrl, {
      headers,
      params: {
        page,
        query,
        fields: "uri,embed.html,name,description,pictures,duration",
      },
    });
    
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
