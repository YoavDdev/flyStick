"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Link from 'next/link';

const StylesPage = () => {
  const { data: session } = useSession();
  const [folders, setFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');

  // Fetch folders from API
  const fetchFolders = async () => {
    setLoading(true);
    try {
      // Fetch folders with metadata from the admin API endpoint
      const response = await fetch('/api/admin/folder-metadata');
      const data = await response.json();
      
      if (data.success && data.folders) {
        // Filter for visible folders (all categories since we simplified)
        const visibleFolders = data.folders
          .filter((folder: any) => folder.metadata.isVisible)
          .sort((a: any, b: any) => a.metadata.order - b.metadata.order);
        
        setFolders(visibleFolders);
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

  // Filter folders by selected level and folder
  const filteredFolders = folders.filter(folder => {
    // First filter by level
    const levelMatch = selectedLevel === 'all' || folder.metadata.levels.includes(selectedLevel);
    
    // Then filter by folder if specific folder is selected
    const folderMatch = selectedFolder === 'all' || folder.name === selectedFolder;
    
    return levelMatch && folderMatch;
  });

  const getShortenedDescription = (description: string) => {
    if (!description) return '';
    const words = description.split(' ');
    return words.length > 15 ? words.slice(0, 15).join(' ') + '...' : description;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F1EB] to-[#E8DDD4] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#D5C4B7] border-t-[#B8A99C] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F1EB] to-[#E8DDD4] pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#2D3142] mb-4">
            בחרו את הטכניקה שלכם
          </h1>
          <p className="text-lg text-[#5D5D5D] max-w-2xl mx-auto">
            אנו מציעים מגוון רחב של טכניקות תנועה לכל הרמות, מתחילים ועד מתקדמים
          </p>
        </div>

        {/* Level Filter */}
        <div className="flex justify-center mb-6 hidden">
          <div className="bg-white rounded-full p-2 shadow-lg overflow-x-auto scrollbar-hide">
            <div className="flex gap-1 min-w-max">
              {[
                { key: 'all', label: 'כל הרמות' },
                { key: 'beginner', label: 'מתחילים' },
                { key: 'intermediate', label: 'בינוני' },
                { key: 'advanced', label: 'מתקדמים' }
              ].map((level) => (
                <button
                  key={level.key}
                  onClick={() => setSelectedLevel(level.key)}
                  className={`px-6 py-2 rounded-full mx-1 transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                    selectedLevel === level.key
                      ? 'bg-[#D5C4B7] text-white shadow-md'
                      : 'text-[#5D5D5D] hover:bg-[#F0E6D6]'
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Folder Quick Navigation */}
        <div className="w-full mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-full p-3 shadow-lg mx-4 overflow-x-auto scrollbar-hide">
            <div className="flex gap-3 px-2 min-w-max">
              {/* Show all folders button */}
              <button 
                onClick={() => setSelectedFolder('all')}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                  selectedFolder === 'all'
                    ? 'bg-[#D5C4B7] text-white shadow-md'
                    : 'text-[#5D5D5D] hover:bg-[#D5C4B7] hover:text-white'
                }`}
              >
                כל התיקיות
              </button>
              
              {/* Individual folder buttons */}
              {folders
                .filter(folder => selectedLevel === 'all' || folder.metadata.levels.includes(selectedLevel))
                .map((folder) => (
                <button 
                  key={folder.uri}
                  onClick={() => setSelectedFolder(folder.name)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                    selectedFolder === folder.name
                      ? 'bg-[#D5C4B7] text-white shadow-md'
                      : 'text-[#5D5D5D] hover:bg-[#D5C4B7] hover:text-white'
                  }`}
                >
                  {folder.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Folders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredFolders.map((folder, index) => (
            <motion.div
              key={folder.uri}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={`/styles/${encodeURIComponent(folder.name)}`}>
                <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer h-[400px] relative">
                  {/* Image */}
                  <div className="relative h-48 bg-gradient-to-br from-[#D5C4B7] to-[#B8A99C]">
                    {folder.metadata.image ? (
                      <img
                        src={folder.metadata.image}
                        alt={folder.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-white text-6xl opacity-50">
                          🎭
                        </div>
                      </div>
                    )}
                    
                    {/* Level Badge */}
                    <div className="absolute top-4 right-4">
                      <span className="bg-white/90 text-[#2D3142] px-3 py-1 rounded-full text-sm font-medium">
                        {folder.metadata.levelHebrew || 'כל הרמות'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-[#2D3142] mb-3 text-right">
                      {folder.name}
                    </h3>
                    
                    <div>
                      {folder.metadata.description && (
                        <p className="text-[#5D5D5D] text-right mb-4 leading-relaxed line-clamp-4">
                          {getShortenedDescription(folder.metadata.description)}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Footer - Fixed position at bottom left */}
                  <div className="absolute bottom-6 left-6 text-sm text-[#7D7D7D]">
                    <span>{folder.videoCount || 0} סרטונים</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredFolders.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎭</div>
            <h3 className="text-2xl font-bold text-[#2D3142] mb-2">
              לא נמצאו תיקיות
            </h3>
            <p className="text-[#5D5D5D]">
              {selectedLevel === 'all' 
                ? 'אין תיקיות זמינות כרגע'
                : `אין תיקיות זמינות עבור רמת ${selectedLevel === 'beginner' ? 'מתחילים' : selectedLevel === 'intermediate' ? 'בינוני' : 'מתקדמים'}`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StylesPage;
