"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from 'next/link';

// Import folder metadata helpers
import { getFolderMetadata, folderMetadata } from "@/config/folder-metadata";

// Dynamic SVG icons for folder categories in Wabi-Sabi style
const CategoryIcon = ({ name, customIcon }: { name: string; customIcon?: string }) => {
  // Define the same SVG icons as in the admin component
  const getIconById = (iconId: string) => {
    switch (iconId) {
      case 'contrology':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full">
            <path d="M12,2c-0.5,0-1,0.2-1.4,0.6C10.2,3,10,3.5,10,4c0,1.1,0.9,2,2,2s2-0.9,2-2c0-0.5-0.2-1-0.6-1.4C13,2.2,12.5,2,12,2z" fill="#2D3142" opacity="0.9" />
            <path d="M12,6v12M8,10h8M8,14h8" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          </svg>
        );
      case 'equipment':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full">
            <circle cx="12" cy="12" r="8" fill="none" stroke="#2D3142" strokeWidth="1.5" strokeDasharray="6,2" opacity="0.9" />
            <path d="M12,4V20M4,12H20" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          </svg>
        );
      case 'flystick':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full">
            <path d="M12,2v20" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
            <path d="M7,6c0,0,5-2,10,0" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
            <path d="M7,12c0,0,5-2,10,0" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
            <path d="M7,18c0,0,5-2,10,0" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          </svg>
        );
      case 'quick':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full">
            <circle cx="12" cy="12" r="10" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
            <path d="M12,6v6l4,4" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          </svg>
        );
      case 'pilates':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full">
            <circle cx="12" cy="12" r="3" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
            <path d="M12,2v7M12,15v7M2,12h7M15,12h7" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          </svg>
        );
      case 'pregnancy':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full">
            <circle cx="12" cy="7" r="4" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
            <path d="M8,14c0,4,4,8,4,8s4-4,4-8s-8-4-8,0Z" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          </svg>
        );
      case 'education':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full">
            <path d="M12,2L2,8l10,6l10-6L12,2z" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
            <path d="M4,11v6l8,5l8-5v-6" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          </svg>
        );
      case 'therapy':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full">
            <path d="M6,12h12v4c0,1.1-0.9,2-2,2H8c-1.1,0-2-0.9-2-2V12z" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
            <path d="M8,12V8c0-2.2,1.8-4,4-4s4,1.8,4,4v4" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
            <path d="M12,8v4M10,10h4" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          </svg>
        );
      case 'stretching':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full">
            <path d="M8,4c0,0,4,2,8,0" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
            <path d="M6,8c0,0,6,4,12,0" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
            <path d="M4,12c0,0,8,6,16,0" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
            <path d="M6,16c0,0,6,4,12,0" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
            <path d="M8,20c0,0,4,2,8,0" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          </svg>
        );
      case 'balance':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full">
            <path d="M12,2v20" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
            <path d="M6,8h12" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
            <circle cx="8" cy="8" r="2" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
            <circle cx="16" cy="8" r="2" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          </svg>
        );
      case 'strength':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full">
            <rect x="4" y="10" width="16" height="4" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
            <circle cx="4" cy="12" r="2" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
            <circle cx="20" cy="12" r="2" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
            <path d="M8,8v8M16,8v8" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          </svg>
        );
      case 'breathing':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full">
            <circle cx="12" cy="12" r="8" fill="none" stroke="#2D3142" strokeWidth="1.5" strokeDasharray="4,2" opacity="0.9" />
            <circle cx="12" cy="12" r="4" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
            <path d="M12,8v8M8,12h8" stroke="#2D3142" strokeWidth="1.5" opacity="0.6" />
          </svg>
        );
      case 'flexibility':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full">
            <path d="M4,12c0,0,8-8,16,0c0,0-8,8-16,0Z" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
            <path d="M8,12c0,0,4-4,8,0c0,0-4,4-8,0Z" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.6" />
          </svg>
        );
      case 'core':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full">
            <ellipse cx="12" cy="12" rx="6" ry="8" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
            <path d="M12,6v12" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
            <path d="M8,10h8M8,14h8" stroke="#2D3142" strokeWidth="1.5" opacity="0.6" />
          </svg>
        );
      case 'cardio':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full">
            <path d="M20.84,4.61a5.5,5.5,0,0,0-7.78,0L12,5.67,10.94,4.61a5.5,5.5,0,0,0-7.78,7.78l1.06,1.06L12,21.23l7.78-7.78,1.06-1.06A5.5,5.5,0,0,0,20.84,4.61Z" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
            <path d="M12,8v6M9,11h6" stroke="#2D3142" strokeWidth="1.5" opacity="0.6" />
          </svg>
        );
      case 'posture':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full">
            <path d="M12,2c-1,0-2,1-2,2s1,2,2,2s2-1,2-2S13,2,12,2z" fill="#2D3142" opacity="0.9" />
            <path d="M12,6v16" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
            <path d="M8,10h8M10,14h4M9,18h6" stroke="#2D3142" strokeWidth="1.5" opacity="0.6" />
          </svg>
        );
      case 'meditation':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full">
            <circle cx="12" cy="8" r="3" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
            <path d="M12,11c0,0-4,2-4,6s4,4,4,4s4,0,4-4S12,11,12,11z" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
            <path d="M8,6c0,0,2-2,4-2s4,2,4,2" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.6" />
          </svg>
        );
      case 'mobility':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full">
            <circle cx="12" cy="12" r="10" fill="none" stroke="#2D3142" strokeWidth="1.5" strokeDasharray="8,4" opacity="0.9" />
            <path d="M12,4v16M4,12h16" stroke="#2D3142" strokeWidth="1.5" opacity="0.6" />
            <circle cx="12" cy="12" r="2" fill="#2D3142" opacity="0.9" />
          </svg>
        );
      case 'recovery':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full">
            <path d="M12,2c0,0-8,4-8,10s8,10,8,10s8-4,8-10S12,2,12,2z" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
            <path d="M12,6v12M8,10h8M8,14h8" stroke="#2D3142" strokeWidth="1.5" opacity="0.6" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full">
            <circle cx="12" cy="12" r="10" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
            <path d="M12,8v8M8,12h8" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          </svg>
        );
    }
  };

  // If a custom icon ID is provided, use it instead of generating one
  if (customIcon) {
    return getIconById(customIcon);
  }
  // Generate icon based on folder name characteristics
  const getIconForFolder = (folderName: string) => {
    const lowerName = folderName.toLowerCase();
    
    // Contrology and similar body-focused techniques
    if (lowerName.includes('contrology') || lowerName.includes('קונטרולוג')) {
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <path d="M12,2c-0.5,0-1,0.2-1.4,0.6C10.2,3,10,3.5,10,4c0,1.1,0.9,2,2,2s2-0.9,2-2c0-0.5-0.2-1-0.6-1.4C13,2.2,12.5,2,12,2z" fill="#2D3142" opacity="0.9" />
          <path d="M12,6v12M8,10h8M8,14h8" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
        </svg>
      );
    }
    
    // Equipment and props
    if (lowerName.includes('אביזר') || lowerName.includes('מכשיר') || lowerName.includes('equipment') || lowerName.includes('props')) {
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <circle cx="12" cy="12" r="8" fill="none" stroke="#2D3142" strokeWidth="1.5" strokeDasharray="6,2" opacity="0.9" />
          <path d="M12,4V20M4,12H20" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
        </svg>
      );
    }
    
    // Flystick and stick-related
    if (lowerName.includes('flystick') || lowerName.includes('פלייסטיק') || lowerName.includes('stick')) {
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <path d="M12,2v20" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <path d="M7,6c0,0,5-2,10,0" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <path d="M7,12c0,0,5-2,10,0" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <path d="M7,18c0,0,5-2,10,0" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
        </svg>
      );
    }
    
    // Quick sessions and time-based
    if (lowerName.includes('quick') || lowerName.includes('קוויק') || lowerName.includes('זמן') || lowerName.includes('מהיר')) {
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <circle cx="12" cy="12" r="10" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <path d="M12,6v6l4,4" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
        </svg>
      );
    }
    
    // Pilates and machine work
    if (lowerName.includes('pilates') || lowerName.includes('פילאטיס')) {
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <circle cx="12" cy="12" r="3" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <path d="M12,2v7M12,15v7M2,12h7M15,12h7" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
        </svg>
      );
    }
    
    // Pregnancy and birth
    if (lowerName.includes('הריון') || lowerName.includes('לידה') || lowerName.includes('pregnancy') || lowerName.includes('birth')) {
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <circle cx="12" cy="7" r="4" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <path d="M8,14c0,4,4,8,4,8s4-4,4-8s-8-4-8,0Z" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
        </svg>
      );
    }
    
    // Education and learning
    if (lowerName.includes('לימוד') || lowerName.includes('חינוך') || lowerName.includes('קורס') || lowerName.includes('education') || lowerName.includes('course')) {
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <path d="M12,2L2,8l10,6l10-6L12,2z" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <path d="M4,11v6l8,5l8-5v-6" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
        </svg>
      );
    }
    
    // Therapeutic and healing
    if (lowerName.includes('טיפול') || lowerName.includes('מרפא') || lowerName.includes('therapy') || lowerName.includes('healing')) {
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <path d="M6,12h12v4c0,1.1-0.9,2-2,2H8c-1.1,0-2-0.9-2-2V12z" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <path d="M8,12V8c0-2.2,1.8-4,4-4s4,1.8,4,4v4" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <path d="M12,8v4M10,10h4" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
        </svg>
      );
    }
    
    // Default icon for any other folder
    return (
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <circle cx="12" cy="12" r="10" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
        <path d="M12,8v8M8,12h8" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
      </svg>
    );
  };
  
  return getIconForFolder(name);
};

const StylesPage = () => {
  const { data: session } = useSession();
  const [folders, setFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch folders from API
  const fetchFolders = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/folder-metadata');
      const data = await response.json();
      
      if (data.success && data.folders) {
        const visibleFolders = data.folders
          .filter((folder: any) => folder.metadata.isVisible)
          .sort((a: any, b: any) => a.metadata.order - b.metadata.order);
        
        const foldersWithDescriptions = visibleFolders.map((folder: any) => ({
          ...folder,
          description: folder.metadata.description || "",
        }));
        
        setFolders(foldersWithDescriptions);
      }
    } catch (error) {
      console.error('Error fetching folders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);
  
  const getShortenedDescription = (description: string) => {
    if (!description) return '';
    const words = description.split(' ');
    if (words.length <= 15) return description;
    return words.slice(0, 15).join(' ') + '...';
  };

  // Filter folders based on selected category (folder name filtering like old code)
  const filteredFolders = selectedCategory
    ? folders.filter((folder) => folder.name === selectedCategory)
    : folders;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F3EB] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#D5C4B7] border-t-[#B8A99C] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F3EB] relative">
      {/* Decorative elements */}
      <div className="absolute top-40 right-10 w-32 h-32 opacity-10 hidden lg:block">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#B8A99C" strokeWidth="1" strokeDasharray="5,3" />
        </svg>
      </div>
      
      <div className="absolute bottom-20 left-10 w-24 h-24 opacity-10 hidden lg:block">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <rect x="20" y="20" width="60" height="60" rx="5" fill="none" stroke="#B8A99C" strokeWidth="1" />
        </svg>
      </div>
      
      <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-medium tracking-wide text-[#3D3D3D] mb-4">
              <span className="border-b-2 border-[#B56B4A] pb-1">בחרו את הטכניקה שלכם</span>
            </h1>
            <p className="text-lg text-[#5D5D5D] max-w-2xl mx-auto">
              אנו מציעים מגוון רחב של טכניקות תנועה לכל הרמות, מתחילים ועד מתקדמים
            </p>
            
            {/* Category filter buttons */}
            <div className="flex flex-wrap justify-center gap-2 mt-8 rtl">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-5 py-2 rounded-full text-sm transition-all duration-300 ${
                  selectedCategory === null 
                  ? 'bg-[#D5C4B7] text-[#3D3D3D] shadow-md' 
                  : 'bg-[#F7F3EB] text-[#5D5D5D] border border-[#D5C4B7] hover:bg-[#E6DEDA]'}`}
                  >
                הכל
                </button>
                {folders.map((folder) => (
                <button
                key={folder.uri}
                onClick={() => setSelectedCategory(folder.name)}
                className={`px-5 py-2 rounded-full text-sm transition-all duration-300 whitespace-nowrap ${selectedCategory === folder.name 
                  ? 'bg-[#D5C4B7] text-[#3D3D3D] shadow-md' 
                  : 'bg-[#F7F3EB] text-[#5D5D5D] border border-[#D5C4B7] hover:bg-[#E6DEDA]'}`}

                  >
                  {folder.name}
                </button>
              ))}
            </div>
          </div>
          
           {/* Loading state */}
           {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="w-16 h-16 border-4 border-[#D5C4B7] border-t-[#B8A99C] rounded-full animate-spin"></div>
            </div>
          )}

          {/* Folders grid */}
          {!loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredFolders.map((folder) => (
                <div 
                  key={folder.uri} 
                  className="transition-transform duration-300 hover:-translate-y-1"
                >
                  <Link href={`/styles/${encodeURIComponent(folder.name)}`}>
                    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-[#E6DEDA] flex flex-col h-full">
                      {/* Card header with icon and background image */}
                      <div className="relative bg-[#F7F3EB] p-6 flex items-center border-b border-[#E6DEDA] overflow-hidden">
                        {/* Background image */}
                        {folder.metadata.image && (
                          <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: `url(${folder.metadata.image})`}}></div>
                        )}
                        
                        {/* Content overlay */}
                        <div className="relative z-10 flex items-center w-full">
                          <div className="w-12 h-12 flex items-center justify-center bg-[#D5C4B7] rounded-full p-2.5 overflow-hidden">
                            <CategoryIcon name={folder.name} customIcon={folder.metadata.icon} />
                          </div>
                          <h3 className="text-xl font-semibold text-white mr-4" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.5)'}}>
                            {folder.name}
                          </h3>
                        </div>
                      </div>
                      
                      {/* Card body */}
                      <div className="p-6 flex flex-col flex-grow">
                        <p className="text-[#5D5D5D] mb-6 text-right flex-grow">
                          {getShortenedDescription(folder.description)}
                        </p>
                        
                        <div className="flex justify-center">
                          <div className="bg-gradient-to-r from-[#D5C4B7] to-[#B8A99C] text-white px-6 py-2 rounded-full font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 flex items-center group cursor-pointer">
                            <span className="ml-2">בואו נתחיל</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform rotate-180 group-hover:translate-x-1 transition-transform duration-300" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* No results message */}
          {!loading && filteredFolders.length === 0 && (
            <div className="text-center py-20">
              <p className="text-lg text-[#5D5D5D]">לא נמצאו תוצאות. אנא נסו קטגוריה אחרת.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StylesPage;

