import { NextRequest, NextResponse } from "next/server";
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { getFolderMetadata as getStaticFolderMetadata } from '@/config/folder-metadata';

const prisma = new PrismaClient();

// GET - Fetch all Vimeo folders with their current metadata
export async function GET(request: NextRequest) {
  try {
    // Fetch folders from Vimeo
    const accessToken = process.env.VIMEO_TOKEN;
    const apiUrl = "https://api.vimeo.com/me/projects";
    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };

    const response = await axios.get(apiUrl, { headers });
    const vimeoFolders = response.data.data;

    // Get all folder metadata from database
    const dbFolderMetadata = await prisma.folderMetadata.findMany();
    const folderMetadataMap = dbFolderMetadata.reduce((acc, item) => {
      acc[item.folderName] = {
        description: item.description,
        level: item.level,
        levels: item.levels,
        levelHebrew: item.levelHebrew,
        category: item.category,
        subCategory: item.subCategory,
        order: item.order,
        isNew: item.isNew,
        isVisible: item.isVisible,
        image: item.image
      };
      return acc;
    }, {} as Record<string, any>);
    
    // Add current metadata to each folder and fetch video counts
    const foldersWithMetadata = await Promise.all(vimeoFolders.map(async (folder: any) => {
      const metadata = folderMetadataMap[folder.name] || getStaticFolderMetadata(folder.name);
      
      // Fetch video count for this folder
      let videoCount = 0;
      try {
        const videosResponse = await axios.get(`https://api.vimeo.com${folder.uri}/videos`, { 
          headers,
          params: { per_page: 1 } // Only need count, not actual videos
        });
        videoCount = videosResponse.data.total || 0;
      } catch (error) {
        console.error(`Error fetching video count for folder ${folder.name}:`, error);
      }
      
      return {
        uri: folder.uri,
        name: folder.name,
        created_time: folder.created_time,
        modified_time: folder.modified_time,
        metadata,
        hasCustomMetadata: !!folderMetadataMap[folder.name],
        videoCount
      };
    }));

    return NextResponse.json({ 
      success: true, 
      folders: foldersWithMetadata 
    });

  } catch (error) {
    console.error("Error fetching folders:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch folders" 
    }, { status: 500 });
  }
}

// POST - Update folder metadata
export async function POST(request: NextRequest) {
  try {
    const { folderName, metadata } = await request.json();

    // Debug logging
    console.log('📝 Saving folder metadata:', {
      folderName,
      image: metadata.image,
      hasImage: !!metadata.image,
      imageLength: metadata.image?.length || 0
    });

    if (!folderName || !metadata) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing folderName or metadata" 
      }, { status: 400 });
    }

    // Validate metadata structure
    const requiredFields = ['description', 'levelHebrew', 'category', 'order'];
    for (const field of requiredFields) {
      if (!(field in metadata)) {
        return NextResponse.json({ 
          success: false, 
          error: `Missing required field: ${field}` 
        }, { status: 400 });
      }
    }
    
    // Check for either levels array (new format) or level string (legacy format)
    if (!metadata.levels && !metadata.level) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing required field: levels or level" 
      }, { status: 400 });
    }

    // Convert levels array to string array if it exists
    const levels = metadata.levels 
      ? metadata.levels 
      : metadata.level 
        ? [metadata.level] 
        : ['all'];

    // Update or create folder metadata in database
    const result = await prisma.folderMetadata.upsert({
      where: { folderName },
      update: {
        description: metadata.description,
        level: metadata.level || null,
        levels,
        levelHebrew: metadata.levelHebrew,
        category: metadata.category,
        subCategory: metadata.subCategory || null,
        order: metadata.order,
        isNew: metadata.isNew || false,
        isVisible: metadata.isVisible,
        image: metadata.image || null,
        updatedAt: new Date(),
      },
      create: {
        folderName,
        description: metadata.description,
        level: metadata.level || null,
        levels,
        levelHebrew: metadata.levelHebrew,
        category: metadata.category,
        subCategory: metadata.subCategory || null,
        order: metadata.order,
        isNew: metadata.isNew || false,
        isVisible: metadata.isVisible,
        image: metadata.image || null,
      },
    });

    // Debug logging after save
    console.log('✅ Database save result:', {
      folderName: result.folderName,
      savedImage: result.image,
      hasImageSaved: !!result.image
    });

    return NextResponse.json({ 
      success: true, 
      message: "Folder metadata updated successfully" 
    });

  } catch (error) {
    console.error("Error updating folder metadata:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to update folder metadata" 
    }, { status: 500 });
  }
}

// DELETE - Remove folder metadata (reset to default)
export async function DELETE(request: NextRequest) {
  try {
    const { folderName } = await request.json();

    if (!folderName) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing folderName" 
      }, { status: 400 });
    }

    // Delete folder metadata from database
    await prisma.folderMetadata.delete({
      where: { folderName }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Folder metadata removed successfully" 
    });

  } catch (error) {
    console.error("Error removing folder metadata:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to remove folder metadata" 
    }, { status: 500 });
  }
}
