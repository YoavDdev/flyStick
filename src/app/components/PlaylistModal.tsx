"use client";

import React, { useState } from 'react';
// Removed framer-motion import
import { FaPlus, FaTimes, FaFolderPlus } from 'react-icons/fa';

interface PlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderNames: string[];
  selectedVideoUri: string;
  onAddToFavorites: (videoUri: string, folderName: string) => void;
  onCreatePlaylist: (playlistName: string) => void;
}

const PlaylistModal = ({
  isOpen,
  onClose,
  folderNames,
  selectedVideoUri,
  onAddToFavorites,
  onCreatePlaylist
}: PlaylistModalProps) => {
  const [showForm, setShowForm] = useState(false);
  const [playlistName, setPlaylistName] = useState("");

  const openForm = () => {
    setShowForm(true);
  };

  const handlePlaylistNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPlaylistName(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (playlistName.trim()) {
      onCreatePlaylist(playlistName);
      setPlaylistName("");
      setShowForm(false);
    }
  };

  // Removed animation variants

  if (!isOpen) return null;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-40">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />
          <div 
            className="relative bg-[#F7F3EB] p-6 rounded-2xl shadow-xl max-w-md w-full border border-[#D5C4B7] overflow-hidden"
            style={{
              backgroundImage: "url('/paper-texture.png')",
              backgroundBlendMode: "overlay",
              backgroundSize: "cover"
            }}
          >
            {/* Decorative element - asymmetrical corner */}
            <div className="absolute -top-6 -right-6 w-12 h-12 bg-[#D5C4B7] opacity-40 rounded-full" />
            <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-[#B8A99C] opacity-30 rounded-full" />
            
            <div className="flex justify-between items-center mb-6 border-b border-[#D5C4B7] pb-3">
              <h2 className="text-2xl font-semibold text-[#2D3142] mr-2">הוספה לרשימה</h2>
              <button
                onClick={onClose}
                className="text-[#2D3142] hover:text-[#EF8354] focus:outline-none rounded-full p-1"
              >
                <FaTimes size={20} />
              </button>
            </div>
            
            <div className="relative z-10">
              {folderNames.length > 0 ? (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-[#2D3142] mb-3 text-right">הרשימות שלך:</h3>
                  <ul className="space-y-3">
                    {folderNames.map((folderName, index) => (
                      <li key={index}>
                        <button
                          className="w-full text-right py-3 px-4 rounded-xl bg-[#D5C4B7] bg-opacity-40 hover:bg-opacity-60 focus:outline-none text-[#2D3142] font-medium transition-all duration-300 flex items-center justify-end gap-2"
                          onClick={() => {
                            onAddToFavorites(selectedVideoUri, folderName);
                            onClose();
                          }}
                        >
                          <span>הוסף ל{folderName}</span>
                          <FaPlus size={14} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-center text-[#2D3142] mb-4">אין לך רשימות עדיין</p>
              )}
              
              <div className="mt-6">
                {!showForm ? (
                    <button
                      className="w-full text-white py-3 px-4 rounded-xl bg-[#EF8354] hover:bg-[#D9713C] focus:outline-none flex items-center justify-center gap-2 shadow-md"
                      onClick={openForm}
                    >
                      <FaFolderPlus size={18} />
                      <span>צור רשימה חדשה</span>
                    </button>
                  ) : (
                    <form 
                      onSubmit={handleSubmit} 
                      className="mt-4 bg-white bg-opacity-50 p-4 rounded-xl border border-[#D5C4B7]"
                    >
                      <label className="block mb-3 text-right">
                        <span className="text-lg font-medium text-[#2D3142] block mb-2">שם הרשימה:</span>
                        <input
                          type="text"
                          value={playlistName}
                          onChange={handlePlaylistNameChange}
                          className="w-full rounded-xl bg-white border border-[#D5C4B7] text-[#2D3142] py-2 px-4 focus:outline-none focus:ring-2 focus:ring-[#EF8354] text-right"
                          placeholder="הכנס שם לרשימה החדשה"
                          autoFocus
                        />
                      </label>
                      <div className="flex justify-end mt-3">
                        <button
                          className="text-white py-2 px-6 rounded-xl bg-[#EF8354] hover:bg-[#D9713C] focus:outline-none shadow-md"
                          type="submit"
                        >
                          צור רשימה
                        </button>
                      </div>
                    </form>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PlaylistModal;
