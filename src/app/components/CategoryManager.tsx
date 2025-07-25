"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FaPlus, FaTrash, FaEdit, FaSave, FaTimes, FaChevronDown, FaChevronUp, FaTags } from 'react-icons/fa';
import axios from 'axios';

interface Category {
  id: string;
  key: string;
  hebrew: string;
  emoji?: string;
  order: number;
  isActive: boolean;
  subcategories: SubCategory[];
}

interface SubCategory {
  id: string;
  key: string;
  hebrew: string;
  order: number;
  isActive: boolean;
  categoryId: string;
}

const CategoryManager: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Category management states
  const [newCategoryKey, setNewCategoryKey] = useState('');
  const [newCategoryHebrew, setNewCategoryHebrew] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryKey, setEditCategoryKey] = useState('');
  const [editCategoryHebrew, setEditCategoryHebrew] = useState('');

  // Sub-category management states
  const [selectedCategoryForSubCat, setSelectedCategoryForSubCat] = useState('');
  const [newSubCategoryKey, setNewSubCategoryKey] = useState('');
  const [newSubCategoryHebrew, setNewSubCategoryHebrew] = useState('');
  const [editingSubCategory, setEditingSubCategory] = useState<{categoryId: string, subCatId: string} | null>(null);
  const [editSubCategoryKey, setEditSubCategoryKey] = useState('');
  const [editSubCategoryHebrew, setEditSubCategoryHebrew] = useState('');

  // Fetch categories from database
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/categories');
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('שגיאה בטעינת הקטגוריות');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Category CRUD operations
  const addCategory = async () => {
    if (!newCategoryKey.trim() || !newCategoryHebrew.trim()) {
      toast.error('יש למלא גם מפתח וגם שם בעברית');
      return;
    }

    try {
      await axios.post('/api/admin/categories', {
        key: newCategoryKey.trim(),
        hebrew: newCategoryHebrew.trim(),
        order: categories.length
      });
      
      setNewCategoryKey('');
      setNewCategoryHebrew('');
      toast.success('קטגוריה נוספה בהצלחה');
      await fetchCategories();
    } catch (error: any) {
      console.error('Error adding category:', error);
      const errorMessage = error.response?.data?.error || 'שגיאה בהוספת הקטגוריה';
      toast.error(errorMessage);
    }
  };

  const startEditingCategory = (category: Category) => {
    setEditingCategory(category.id);
    setEditCategoryKey(category.key);
    setEditCategoryHebrew(category.hebrew);
  };

  const saveEditCategory = async () => {
    if (!editCategoryKey.trim() || !editCategoryHebrew.trim()) {
      toast.error('יש למלא גם מפתח וגם שם בעברית');
      return;
    }

    try {
      await axios.put('/api/admin/categories', {
        id: editingCategory,
        key: editCategoryKey.trim(),
        hebrew: editCategoryHebrew.trim()
      });
      
      setEditingCategory(null);
      setEditCategoryKey('');
      setEditCategoryHebrew('');
      toast.success('קטגוריה עודכנה בהצלחה');
      await fetchCategories();
    } catch (error: any) {
      console.error('Error updating category:', error);
      const errorMessage = error.response?.data?.error || 'שגיאה בעדכון הקטגוריה';
      toast.error(errorMessage);
    }
  };

  const cancelEditCategory = () => {
    setEditingCategory(null);
    setEditCategoryKey('');
    setEditCategoryHebrew('');
  };

  const deleteCategory = async (categoryId: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק קטגוריה זו?')) {
      return;
    }

    try {
      await axios.delete(`/api/admin/categories?id=${categoryId}`);
      toast.success('קטגוריה נמחקה בהצלחה');
      await fetchCategories();
    } catch (error: any) {
      console.error('Error deleting category:', error);
      const errorMessage = error.response?.data?.error || 'שגיאה במחיקת הקטגוריה';
      toast.error(errorMessage);
    }
  };

  // Sub-category CRUD operations
  const addSubCategory = async () => {
    if (!selectedCategoryForSubCat || !newSubCategoryKey.trim() || !newSubCategoryHebrew.trim()) {
      toast.error('יש למלא קטגוריה, מפתח ושם בעברית');
      return;
    }

    try {
      const category = categories.find(c => c.id === selectedCategoryForSubCat);
      const order = category?.subcategories.length || 0;
      
      await axios.post('/api/admin/subcategories', {
        categoryId: selectedCategoryForSubCat,
        key: newSubCategoryKey.trim(),
        hebrew: newSubCategoryHebrew.trim(),
        order
      });
      
      setNewSubCategoryKey('');
      setNewSubCategoryHebrew('');
      toast.success('תת-קטגוריה נוספה בהצלחה');
      await fetchCategories();
    } catch (error: any) {
      console.error('Error adding subcategory:', error);
      const errorMessage = error.response?.data?.error || 'שגיאה בהוספת תת-קטגוריה';
      toast.error(errorMessage);
    }
  };

  const startEditingSubCategory = (categoryId: string, subCat: SubCategory) => {
    setEditingSubCategory({ categoryId, subCatId: subCat.id });
    setEditSubCategoryKey(subCat.key);
    setEditSubCategoryHebrew(subCat.hebrew);
  };

  const saveEditSubCategory = async () => {
    if (!editSubCategoryKey.trim() || !editSubCategoryHebrew.trim()) {
      toast.error('יש למלא גם מפתח וגם שם בעברית');
      return;
    }

    try {
      await axios.put('/api/admin/subcategories', {
        id: editingSubCategory?.subCatId,
        key: editSubCategoryKey.trim(),
        hebrew: editSubCategoryHebrew.trim()
      });
      
      setEditingSubCategory(null);
      setEditSubCategoryKey('');
      setEditSubCategoryHebrew('');
      toast.success('תת-קטגוריה עודכנה בהצלחה');
      await fetchCategories();
    } catch (error: any) {
      console.error('Error updating subcategory:', error);
      const errorMessage = error.response?.data?.error || 'שגיאה בעדכון תת-קטגוריה';
      toast.error(errorMessage);
    }
  };

  const cancelEditSubCategory = () => {
    setEditingSubCategory(null);
    setEditSubCategoryKey('');
    setEditSubCategoryHebrew('');
  };

  const deleteSubCategory = async (subCategoryId: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק תת-קטגוריה זו?')) {
      return;
    }

    try {
      await axios.delete(`/api/admin/subcategories?id=${subCategoryId}`);
      toast.success('תת-קטגוריה נמחקה בהצלחה');
      await fetchCategories();
    } catch (error: any) {
      console.error('Error deleting subcategory:', error);
      const errorMessage = error.response?.data?.error || 'שגיאה במחיקת תת-קטגוריה';
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <FaTags className="text-[#2D3142]" size={20} />
          <h3 className="text-lg font-semibold text-[#2D3142]">ניהול קטגוריות ותת-קטגוריות</h3>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D3142] mx-auto"></div>
          <p className="mt-2 text-[#7D7D7D]">טוען קטגוריות...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <FaTags className="text-[#2D3142]" size={20} />
          <h3 className="text-lg font-semibold text-[#2D3142]">ניהול קטגוריות ותת-קטגוריות</h3>
        </div>
        {isOpen ? <FaChevronUp /> : <FaChevronDown />}
      </div>

      {isOpen && (
        <div className="mt-6 space-y-6">
          {/* Add New Category */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-[#2D3142] mb-3">הוסף קטגוריה חדשה</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                value={newCategoryKey}
                onChange={(e) => setNewCategoryKey(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg"
                placeholder="מפתח (באנגלית)"
              />
              <input
                type="text"
                value={newCategoryHebrew}
                onChange={(e) => setNewCategoryHebrew(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg"
                placeholder="שם בעברית"
              />
              <button
                onClick={addCategory}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                <FaPlus size={12} />
                הוסף קטגוריה
              </button>
            </div>
          </div>

          {/* Add New Subcategory */}
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-medium text-[#2D3142] mb-3">הוסף תת-קטגוריה חדשה</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <select
                value={selectedCategoryForSubCat}
                onChange={(e) => setSelectedCategoryForSubCat(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg"
              >
                <option value="">בחר קטגוריה</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.hebrew}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={newSubCategoryKey}
                onChange={(e) => setNewSubCategoryKey(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg"
                placeholder="מפתח (באנגלית)"
              />
              <input
                type="text"
                value={newSubCategoryHebrew}
                onChange={(e) => setNewSubCategoryHebrew(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg"
                placeholder="שם בעברית"
              />
              <button
                onClick={addSubCategory}
                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              >
                <FaPlus size={12} />
                הוסף תת-קטגוריה
              </button>
            </div>
          </div>

          {/* Categories List */}
          <div className="space-y-4">
            <h4 className="font-medium text-[#2D3142]">קטגוריות קיימות ({categories.length})</h4>
            
            {categories.map((category) => (
              <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                {editingCategory === category.id ? (
                  // Edit Mode
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center mb-4">
                    <input
                      type="text"
                      value={editCategoryKey}
                      onChange={(e) => setEditCategoryKey(e.target.value)}
                      className="p-2 border border-gray-300 rounded-lg"
                      placeholder="מפתח"
                    />
                    <input
                      type="text"
                      value={editCategoryHebrew}
                      onChange={(e) => setEditCategoryHebrew(e.target.value)}
                      className="p-2 border border-gray-300 rounded-lg"
                      placeholder="שם בעברית"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={saveEditCategory}
                        className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm"
                      >
                        <FaSave size={12} />
                        שמור
                      </button>
                      <button
                        onClick={cancelEditCategory}
                        className="flex items-center gap-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm"
                      >
                        <FaTimes size={12} />
                        ביטול
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <h5 className="font-semibold text-[#2D3142] text-lg">{category.hebrew}</h5>
                      <span className="text-sm text-[#7D7D7D]">({category.key})</span>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {category.subcategories.length} תת-קטגוריות
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditingCategory(category)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="ערוך קטגוריה"
                      >
                        <FaEdit size={14} />
                      </button>
                      <button
                        onClick={() => deleteCategory(category.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="מחק קטגוריה"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Subcategories */}
                <div className="space-y-2">
                  <h6 className="font-medium text-[#2D3142] text-sm">תת-קטגוריות:</h6>
                  {category.subcategories.map((subCat) => (
                    <div key={subCat.id} className="bg-gray-50 rounded-lg p-3">
                      {editingSubCategory?.categoryId === category.id && editingSubCategory?.subCatId === subCat.id ? (
                        // Edit Mode
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                          <input
                            type="text"
                            value={editSubCategoryKey}
                            onChange={(e) => setEditSubCategoryKey(e.target.value)}
                            className="p-2 border border-gray-300 rounded-lg"
                            placeholder="מפתח"
                          />
                          <input
                            type="text"
                            value={editSubCategoryHebrew}
                            onChange={(e) => setEditSubCategoryHebrew(e.target.value)}
                            className="p-2 border border-gray-300 rounded-lg"
                            placeholder="שם בעברית"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={saveEditSubCategory}
                              className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm"
                            >
                              <FaSave size={12} />
                              שמור
                            </button>
                            <button
                              onClick={cancelEditSubCategory}
                              className="flex items-center gap-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm"
                            >
                              <FaTimes size={12} />
                              ביטול
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-[#2D3142]">{subCat.hebrew}</span>
                            <span className="text-sm text-[#7D7D7D]">({subCat.key})</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEditingSubCategory(category.id, subCat)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="ערוך תת-קטגוריה"
                            >
                              <FaEdit size={12} />
                            </button>
                            <button
                              onClick={() => deleteSubCategory(subCat.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="מחק תת-קטגוריה"
                            >
                              <FaTrash size={12} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {category.subcategories.length === 0 && (
                    <div className="text-center py-4 text-[#7D7D7D]">
                      אין תת-קטגוריות בקטגוריה זו
                    </div>
                  )}
                </div>
              </div>
            ))}

            {categories.length === 0 && (
              <div className="text-center py-8 text-[#7D7D7D]">
                אין קטגוריות במערכת
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;
