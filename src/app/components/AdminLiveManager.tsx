"use client";

import React, { useState, useEffect } from "react";

interface LiveStreamData {
  id: string;
  title: string;
  description?: string;
  youtubeUrl?: string;
  youtubeVideoId?: string;
  scheduledAt: string;
  status: string;
  vimeoVideoUri?: string;
  thumbnailUrl?: string;
  duration?: number;
  isRecurring: boolean;
  recurringDay?: string;
  recurringTime?: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  scheduled: { label: "מתוזמן", color: "bg-blue-100 text-blue-700" },
  live: { label: "🔴 שידור חי", color: "bg-red-100 text-red-700" },
  ended: { label: "הסתיים", color: "bg-gray-100 text-gray-700" },
  cancelled: { label: "בוטל", color: "bg-yellow-100 text-yellow-700" },
};

const DAY_OPTIONS = [
  { value: "sunday", label: "ראשון" },
  { value: "monday", label: "שני" },
  { value: "tuesday", label: "שלישי" },
  { value: "wednesday", label: "רביעי" },
  { value: "thursday", label: "חמישי" },
  { value: "friday", label: "שישי" },
  { value: "saturday", label: "שבת" },
];

const AdminLiveManager = () => {
  const [streams, setStreams] = useState<LiveStreamData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Form state
  const [form, setForm] = useState({
    title: "",
    description: "",
    youtubeUrl: "",
    scheduledAt: "",
    thumbnailUrl: "",
    duration: "",
    isRecurring: true,
    recurringDay: "sunday",
    recurringTime: "10:00",
  });

  const fetchStreams = async () => {
    try {
      const res = await fetch("/api/admin/live");
      const data = await res.json();
      if (data.success) {
        setStreams(data.streams);
      }
    } catch (error) {
      console.error("Error fetching streams:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStreams();
  }, []);

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      youtubeUrl: "",
      scheduledAt: "",
      thumbnailUrl: "",
      duration: "",
      isRecurring: true,
      recurringDay: "sunday",
      recurringTime: "10:00",
    });
    setIsCreating(false);
    setEditingId(null);
  };

  const showMessage = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleCreate = async () => {
    if (!form.title || !form.scheduledAt) {
      showMessage("נא למלא כותרת ותאריך", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        showMessage("שידור חי נוצר בהצלחה!", "success");
        resetForm();
        fetchStreams();
      } else {
        showMessage(data.error || "שגיאה ביצירת שידור", "error");
      }
    } catch (error) {
      showMessage("שגיאה ביצירת שידור", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: string, updates: Partial<LiveStreamData>) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/live", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      });
      const data = await res.json();
      if (data.success) {
        showMessage("עודכן בהצלחה!", "success");
        fetchStreams();
        setEditingId(null);
      } else {
        showMessage(data.error || "שגיאה בעדכון", "error");
      }
    } catch (error) {
      showMessage("שגיאה בעדכון", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    await handleUpdate(id, { status: newStatus } as any);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("האם אתה בטוח שברצונך למחוק שידור זה?")) return;
    
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/live?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showMessage("שידור נמחק", "success");
        fetchStreams();
      }
    } catch (error) {
      showMessage("שגיאה במחיקה", "error");
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (stream: LiveStreamData) => {
    setEditingId(stream.id);
    setForm({
      title: stream.title,
      description: stream.description || "",
      youtubeUrl: stream.youtubeUrl || "",
      scheduledAt: stream.scheduledAt ? new Date(stream.scheduledAt).toISOString().slice(0, 16) : "",
      thumbnailUrl: stream.thumbnailUrl || "",
      duration: stream.duration?.toString() || "",
      isRecurring: stream.isRecurring,
      recurringDay: stream.recurringDay || "sunday",
      recurringTime: stream.recurringTime || "10:00",
    });
    setIsCreating(false);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    await handleUpdate(editingId, {
      title: form.title,
      description: form.description || undefined,
      youtubeUrl: form.youtubeUrl || undefined,
      scheduledAt: form.scheduledAt,
      thumbnailUrl: form.thumbnailUrl || undefined,
      duration: form.duration ? parseInt(form.duration) : undefined,
      isRecurring: form.isRecurring,
      recurringDay: form.recurringDay || undefined,
      recurringTime: form.recurringTime || undefined,
    } as any);
    resetForm();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("he-IL", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white border-2 border-[#D5C4B7] rounded-xl overflow-hidden" dir="rtl">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 sm:p-6 cursor-pointer hover:bg-[#F7F3EB]/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <div className="bg-red-100 p-3 rounded-full">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#2D3142]">ניהול שידורים חיים</h3>
            <p className="text-sm text-[#2D3142]/60">
              {streams.length} שידורים | {streams.filter(s => s.status === "scheduled").length} מתוזמנים
            </p>
          </div>
        </div>
        <svg
          className={`w-6 h-6 text-[#2D3142] transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-[#D5C4B7] p-4 sm:p-6">
          {/* Message toast */}
          {message && (
            <div
              className={`mb-4 p-3 rounded-lg text-center text-sm font-medium ${
                message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Create new / Edit form */}
          {(isCreating || editingId) && (
            <div className="bg-[#F7F3EB] rounded-xl p-4 mb-6 border border-[#D5C4B7]/30">
              <h4 className="font-bold text-[#2D3142] mb-4">
                {editingId ? "עריכת שידור" : "יצירת שידור חדש"}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2D3142] mb-1">כותרת *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full p-2 border border-[#D5C4B7] rounded-lg bg-white text-[#2D3142] text-sm"
                    placeholder="שיעור לייב עם בועז"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2D3142] mb-1">תאריך ושעה *</label>
                  <input
                    type="datetime-local"
                    value={form.scheduledAt}
                    onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                    className="w-full p-2 border border-[#D5C4B7] rounded-lg bg-white text-[#2D3142] text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-[#2D3142] mb-1">תיאור</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full p-2 border border-[#D5C4B7] rounded-lg bg-white text-[#2D3142] text-sm"
                    rows={2}
                    placeholder="תיאור קצר של השיעור..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2D3142] mb-1">
                    קישור YouTube Live
                  </label>
                  <input
                    type="text"
                    value={form.youtubeUrl}
                    onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
                    className="w-full p-2 border border-[#D5C4B7] rounded-lg bg-white text-[#2D3142] text-sm"
                    placeholder="https://www.youtube.com/watch?v=..."
                    dir="ltr"
                  />
                  <p className="text-xs text-[#5D5D5D] mt-1">
                    אפשר להוסיף גם אחרי היצירה, לפני תחילת השידור
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2D3142] mb-1">משך בדקות</label>
                  <input
                    type="number"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    className="w-full p-2 border border-[#D5C4B7] rounded-lg bg-white text-[#2D3142] text-sm"
                    placeholder="60"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2D3142] mb-1">תמונת רקע (URL)</label>
                  <input
                    type="text"
                    value={form.thumbnailUrl}
                    onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
                    className="w-full p-2 border border-[#D5C4B7] rounded-lg bg-white text-[#2D3142] text-sm"
                    placeholder="https://..."
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-[#2D3142] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isRecurring}
                      onChange={(e) => setForm({ ...form, isRecurring: e.target.checked })}
                      className="w-4 h-4 rounded border-[#D5C4B7]"
                    />
                    שידור שבועי קבוע
                  </label>
                  {form.isRecurring && (
                    <div className="flex gap-2 mt-2">
                      <select
                        value={form.recurringDay}
                        onChange={(e) => setForm({ ...form, recurringDay: e.target.value })}
                        className="flex-1 p-2 border border-[#D5C4B7] rounded-lg bg-white text-[#2D3142] text-sm"
                      >
                        {DAY_OPTIONS.map((d) => (
                          <option key={d.value} value={d.value}>
                            {d.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="time"
                        value={form.recurringTime}
                        onChange={(e) => setForm({ ...form, recurringTime: e.target.value })}
                        className="p-2 border border-[#D5C4B7] rounded-lg bg-white text-[#2D3142] text-sm"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={editingId ? handleSaveEdit : handleCreate}
                  disabled={saving}
                  className="bg-[#D5C4B7] hover:bg-[#c4b3a6] text-[#2D3142] px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 text-sm"
                >
                  {saving ? "שומר..." : editingId ? "שמור שינויים" : "צור שידור"}
                </button>
                <button
                  onClick={resetForm}
                  className="bg-gray-100 hover:bg-gray-200 text-[#2D3142] px-6 py-2 rounded-lg font-medium transition-colors text-sm"
                >
                  ביטול
                </button>
              </div>
            </div>
          )}

          {/* Add new button */}
          {!isCreating && !editingId && (
            <button
              onClick={() => setIsCreating(true)}
              className="mb-6 bg-[#D5C4B7] hover:bg-[#c4b3a6] text-[#2D3142] px-6 py-2.5 rounded-lg font-medium transition-colors text-sm flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              שידור חדש
            </button>
          )}

          {/* Streams list */}
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-3 border-[#D5C4B7] border-t-[#B8A99C] rounded-full animate-spin mx-auto"></div>
            </div>
          ) : streams.length === 0 ? (
            <div className="text-center py-8 text-[#5D5D5D]">
              <p>אין שידורים עדיין. צור שידור חדש כדי להתחיל!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {streams.map((stream) => (
                <div
                  key={stream.id}
                  className={`bg-white border rounded-xl p-4 ${
                    stream.status === "live" ? "border-red-300 bg-red-50/30" : "border-[#D5C4B7]/50"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-[#2D3142]">{stream.title}</h4>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            STATUS_LABELS[stream.status]?.color || "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {STATUS_LABELS[stream.status]?.label || stream.status}
                        </span>
                      </div>
                      <p className="text-sm text-[#5D5D5D]">{formatDate(stream.scheduledAt)}</p>
                      {stream.youtubeVideoId && (
                        <p className="text-xs text-[#5D5D5D] mt-1">
                          YouTube: {stream.youtubeVideoId}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Status change buttons */}
                      {stream.status === "scheduled" && (
                        <button
                          onClick={() => handleStatusChange(stream.id, "live")}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                        >
                          🔴 התחל שידור
                        </button>
                      )}
                      {stream.status === "live" && (
                        <button
                          onClick={() => handleStatusChange(stream.id, "ended")}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                        >
                          סיים שידור
                        </button>
                      )}
                      
                      <button
                        onClick={() => startEditing(stream)}
                        className="bg-[#F7F3EB] hover:bg-[#E6DEDA] text-[#2D3142] px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                      >
                        ערוך
                      </button>
                      <button
                        onClick={() => handleDelete(stream.id)}
                        className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                      >
                        מחק
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Instructions */}
          <div className="mt-6 bg-blue-50 rounded-xl p-4 text-sm text-blue-800">
            <h5 className="font-bold mb-2">📋 איך להשתמש:</h5>
            <ol className="space-y-1 list-decimal list-inside">
              <li>צרו שידור חדש עם כותרת, תאריך ושעה</li>
              <li>לפני השידור - הוסיפו את קישור ה-YouTube Live</li>
              <li>לחצו &quot;התחל שידור&quot; כשמתחילים לשדר ב-YouTube</li>
              <li>לחצו &quot;סיים שידור&quot; כשמסיימים</li>
              <li>העלו את ההקלטה ל-Vimeo בתיקיית &quot;שיעורי לייב&quot;</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLiveManager;
