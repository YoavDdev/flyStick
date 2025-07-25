"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaEdit, FaTrash, FaSave, FaTimes, FaPlus, FaFolder, FaClock, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import * as folderMetadataDb from '@/libs/folder-metadata-db';

interface VimeoFolder {
  uri: string;
  name: string;
  created_time: string;
  modified_time: string;
  metadata: {
    description: string;
    level: string;
    levelHebrew: string;
    category: string;
    order: number;
    isNew?: boolean;
  };
  hasCustomMetadata: boolean;
}

interface FolderMetadataForm {
  description: string;
  levels: ('beginner' | 'intermediate' | 'advanced' | 'all')[];
  levelHebrew: string;
  category: string;
  subCategory: string;
  order: number;
  isVisible: boolean;
  image: string; // URL to custom folder image
}

const AdminFolderMetadataManager: React.FC = () => {
  const [folders, setFolders] = useState<VimeoFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<FolderMetadataForm>({
    description: '',
    levels: ['all'],
    levelHebrew: 'כל הרמות',
    category: 'technique',
    subCategory: '',
    order: 1,
    isVisible: true,
    image: ''
  });
  const [saving, setSaving] = useState(false);


  const levels = folderMetadataDb.getAllLevels();

  useEffect(() => {
    fetchFolders();
  }, []);



  const fetchFolders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/folder-metadata');
      if (response.data.success) {
        setFolders(response.data.folders);
      } else {
        toast.error('שגיאה בטעינת התיקיות');
      }
    } catch (error) {
      console.error('Error fetching folders:', error);
      toast.error('שגיאה בטעינת התיקיות');
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (folder: VimeoFolder) => {
    setEditingFolder(folder.name);
    // Convert single level to array for backward compatibility
    const currentLevels = Array.isArray((folder.metadata as any).levels) 
      ? (folder.metadata as any).levels 
      : [folder.metadata.level];
    
    setFormData({
      description: folder.metadata.description,
      levels: currentLevels,
      levelHebrew: folder.metadata.levelHebrew,
      category: folder.metadata.category,
      subCategory: (folder.metadata as any).subCategory || '',
      order: folder.metadata.order,
      isVisible: (folder.metadata as any).isVisible || true,
      image: (folder.metadata as any).image || ''
    });
  };

  const cancelEditing = () => {
    setEditingFolder(null);
    setFormData({
      description: '',
      levels: ['all'],
      levelHebrew: 'כל הרמות',
      category: 'technique',
      subCategory: '',
      order: 1,
      isVisible: true,
      image: ''
    });
  };

  const handleLevelToggle = (level: string) => {
    const currentLevels = [...formData.levels];
    const levelIndex = currentLevels.indexOf(level as any);
    
    if (levelIndex > -1) {
      // Remove level if already selected
      currentLevels.splice(levelIndex, 1);
    } else {
      // Add level if not selected
      currentLevels.push(level as any);
    }
    
    // Ensure at least one level is always selected
    if (currentLevels.length === 0) {
      currentLevels.push('all');
    }
    
    // Generate Hebrew display text
    const hebrewLevels = currentLevels.map(lvl => {
      const levelObj = levels.find(l => l.key === lvl);
      return levelObj?.hebrew || lvl;
    });
    
    setFormData({
      ...formData,
      levels: currentLevels,
      levelHebrew: hebrewLevels.join(', ')
    });
  };

  const saveMetadata = async (folderName: string) => {
    try {
      setSaving(true);
      const response = await axios.post('/api/admin/folder-metadata', {
        folderName,
        metadata: {
          description: formData.description,
          levels: formData.levels,
          levelHebrew: formData.levelHebrew,
          category: formData.category,
          subCategory: formData.subCategory,
          order: formData.order,
          isVisible: formData.isVisible,
          image: formData.image
        }
      });

      if (response.data.success) {
        toast.success('מטא-דאטה נשמרה בהצלחה');
        await fetchFolders(); // Refresh the list
        cancelEditing();
      } else {
        toast.error('שגיאה בשמירת המטא-דאטה');
      }
    } catch (error) {
      console.error('Error saving metadata:', error);
      toast.error('שגיאה בשמירת המטא-דאטה');
    } finally {
      setSaving(false);
    }
  };



  const getLevelColor = (level: string): string => {
    return folderMetadataDb.getLevelColor(level);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 bg-[#F7F3EB] border-b border-[#D5C4B7]/30">
          <div className="flex items-center gap-3">
            <FaFolder className="text-[#D5C4B7] text-xl" />
            <h2 className="text-xl font-bold text-[#2D3142]">
              ניהול מטא-דאטה של תיקיות
            </h2>
          </div>
        </div>
        <div className="p-6">
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-4 border-[#D5C4B7] border-t-[#B8A99C] rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Accordion Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 text-right bg-[#F7F3EB] hover:bg-[#E6DEDA] transition-colors duration-200 flex items-center justify-between border-b border-[#D5C4B7]/30"
      >
        <div className="flex items-center gap-3">
          <FaFolder className="text-[#D5C4B7] text-xl" />
          <h2 className="text-xl font-bold text-[#2D3142]">
            ניהול מטא-דאטה של תיקיות
          </h2>
          <span className="text-sm text-[#5D5D5D] bg-[#D5C4B7]/20 px-2 py-1 rounded-full">
            {folders.length} תיקיות
          </span>
        </div>
        
        <div className="text-[#2D3142]">
          {isOpen ? <FaChevronUp /> : <FaChevronDown />}
        </div>
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="p-6">
          <div className="mb-4 text-sm text-[#5D5D5D] text-center">
            כאן תוכל לנהל את המטא-דאטה של כל התיקיות מ-Vimeo. תיקיות עם רקע כתום הן חדשות ומשתמשות בהגדרות ברירת המחדל.
          </div>

      <div className="space-y-4">
        {folders.map((folder) => (
          <div 
            key={folder.name} 
            className={`border rounded-lg p-4 ${
              !folder.hasCustomMetadata 
                ? 'bg-orange-50 border-orange-200' 
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            {editingFolder === folder.name ? (
              // Edit Mode
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <FaFolder className="text-[#D5C4B7]" />
                  <h3 className="text-lg font-semibold text-[#2D3142]">{folder.name}</h3>
                  {!folder.hasCustomMetadata && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 border border-orange-200 rounded-full text-xs font-medium">
                      חדש
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#2D3142] mb-2">
                      תיאור
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D5C4B7] focus:border-transparent"
                      rows={3}
                      placeholder="הכנס תיאור לתיקייה..."
                    />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#2D3142] mb-2">
                        רמת קושי (ניתן לבחור מספר רמות)
                      </label>
                      <div className="space-y-2 p-3 border border-gray-300 rounded-lg bg-gray-50">
                        {levels.map((level) => (
                          <label key={level.key} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.levels.includes(level.key as any)}
                              onChange={() => handleLevelToggle(level.key)}
                              className="w-4 h-4 text-[#D5C4B7] bg-gray-100 border-gray-300 rounded focus:ring-[#D5C4B7] focus:ring-2"
                            />
                            <span className="text-sm text-[#2D3142]">{level.hebrew}</span>
                          </label>
                        ))}
                      </div>
                      <div className="mt-2 text-xs text-[#7D7D7D]">
                        נבחר: {formData.levelHebrew}
                      </div>
                    </div>



                    <div>
                      <label className="block text-sm font-medium text-[#2D3142] mb-2">
                        סדר תצוגה
                      </label>
                      <input
                        type="number"
                        value={formData.order}
                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D5C4B7] focus:border-transparent"
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#2D3142] mb-2">
                        תמונה מותאמת אישית (URL)
                      </label>
                      <input
                        type="url"
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D5C4B7] focus:border-transparent"
                        placeholder="https://example.com/image.jpg"
                      />
                      <div className="mt-1 text-xs text-[#7D7D7D]">
                        השאירו ריק כדי להשתמש באייקון ברירת המחדל
                      </div>
                      {formData.image && (
                        <div className="mt-2">
                          <img 
                            src={formData.image} 
                            alt="תצוגה מקדימה"
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-[#2D3142]">
                        <input
                          type="checkbox"
                          checked={formData.isVisible}
                          onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                          className="w-4 h-4 text-[#D5C4B7] bg-gray-100 border-gray-300 rounded focus:ring-[#D5C4B7] focus:ring-2"
                        />
                        הצג תיקייה בעמוד הסגנונות
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => saveMetadata(folder.name)}
                    disabled={saving}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <FaSave />
                    {saving ? 'שומר...' : 'שמור'}
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <FaTimes />
                    ביטול
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FaFolder className="text-[#D5C4B7]" />
                    <h3 className="text-lg font-semibold text-[#2D3142]">{folder.name}</h3>
                    {!folder.hasCustomMetadata && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 border border-orange-200 rounded-full text-xs font-medium">
                        חדש
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getLevelColor(folder.metadata.level)}`}>
                      {folder.metadata.levelHebrew}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => startEditing(folder)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="עריכה"
                      >
                        <FaEdit />
                      </button>
                    </div>
                  </div>
                </div>

                <p className="text-[#5D5D5D] mb-2 text-sm">
                  {folder.metadata.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-[#7D7D7D]">
                  <span>קטגוריה: טכניקה</span>
                  <span>סדר: {folder.metadata.order}</span>
                  <div className="flex items-center gap-1">
                    <FaClock />
                    <span>עודכן: {new Date(folder.modified_time).toLocaleDateString('he-IL')}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

          {folders.length === 0 && (
            <div className="text-center py-12">
              <FaFolder className="mx-auto text-4xl text-[#D5C4B7] mb-4" />
              <p className="text-[#5D5D5D]">לא נמצאו תיקיות ב-Vimeo</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminFolderMetadataManager;
