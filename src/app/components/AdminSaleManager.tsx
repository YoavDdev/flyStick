"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface SaleConfig {
  isActive: boolean;
  saleName: string;
  badgeText: string;
  originalPrice: number;
  salePrice: number;
}

const AdminSaleManager = () => {
  const [config, setConfig] = useState<SaleConfig>({
    isActive: false,
    saleName: "מבצע",
    badgeText: "מבצע פסח!",
    originalPrice: 350,
    salePrice: 99,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch("/api/admin/sale-config");
      if (response.ok) {
        const data = await response.json();
        setConfig({
          isActive: data.isActive || false,
          saleName: data.saleName || "מבצע",
          badgeText: data.badgeText || "",
          originalPrice: data.originalPrice || 350,
          salePrice: data.salePrice || 99,
        });
      }
    } catch (error) {
      console.error("Error fetching sale config:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/sale-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        toast.success("הגדרות המבצע עודכנו בהצלחה");
      } else {
        toast.error("שגיאה בעדכון הגדרות המבצע");
      }
    } catch (error) {
      console.error("Error saving sale config:", error);
      toast.error("שגיאה בעדכון הגדרות המבצע");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-[#D5C4B7]/30 p-6">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#D5C4B7]"></div>
          <p className="mt-2 text-[#2D3142]">טוען הגדרות מבצע...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-[#D5C4B7]/30 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-[#2D3142]">ניהול מבצעים - סדרות</h3>
        <div className="flex items-center gap-2">
          <span className={`inline-block w-3 h-3 rounded-full ${config.isActive ? 'bg-green-500' : 'bg-red-400'}`}></span>
          <span className="text-sm text-[#2D3142]">{config.isActive ? 'מבצע פעיל' : 'מבצע כבוי'}</span>
        </div>
      </div>

      {/* Toggle */}
      <div className="mb-6 p-4 rounded-lg border-2 border-dashed transition-colors duration-200"
        style={{ borderColor: config.isActive ? '#22c55e' : '#D5C4B7', backgroundColor: config.isActive ? 'rgba(34,197,94,0.05)' : 'transparent' }}
      >
        <label className="flex items-center cursor-pointer gap-3">
          <div className="relative">
            <input
              type="checkbox"
              checked={config.isActive}
              onChange={(e) => setConfig({ ...config, isActive: e.target.checked })}
              className="sr-only"
            />
            <div className={`w-14 h-7 rounded-full transition-colors duration-200 ${config.isActive ? 'bg-green-500' : 'bg-gray-300'}`}>
              <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200 ${config.isActive ? 'translate-x-7' : 'translate-x-0.5'}`}></div>
            </div>
          </div>
          <div>
            <span className="text-lg font-bold text-[#2D3142]">
              {config.isActive ? '🔥 המבצע פעיל!' : 'הפעל מבצע'}
            </span>
            <p className="text-xs text-[#5D5D5D]">כשהמבצע פעיל, המחיר המקורי יופיע בקו חוצה והמחיר החדש יוצג</p>
          </div>
        </label>
      </div>

      {/* Preview */}
      {config.isActive && (
        <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200">
          <p className="text-sm text-[#5D5D5D] mb-2">תצוגה מקדימה:</p>
          <div className="flex items-center gap-3">
            {config.badgeText && (
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                {config.badgeText}
              </span>
            )}
            <div className="flex items-center gap-2">
              <span className="text-gray-400 line-through text-lg">₪{config.originalPrice}</span>
              <span className="text-red-600 font-bold text-2xl">₪{config.salePrice}</span>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#2D3142] mb-1">
            שם המבצע
          </label>
          <input
            type="text"
            value={config.saleName}
            onChange={(e) => setConfig({ ...config, saleName: e.target.value })}
            className="w-full p-2 border border-[#D5C4B7]/30 rounded-lg bg-white/50"
            placeholder="מבצע"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2D3142] mb-1">
            טקסט תג המבצע
          </label>
          <input
            type="text"
            value={config.badgeText}
            onChange={(e) => setConfig({ ...config, badgeText: e.target.value })}
            className="w-full p-2 border border-[#D5C4B7]/30 rounded-lg bg-white/50"
            placeholder='למשל: "מבצע פסח!" או "הנחה מיוחדת"'
          />
          <p className="text-xs text-[#5D5D5D] mt-1">יוצג כתג אדום על כרטיסי הסדרות</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2D3142] mb-1">
            מחיר מקורי (₪) - יוצג בקו חוצה
          </label>
          <input
            type="number"
            step="1"
            value={config.originalPrice}
            onChange={(e) => setConfig({ ...config, originalPrice: parseFloat(e.target.value) || 0 })}
            className="w-full p-2 border border-[#D5C4B7]/30 rounded-lg bg-white/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2D3142] mb-1">
            מחיר מבצע (₪) - המחיר שישולם
          </label>
          <input
            type="number"
            step="1"
            value={config.salePrice}
            onChange={(e) => setConfig({ ...config, salePrice: parseFloat(e.target.value) || 0 })}
            className="w-full p-2 border border-[#D5C4B7]/30 rounded-lg bg-white/50"
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end mt-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-[#B8A99C] text-white rounded-lg hover:bg-[#D5C4B7] transition-colors disabled:opacity-50 font-medium"
        >
          {saving ? "שומר..." : "שמור הגדרות"}
        </button>
      </div>
    </div>
  );
};

export default AdminSaleManager;
