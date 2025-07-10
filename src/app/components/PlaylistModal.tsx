"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { delay: 0.1, type: "spring" as const, stiffness: 100 } }
  };

  const listItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: 0.05 * i }
    })
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 flex items-center justify-center z-40"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={backdropVariants}
        >
          <motion.div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />
          <motion.div 
            className="relative bg-[#F7F3EB] p-6 rounded-2xl shadow-xl max-w-md w-full border border-[#D5C4B7] overflow-hidden"
            variants={modalVariants}
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
              <motion.button
                onClick={onClose}
                className="text-[#2D3142] hover:text-[#EF8354] focus:outline-none rounded-full p-1"
                whileHover={{ rotate: 90, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaTimes size={20} />
              </motion.button>
            </div>
            
            <div className="relative z-10">
              {folderNames.length > 0 ? (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-[#2D3142] mb-3 text-right">הרשימות שלך:</h3>
                  <ul className="space-y-3">
                    {folderNames.map((folderName, index) => (
                      <motion.li 
                        key={index}
                        custom={index}
                        variants={listItemVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        <motion.button
                          className="w-full text-right py-3 px-4 rounded-xl bg-[#D5C4B7] bg-opacity-40 hover:bg-opacity-60 focus:outline-none text-[#2D3142] font-medium transition-all duration-300 flex items-center justify-end gap-2"
                          onClick={() => {
                            onAddToFavorites(selectedVideoUri, folderName);
                            onClose();
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span>הוסף ל{folderName}</span>
                          <FaPlus size={14} />
                        </motion.button>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-center text-[#2D3142] mb-4">אין לך רשימות עדיין</p>
              )}
              
              <div className="mt-6">
                <AnimatePresence>
                  {!showForm ? (
                    <motion.button
                      className="w-full text-white py-3 px-4 rounded-xl bg-[#EF8354] hover:bg-[#D9713C] focus:outline-none flex items-center justify-center gap-2 shadow-md"
                      onClick={openForm}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <FaFolderPlus size={18} />
                      <span>צור רשימה חדשה</span>
                    </motion.button>
                  ) : (
                    <motion.form 
                      onSubmit={handleSubmit} 
                      className="mt-4 bg-white bg-opacity-50 p-4 rounded-xl border border-[#D5C4B7]"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
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
                        <motion.button
                          className="text-white py-2 px-6 rounded-xl bg-[#EF8354] hover:bg-[#D9713C] focus:outline-none shadow-md"
                          type="submit"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          צור רשימה
                        </motion.button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PlaylistModal;
