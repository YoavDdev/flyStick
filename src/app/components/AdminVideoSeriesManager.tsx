"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import ImageUpload from "./ImageUpload";

interface VideoSeries {
  id: string;
  title: string;
  description: string;
  price: number;
  vimeoFolderId: string;
  vimeoFolderName: string;
  paypalProductId: string;
  thumbnailUrl?: string;
  videoCount: number;
  isActive: boolean;
  isFeatured: boolean;
  order: number;
  createdAt: string;
  _count: {
    purchases: number;
  };
}

interface SeriesFormData {
  title: string;
  description: string;
  price: string;
  vimeoFolderId: string;
  vimeoFolderName: string;
  paypalProductId: string;
  thumbnailUrl: string;
  videoCount: string;
  isActive: boolean;
  isFeatured: boolean;
  order: string;
}

const AdminVideoSeriesManager = () => {
  const [series, setSeries] = useState<VideoSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<SeriesFormData>({
    title: "",
    description: "",
    price: "",
    vimeoFolderId: "",
    vimeoFolderName: "",
    paypalProductId: "",
    thumbnailUrl: "",
    videoCount: "",
    isActive: true,
    isFeatured: false,
    order: "0"
  });

  useEffect(() => {
    fetchSeries();
  }, []);

  const fetchSeries = async () => {
    try {
      const response = await fetch("/api/admin/video-series");
      if (response.ok) {
        const data = await response.json();
        setSeries(data);
      } else {
        toast.error("שגיאה בטעינת הסדרות");
      }
    } catch (error) {
      console.error("Error fetching series:", error);
      toast.error("שגיאה בטעינת הסדרות");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      price: "",
      vimeoFolderId: "",
      vimeoFolderName: "",
      paypalProductId: "",
      thumbnailUrl: "",
      videoCount: "",
      isActive: true,
      isFeatured: false,
      order: "0"
    });
  };

  const handleEdit = (seriesItem: VideoSeries) => {
    setFormData({
      title: seriesItem.title,
      description: seriesItem.description,
      price: seriesItem.price.toString(),
      vimeoFolderId: seriesItem.vimeoFolderId,
      vimeoFolderName: seriesItem.vimeoFolderName,
      paypalProductId: seriesItem.paypalProductId,
      thumbnailUrl: seriesItem.thumbnailUrl || "",
      videoCount: seriesItem.videoCount.toString(),
      isActive: seriesItem.isActive,
      isFeatured: seriesItem.isFeatured,
      order: seriesItem.order.toString()
    });
    setEditingId(seriesItem.id);
    setShowCreateForm(false);
  };

  const handleCreate = () => {
    resetForm();
    setEditingId(null);
    setShowCreateForm(true);
  };

  const handleCancel = () => {
    resetForm();
    setEditingId(null);
    setShowCreateForm(false);
  };

  const handleSave = async () => {
    try {
      const url = editingId ? "/api/admin/video-series" : "/api/admin/video-series";
      const method = editingId ? "PUT" : "POST";
      const body = editingId ? { id: editingId, ...formData } : formData;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        toast.success(editingId ? "הסדרה עודכנה בהצלחה" : "הסדרה נוצרה בהצלחה");
        fetchSeries();
        handleCancel();
      } else {
        const error = await response.json();
        toast.error(error.error || "שגיאה בשמירת הסדרה");
      }
    } catch (error) {
      console.error("Error saving series:", error);
      toast.error("שגיאה בשמירת הסדרה");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("האם אתה בטוח שברצונך למחוק את הסדרה?")) return;

    try {
      const response = await fetch(`/api/admin/video-series?id=${id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        toast.success("הסדרה נמחקה בהצלחה");
        fetchSeries();
      } else {
        toast.error("שגיאה במחיקת הסדרה");
      }
    } catch (error) {
      console.error("Error deleting series:", error);
      toast.error("שגיאה במחיקת הסדרה");
    }
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-[#D5C4B7]/30 p-6">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#D5C4B7]"></div>
          <p className="mt-2 text-[#2D3142]">טוען סדרות וידאו...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-[#D5C4B7]/30 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-[#2D3142]">ניהול סדרות וידאו</h3>
        <button
          onClick={handleCreate}
          className="bg-[#B8A99C] text-white px-4 py-2 rounded-lg hover:bg-[#D5C4B7] transition-colors"
        >
          + צור סדרה חדשה
        </button>
      </div>

      {/* Create/Edit Form */}
      {(showCreateForm || editingId) && (
        <div className="bg-white/20 rounded-lg p-4 mb-6 border border-[#D5C4B7]/40">
          <h4 className="text-lg font-medium text-[#2D3142] mb-4">
            {editingId ? "עריכת סדרה" : "יצירת סדרה חדשה"}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#2D3142] mb-1">
                כותרת הסדרה *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full p-2 border border-[#D5C4B7]/30 rounded-lg bg-white/50"
                placeholder="עבודה גב 6 שיעורים"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2D3142] mb-1">
                מחיר (₪) *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="w-full p-2 border border-[#D5C4B7]/30 rounded-lg bg-white/50"
                placeholder="69"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2D3142] mb-1">
                Vimeo Folder ID *
              </label>
              <input
                type="text"
                value={formData.vimeoFolderId}
                onChange={(e) => setFormData({...formData, vimeoFolderId: e.target.value})}
                className="w-full p-2 border border-[#D5C4B7]/30 rounded-lg bg-white/50"
                placeholder="1234567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2D3142] mb-1">
                PayPal Product ID *
              </label>
              <input
                type="text"
                value={formData.paypalProductId}
                onChange={(e) => setFormData({...formData, paypalProductId: e.target.value})}
                className="w-full p-2 border border-[#D5C4B7]/30 rounded-lg bg-white/50"
                placeholder="2S9ZM9VEBS3J4"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2D3142] mb-1">
                מספר סרטונים
              </label>
              <input
                type="number"
                value={formData.videoCount}
                onChange={(e) => setFormData({...formData, videoCount: e.target.value})}
                className="w-full p-2 border border-[#D5C4B7]/30 rounded-lg bg-white/50"
                placeholder="6"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2D3142] mb-1">
                סדר תצוגה
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({...formData, order: e.target.value})}
                className="w-full p-2 border border-[#D5C4B7]/30 rounded-lg bg-white/50"
                placeholder="0"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#2D3142] mb-1">
                תיאור הסדרה *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full p-2 border border-[#D5C4B7]/30 rounded-lg bg-white/50"
                rows={3}
                placeholder="תיאור מפורט של הסדרה..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2D3142] mb-1">
                תמונת הסדרה
              </label>
              <ImageUpload
                currentImage={formData.thumbnailUrl}
                onImageChange={(imageUrl) => setFormData({...formData, thumbnailUrl: imageUrl || ""})}
              />
            </div>

            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="mr-2"
                />
                <span className="text-sm text-[#2D3142]">פעיל</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                  className="mr-2"
                />
                <span className="text-sm text-[#2D3142]">מומלץ</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-2 rtl:space-x-reverse mt-4">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-[#2D3142] border border-[#D5C4B7] rounded-lg hover:bg-[#D5C4B7]/20 transition-colors"
            >
              ביטול
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[#B8A99C] text-white rounded-lg hover:bg-[#D5C4B7] transition-colors"
            >
              שמור
            </button>
          </div>
        </div>
      )}

      {/* Series List */}
      <div className="space-y-4">
        {series.length === 0 ? (
          <div className="text-center py-8 text-[#2D3142]">
            אין סדרות וידאו עדיין
          </div>
        ) : (
          series.map((seriesItem) => (
            <div
              key={seriesItem.id}
              className="bg-white/20 rounded-lg p-4 border border-[#D5C4B7]/40"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                    <h4 className="text-lg font-medium text-[#2D3142]">
                      {seriesItem.title}
                    </h4>
                    {seriesItem.isFeatured && (
                      <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                        מומלץ
                      </span>
                    )}
                    {!seriesItem.isActive && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                        לא פעיל
                      </span>
                    )}
                  </div>
                  
                  <p className="text-[#2D3142] text-sm mb-2">
                    {seriesItem.description}
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-[#5D5D5D]">
                    <div>מחיר: ₪{seriesItem.price}</div>
                    <div>סרטונים: {seriesItem.videoCount}</div>
                    <div>רכישות: {seriesItem._count.purchases}</div>
                    <div>PayPal ID: {seriesItem.paypalProductId}</div>
                  </div>
                </div>
                
                <div className="flex space-x-2 rtl:space-x-reverse">
                  <button
                    onClick={() => handleEdit(seriesItem)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    ערוך
                  </button>
                  <button
                    onClick={() => handleDelete(seriesItem.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    מחק
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminVideoSeriesManager;
