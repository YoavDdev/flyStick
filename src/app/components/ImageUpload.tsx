"use client";

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaUpload, FaImage, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (imageUrl: string | null) => void;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  currentImage, 
  onImageChange, 
  className = "" 
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        onImageChange(result.url);
        toast.success('התמונה הועלתה בהצלחה!');
      } else {
        toast.error(result.error || 'שגיאה בהעלאת התמונה');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('שגיאה בהעלאת התמונה');
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    } else {
      toast.error('אנא בחר קובץ תמונה תקין');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeImage = () => {
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Image Preview */}
      {currentImage && (
        <div className="relative">
          <img
            src={currentImage}
            alt="תצוגה מקדימה"
            className="w-full h-48 object-cover rounded-lg border border-[#D5C4B7]"
          />
          <button
            onClick={removeImage}
            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>
      )}

      {/* Upload Area */}
      <motion.div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300
          ${dragOver ? 'border-[#B8A99C] bg-[#F7F3EB]' : 'border-[#D5C4B7] hover:border-[#B8A99C]'}
          ${uploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {uploading ? (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B8A99C] mx-auto"></div>
            <p className="text-[#2D3142]">מעלה תמונה...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              {currentImage ? (
                <FaImage className="text-4xl text-[#B8A99C]" />
              ) : (
                <FaUpload className="text-4xl text-[#B8A99C]" />
              )}
            </div>
            <div>
              <p className="text-[#2D3142] font-medium mb-2">
                {currentImage ? 'החלף תמונה' : 'העלה תמונה'}
              </p>
              <p className="text-sm text-[#5D5D5D]">
                גרור ושחרר או לחץ לבחירת קובץ
              </p>
              <p className="text-xs text-[#5D5D5D] mt-1">
                JPG, PNG, WebP עד 5MB
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ImageUpload;
