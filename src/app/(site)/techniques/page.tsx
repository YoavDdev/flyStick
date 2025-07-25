"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Link from 'next/link';
import * as folderMetadataDb from "@/libs/folder-metadata-db";

const TechniquesPage = () => {
  const { data: session } = useSession();
  const [folders, setFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch folders from API
  const fetchFolders = async () => {
    setLoading(true);
    try {
      // Fetch folders with metadata from the admin API endpoint
      const response = await fetch('/api/admin/folder-metadata');
      const data = await response.json();
      
      if (data.success && data.folders) {
        // Filter for technique folders that are visible
        const techniqueFolders = data.folders
          .filter((folder: any) => {
            // Show visible folders that are categorized as 'technique' from all levels
            const isTechnique = folder.metadata.category === 'technique';
            const isVisible = folder.metadata.isVisible;
            const shouldShow = isVisible && isTechnique;
            
            if (isTechnique) {
              console.log(`✅ TECHNIQUE FOUND: "${folder.name}" - Visible: ${isVisible}, ShouldShow: ${shouldShow}`);
            }
            
            return shouldShow;
          })
          .sort((a: any, b: any) => a.metadata.order - b.metadata.order);
        
        setFolders(techniqueFolders);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F1EB] via-[#E6DEDA] to-[#D4C4B0] pt-20 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#D5C4B7]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#A0856B]/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-[#F7F3EB]/20 to-transparent rounded-full"></div>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-start justify-center px-4 pt-16">
        <div className="w-full max-w-6xl mx-auto">
          
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-[#2D3142] mb-4">
              טכניקות
            </h1>
            <p className="text-lg text-[#5D5D5D] max-w-2xl mx-auto leading-relaxed">
              כל הטכניקות שלנו במקום אחד - לכל הרמות: מתחילים, בינוני ומתקדמים
            </p>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-16 h-16 border-4 border-[#D5C4B7] border-t-[#A0856B] rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[#5D5D5D] text-lg">טוען טכניקות...</p>
            </motion.div>
          )}

          {/* Techniques Grid */}
          {!loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {folders.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-[#5D5D5D] text-lg">אין טכניקות זמינות כרגע</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {folders.map((folder: any, index: number) => (
                    <motion.div
                      key={folder.uri}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="group h-full"
                    >
                      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border border-[#E6DEDA]/50 overflow-hidden flex flex-col h-full">
                        {/* Card Header with Background */}
                        <div className={`h-48 relative overflow-hidden flex-shrink-0 ${
                          folder.image 
                            ? 'bg-cover bg-center bg-no-repeat' 
                            : 'bg-gradient-to-br from-[#F7F3EB] to-[#F0EBE3]'
                        }`}
                        style={folder.image ? { backgroundImage: `url(${folder.image})` } : {}}
                        >
                          {folder.image && (
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>
                          )}
                          
                          {/* "חדש" badge positioned absolutely in top-right */}
                          {folder.isNew && (
                            <div className="absolute top-6 right-6 z-20">
                              <span className="px-3 py-1 bg-gradient-to-r from-orange-100 to-orange-50 text-orange-800 border border-orange-200 rounded-full text-xs font-medium shadow-sm">
                                ✨ חדש
                              </span>
                            </div>
                          )}
                          
                          {/* Centered title */}
                          <div className="flex items-center justify-center h-full relative z-10">
                            <h3 className={`text-2xl font-bold text-center transition-colors duration-300 line-clamp-2 px-4 ${
                              folder.image 
                                ? 'text-white group-hover:text-gray-100 drop-shadow-lg' 
                                : 'text-[#2D3142] group-hover:text-[#A0856B]'
                            }`}>
                              {folder.name}
                            </h3>
                          </div>
                        </div>
                        
                        {/* Card Body - Fixed height content area */}
                        <div className="p-6 flex-grow flex flex-col justify-between">
                          <div className="flex-grow">
                            <p className="text-[#5D5D5D] text-sm leading-relaxed mb-4 line-clamp-3 min-h-[4.5rem]">
                              {folder.description}
                            </p>
                          </div>
                          
                          {/* Level Badge - Always at bottom */}
                          <div className="flex items-center justify-between mt-auto">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                              folder.level === 'beginner' ? 'bg-green-50 text-green-700 border-green-200' :
                              folder.level === 'intermediate' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                              folder.level === 'advanced' ? 'bg-red-50 text-red-700 border-red-200' :
                              'bg-blue-50 text-blue-700 border-blue-200'
                            }`}>
                              {folder.levelHebrew}
                            </span>
                            
                            <span className="text-xs text-[#8D8D8D]">
                              {folder.video_count || 0} סרטונים
                            </span>
                          </div>
                        </div>
                        
                        {/* Card Footer - Link - Fixed at bottom */}
                        <div className="p-6 pt-0 flex-shrink-0">
                          <Link href={`/styles/${folder.uri.split("/").pop()}`}>
                            <div className="block w-full bg-gradient-to-r from-[#A0856B] to-[#C49B7A] hover:from-[#8D7358] hover:to-[#B8896A] text-white text-center py-3 px-6 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg cursor-pointer">
                              צפה בטכניקות
                            </div>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TechniquesPage;
