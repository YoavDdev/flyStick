"use client";

import React, { useState, useRef, useEffect } from 'react';
import { FaSearch, FaHashtag } from 'react-icons/fa';
// Removed framer-motion import

interface SearchBarProps {
  onSearch: (query: string) => void;
  hashtags: string[];
  onHashtagClick: (hashtag: string) => void;
}

const SearchBar = ({ onSearch, hashtags, onHashtagClick }: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showHashtagDropdown, setShowHashtagDropdown] = useState(false);
  const [showHashtagSuggestions, setShowHashtagSuggestions] = useState(false);
  const [filteredHashtags, setFilteredHashtags] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
    setShowHashtagSuggestions(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Check if we have a hashtag in the input
    const hashtagIndex = value.lastIndexOf('#');
    
    if (hashtagIndex !== -1) {
      // We have a hashtag, extract the text after the last hashtag
      const hashtagQuery = value.slice(hashtagIndex + 1).trim().toLowerCase();
      
      // Filter hashtags based on the query
      const filtered = hashtags.filter(tag => 
        tag.toLowerCase().includes(hashtagQuery)
      );
      
      setFilteredHashtags(filtered);
      setShowHashtagSuggestions(true);
    } else {
      // No hashtag, check if the input matches the beginning of any hashtags
      const query = value.trim().toLowerCase();
      
      if (query) {
        const filtered = hashtags.filter(tag => 
          tag.toLowerCase().startsWith(query)
        );
        
        if (filtered.length > 0) {
          setFilteredHashtags(filtered);
          setShowHashtagSuggestions(true);
        } else {
          setShowHashtagSuggestions(false);
        }
      } else {
        // Empty query, hide suggestions
        setShowHashtagSuggestions(false);
      }
    }
  };

  const closeHashtagDropdown = () => {
    setShowHashtagDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeHashtagDropdown();
        setShowHashtagSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="mb-8 relative" ref={dropdownRef}>
      <form onSubmit={handleSearch} className="flex relative">
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          placeholder="חפש סרטונים... (הקלד # לחיפוש תגיות)"
          className="flex-grow px-4 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-[#4F5D75] text-right"
          ref={inputRef}
          dir="rtl"
        />
        <button
          type="submit"
          className="bg-[#2D3142] hover:bg-[#4F5D75] text-white px-4 py-2 rounded-l-md focus:outline-none"
        >
          <FaSearch />
        </button>
      </form>
      
      {/* Hashtag Autocomplete Dropdown */}
      {showHashtagSuggestions && filteredHashtags.length > 0 && (
          <div 
            className="absolute z-50 mt-1 right-0 w-full bg-[#F7F3EB] border border-[#D5C4B7] rounded-lg shadow-md overflow-hidden"
            dir="rtl"
          >
            <div className="max-h-60 overflow-y-auto py-2">
              {filteredHashtags.map((hashtag, index) => (
                <button
                  key={hashtag}
                  className="w-full text-right px-4 py-2 hover:bg-[#D5C4B7]/20 text-[#2D3142] flex items-center justify-start transition-colors duration-200"
                  onClick={() => {
                    // Replace the entire query with # first, then the hashtag text
                    const newQuery = '# ' + hashtag;
                    
                    setSearchQuery(newQuery);
                    setShowHashtagSuggestions(false);
                    inputRef.current?.focus();
                  }}
                  dir="rtl"
                >
                  <div className="flex items-center gap-2 w-full">
                    <span className="text-[#B8A99C] font-medium">#</span>
                    <span>{hashtag}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      {/* Hashtag dropdown has been replaced with autocomplete */}
    </div>
  );
};

export default SearchBar;
