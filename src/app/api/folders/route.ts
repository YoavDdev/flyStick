export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// This API route fetches folders (projects) from Vimeo API
export async function GET(request: NextRequest) {
  try {
    const accessToken = process.env.VIMEO_TOKEN;
    const apiUrl = "https://api.vimeo.com/me/projects";
    
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
    const response = await axios.get(apiUrl, { headers });
    
    // Return the data from Vimeo
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error fetching folders from Vimeo API:", error.message);
    
    // Return appropriate error response
    return NextResponse.json(
      { error: "Failed to fetch folders from Vimeo" },
      { status: error.response?.status || 500 }
    );
  }
}
