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
  icon: string; // Custom icon (emoji or icon name)
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
    image: '',
    icon: ''
  });
  const [saving, setSaving] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);

  // Predefined SVG icon options matching CategoryIcon styles
  const iconOptions = [
    {
      id: 'contrology',
      name: 'קונטרולוגיה',
      svg: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <path d="M12,2c-0.5,0-1,0.2-1.4,0.6C10.2,3,10,3.5,10,4c0,1.1,0.9,2,2,2s2-0.9,2-2c0-0.5-0.2-1-0.6-1.4C13,2.2,12.5,2,12,2z" fill="#2D3142" opacity="0.9" />
          <path d="M12,6v12M8,10h8M8,14h8" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
        </svg>
      )
    },
    {
      id: 'equipment',
      name: 'אביזרים',
      svg: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <circle cx="12" cy="12" r="8" fill="none" stroke="#2D3142" strokeWidth="1.5" strokeDasharray="6,2" opacity="0.9" />
          <path d="M12,4V20M4,12H20" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
        </svg>
      )
    },
    {
      id: 'flystick',
      name: 'פלייסטיק',
      svg: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <path d="M12,2v20" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <path d="M7,6c0,0,5-2,10,0" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <path d="M7,12c0,0,5-2,10,0" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <path d="M7,18c0,0,5-2,10,0" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
        </svg>
      )
    },
    {
      id: 'quick',
      name: 'מהיר',
      svg: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <circle cx="12" cy="12" r="10" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <path d="M12,6v6l4,4" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
        </svg>
      )
    },
    {
      id: 'pilates',
      name: 'פילאטיס',
      svg: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <circle cx="12" cy="12" r="3" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <path d="M12,2v7M12,15v7M2,12h7M15,12h7" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
        </svg>
      )
    },
    {
      id: 'pregnancy',
      name: 'הריון',
      svg: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <circle cx="12" cy="7" r="4" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <path d="M8,14c0,4,4,8,4,8s4-4,4-8s-8-4-8,0Z" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
        </svg>
      )
    },
    {
      id: 'education',
      name: 'לימוד',
      svg: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <path d="M12,2L2,8l10,6l10-6L12,2z" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <path d="M4,11v6l8,5l8-5v-6" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
        </svg>
      )
    },
    {
      id: 'therapy',
      name: 'טיפול',
      svg: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <path d="M6,12h12v4c0,1.1-0.9,2-2,2H8c-1.1,0-2-0.9-2-2V12z" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <path d="M8,12V8c0-2.2,1.8-4,4-4s4,1.8,4,4v4" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <path d="M12,8v4M10,10h4" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
        </svg>
      )
    },
    {
      id: 'stretching',
      name: 'מתיחות',
      svg: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <path d="M8,4c0,0,4,2,8,0" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <path d="M6,8c0,0,6,4,12,0" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <path d="M4,12c0,0,8,6,16,0" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <path d="M6,16c0,0,6,4,12,0" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <path d="M8,20c0,0,4,2,8,0" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
        </svg>
      )
    },
    {
      id: 'balance',
      name: 'איזון',
      svg: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <path d="M12,2v20" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <path d="M6,8h12" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <circle cx="8" cy="8" r="2" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <circle cx="16" cy="8" r="2" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
        </svg>
      )
    },
    {
      id: 'strength',
      name: 'כוח',
      svg: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <rect x="4" y="10" width="16" height="4" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <circle cx="4" cy="12" r="2" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <circle cx="20" cy="12" r="2" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <path d="M8,8v8M16,8v8" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
        </svg>
      )
    },
    {
      id: 'breathing',
      name: 'נשימה',
      svg: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <circle cx="12" cy="12" r="8" fill="none" stroke="#2D3142" strokeWidth="1.5" strokeDasharray="4,2" opacity="0.9" />
          <circle cx="12" cy="12" r="4" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <path d="M12,8v8M8,12h8" stroke="#2D3142" strokeWidth="1.5" opacity="0.6" />
        </svg>
      )
    },
    {
      id: 'flexibility',
      name: 'גמישות',
      svg: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <path d="M4,12c0,0,8-8,16,0c0,0-8,8-16,0Z" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <path d="M8,12c0,0,4-4,8,0c0,0-4,4-8,0Z" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.6" />
        </svg>
      )
    },
    {
      id: 'core',
      name: 'מרכז',
      svg: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <ellipse cx="12" cy="12" rx="6" ry="8" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <path d="M12,6v12" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <path d="M8,10h8M8,14h8" stroke="#2D3142" strokeWidth="1.5" opacity="0.6" />
        </svg>
      )
    },
    {
      id: 'cardio',
      name: 'כושר לב',
      svg: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <path d="M20.84,4.61a5.5,5.5,0,0,0-7.78,0L12,5.67,10.94,4.61a5.5,5.5,0,0,0-7.78,7.78l1.06,1.06L12,21.23l7.78-7.78,1.06-1.06A5.5,5.5,0,0,0,20.84,4.61Z" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <path d="M12,8v6M9,11h6" stroke="#2D3142" strokeWidth="1.5" opacity="0.6" />
        </svg>
      )
    },
    {
      id: 'posture',
      name: 'יושר',
      svg: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <path d="M12,2c-1,0-2,1-2,2s1,2,2,2s2-1,2-2S13,2,12,2z" fill="#2D3142" opacity="0.9" />
          <path d="M12,6v16" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <path d="M8,10h8M10,14h4M9,18h6" stroke="#2D3142" strokeWidth="1.5" opacity="0.6" />
        </svg>
      )
    },
    {
      id: 'meditation',
      name: 'מדיטציה',
      svg: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <circle cx="12" cy="8" r="3" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <path d="M12,11c0,0-4,2-4,6s4,4,4,4s4,0,4-4S12,11,12,11z" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <path d="M8,6c0,0,2-2,4-2s4,2,4,2" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.6" />
        </svg>
      )
    },
    {
      id: 'mobility',
      name: 'ניידות',
      svg: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <circle cx="12" cy="12" r="10" fill="none" stroke="#2D3142" strokeWidth="1.5" strokeDasharray="8,4" opacity="0.9" />
          <path d="M12,4v16M4,12h16" stroke="#2D3142" strokeWidth="1.5" opacity="0.6" />
          <circle cx="12" cy="12" r="2" fill="#2D3142" opacity="0.9" />
        </svg>
      )
    },
    {
      id: 'recovery',
      name: 'החלמה',
      svg: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <path d="M12,2c0,0-8,4-8,10s8,10,8,10s8-4,8-10S12,2,12,2z" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <path d="M12,6v12M8,10h8M8,14h8" stroke="#2D3142" strokeWidth="1.5" opacity="0.6" />
        </svg>
      )
    },
    {
      id: 'default',
      name: 'ברירת מחדל',
      svg: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <circle cx="12" cy="12" r="10" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <path d="M12,8v8M8,12h8" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
        </svg>
      )
    }
  ];


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
      image: (folder.metadata as any).image || '',
      icon: (folder.metadata as any).icon || ''
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
      image: '',
      icon: ''
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
          image: formData.image,
          icon: formData.icon
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

                    {/* Icon Management */}
                    <div>
                      <label className="block text-sm font-medium text-[#2D3142] mb-2">
                        אייקון מותאם אישית
                      </label>
                      <div className="space-y-3">
                        {/* Current Icon Display */}
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 flex items-center justify-center bg-[#D5C4B7] rounded-full p-2">
                            {formData.icon ? (
                              iconOptions.find(opt => opt.id === formData.icon)?.svg || iconOptions.find(opt => opt.id === 'default')?.svg
                            ) : (
                              iconOptions.find(opt => opt.id === 'default')?.svg
                            )}
                          </div>
                          <div className="flex-1">
                            <select
                              value={formData.icon}
                              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D5C4B7] focus:border-transparent"
                            >
                              <option value="">ברירת מחדל (אוטומטי)</option>
                              {iconOptions.map(option => (
                                <option key={option.id} value={option.id}>
                                  {option.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowIconPicker(!showIconPicker)}
                            className="px-3 py-2 bg-[#D5C4B7] text-white rounded-lg hover:bg-[#B8A99C] transition-colors"
                          >
                            בחר אייקון
                          </button>
                        </div>
                        
                        {/* Icon Picker */}
                        {showIconPicker && (
                          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                            <div className="grid grid-cols-3 gap-3 mb-3">
                              {iconOptions.map((iconOption) => (
                                <button
                                  key={iconOption.id}
                                  type="button"
                                  onClick={() => {
                                    setFormData({ ...formData, icon: iconOption.id });
                                    setShowIconPicker(false);
                                  }}
                                  className={`p-3 flex flex-col items-center justify-center hover:bg-white rounded-lg transition-colors border-2 ${
                                    formData.icon === iconOption.id 
                                      ? 'border-[#D5C4B7] bg-white' 
                                      : 'border-transparent hover:border-[#D5C4B7]'
                                  }`}
                                >
                                  <div className="w-8 h-8 mb-2">
                                    {iconOption.svg}
                                  </div>
                                  <span className="text-xs text-center text-[#2D3142]">
                                    {iconOption.name}
                                  </span>
                                </button>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData({ ...formData, icon: '' });
                                  setShowIconPicker(false);
                                }}
                                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                              >
                                הסר אייקון
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowIconPicker(false)}
                                className="px-3 py-1 text-sm bg-[#D5C4B7] text-white rounded hover:bg-[#B8A99C] transition-colors"
                              >
                                סגור
                              </button>
                            </div>
                          </div>
                        )}
                        
                        <div className="text-xs text-[#7D7D7D]">
                          האייקון יוצג בכרטיס התיקייה בעמוד הסגנונות
                        </div>
                      </div>
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
