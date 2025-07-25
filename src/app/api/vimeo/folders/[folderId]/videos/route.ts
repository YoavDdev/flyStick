import { NextRequest, NextResponse } from "next/server";
import axios from 'axios';

export async function GET(
  request: NextRequest,
  { params }: { params: { folderId: string } }
) {
  try {
    const folderId = decodeURIComponent(params.folderId);
    
    // Get Vimeo token from server environment
    const accessToken = process.env.VIMEO_TOKEN;
    
    if (!accessToken) {
      return NextResponse.json({ 
        success: false, 
        error: "Server configuration error" 
      }, { status: 500 });
    }
    
    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };

    // Extract folder ID from URI if needed
    let cleanFolderId = folderId;
    if (folderId.includes('/projects/')) {
      const parts = folderId.split('/projects/');
      cleanFolderId = parts[1];
    }

    // Fetch videos from the specific folder
    const apiUrl = `https://api.vimeo.com/me/projects/${cleanFolderId}/videos`;
    
    const response = await axios.get(apiUrl, {
      headers,
      params: {
        fields: "uri,name,description,duration,created_time,link,embed.html,pictures.sizes",
        per_page: 100 // Get up to 100 videos
      },
      timeout: 10000
    });

    const videos = response.data.data || [];
    
    // Format the video data
    const formattedVideos = videos.map((video: any) => ({
      uri: video.uri,
      name: video.name || "Untitled Video",
      description: video.description || "",
      duration: video.duration || 0,
      created_time: video.created_time,
      link: video.link,
      embed: {
        html: video.embed?.html || ""
      },
      pictures: {
        sizes: video.pictures?.sizes || []
      }
    }));

    return NextResponse.json({ 
      success: true, 
      videos: formattedVideos 
    });

  } catch (error: any) {
    console.error('Error fetching folder videos:', error.message);
    
    // Handle specific Vimeo API errors
    if (error.response?.status === 404) {
      return NextResponse.json({ 
        success: false, 
        error: "Folder not found" 
      }, { status: 404 });
    }
    
    if (error.response?.status === 403) {
      return NextResponse.json({ 
        success: false, 
        error: "Access denied to folder" 
      }, { status: 403 });
    }

    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch videos" 
    }, { status: 500 });
  }
}
