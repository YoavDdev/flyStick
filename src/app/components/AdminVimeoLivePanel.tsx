"use client";

import React, { useState, useEffect } from "react";

interface LiveEvent {
  id: string;
  title: string;
  description: string;
  status: string;
  scheduledAt: string;
  estimatedDuration: number;
  vimeoEmbedUrl: string;
  vimeoEventUrl: string;
}

const AdminVimeoLivePanel = () => {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<LiveEvent | null>(null);
  const [saving, setSaving] = useState(false);
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [expandedRegs, setExpandedRegs] = useState<string | null>(null);
  const [regsData, setRegsData] = useState<Record<string, any[]>>({});
  const [regsLoading, setRegsLoading] = useState(false);
  const [msgForm, setMsgForm] = useState<{ eventId: string; title: string; content: string } | null>(null);
  const [sendingMsg, setSendingMsg] = useState(false);
  const [msgSuccess, setMsgSuccess] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    title: "",
    description: "",
    scheduledAt: "",
    scheduledTime: "",
    estimatedDuration: 60,
    vimeoEmbedUrl: "",
    vimeoEventUrl: "",
  });

  const getAuthHeaders = () => {
    const user = JSON.parse(localStorage.getItem("admin_user") || "{}");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user.email || ""}`,
    };
  };

  const fetchEvents = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/live-events", { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        setEvents(data.events || []);
      } else {
        setError(data.error || "שגיאה בטעינת אירועים");
      }
    } catch (err) {
      setError("שגיאה בטעינת אירועים");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Get the saved embed URL from the most recent event
  const savedEmbedUrl = events.length > 0
    ? events.find((e) => e.vimeoEmbedUrl)?.vimeoEmbedUrl || ""
    : "";

  const resetForm = () => {
    setForm({ title: "", description: "", scheduledAt: "", scheduledTime: "", estimatedDuration: 60, vimeoEmbedUrl: savedEmbedUrl, vimeoEventUrl: "" });
    setEditingEvent(null);
    setShowForm(false);
  };

  const openEditForm = (event: LiveEvent) => {
    const date = new Date(event.scheduledAt);
    setForm({
      title: event.title,
      description: event.description || "",
      scheduledAt: date.toISOString().split("T")[0],
      scheduledTime: `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`,
      estimatedDuration: event.estimatedDuration,
      vimeoEmbedUrl: event.vimeoEmbedUrl || "",
      vimeoEventUrl: event.vimeoEventUrl || "",
    });
    setEditingEvent(event);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.scheduledAt || !form.scheduledTime) {
      setError("חסרים שדות חובה: כותרת, תאריך ושעה");
      return;
    }

    setSaving(true);
    setError("");

    const scheduledAt = new Date(`${form.scheduledAt}T${form.scheduledTime}:00`);

    try {
      const method = editingEvent ? "PUT" : "POST";
      const body = editingEvent
        ? { id: editingEvent.id, title: form.title, description: form.description, scheduledAt: scheduledAt.toISOString(), estimatedDuration: form.estimatedDuration, vimeoEmbedUrl: form.vimeoEmbedUrl, vimeoEventUrl: form.vimeoEventUrl }
        : { title: form.title, description: form.description, scheduledAt: scheduledAt.toISOString(), estimatedDuration: form.estimatedDuration, vimeoEmbedUrl: form.vimeoEmbedUrl, vimeoEventUrl: form.vimeoEventUrl };

      const res = await fetch("/api/admin/live-events", {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        resetForm();
        fetchEvents();
      } else {
        setError(data.error || "שגיאה בשמירה");
      }
    } catch (err) {
      setError("שגיאה בשמירה");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (eventId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/live-events", {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ id: eventId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) fetchEvents();
      else setError(data.error || "שגיאה בעדכון סטטוס");
    } catch (err) {
      setError("שגיאה בעדכון סטטוס");
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm("למחוק את האירוע?")) return;
    try {
      const res = await fetch(`/api/admin/live-events?id=${eventId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) fetchEvents();
      else setError(data.error || "שגיאה במחיקה");
    } catch (err) {
      setError("שגיאה במחיקה");
    }
  };

  const sendMessageToRegistrants = async (eventId: string) => {
    if (!msgForm || !msgForm.title || !msgForm.content) {
      setError("חסרים כותרת ותוכן להודעה");
      return;
    }
    setSendingMsg(true);
    setError("");
    try {
      const res = await fetch("/api/admin/live-events/registrations/message", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ eventId, title: msgForm.title, content: msgForm.content }),
      });
      const data = await res.json();
      if (data.success) {
        setMsgForm(null);
        setMsgSuccess(`ההודעה נשלחה ל-${data.count} נרשמים!`);
        setTimeout(() => setMsgSuccess(null), 4000);
      } else {
        setError(data.error || "שגיאה בשליחת הודעה");
      }
    } catch {
      setError("שגיאה בשליחת הודעה");
    }
    setSendingMsg(false);
  };

  const fetchRegistrations = async (eventId: string) => {
    if (expandedRegs === eventId) {
      setExpandedRegs(null);
      return;
    }
    setRegsLoading(true);
    setExpandedRegs(eventId);
    try {
      const res = await fetch(`/api/admin/live-events/registrations?eventId=${eventId}`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        setRegsData(prev => ({ ...prev, [eventId]: data.registrations }));
      }
    } catch { /* ignore */ }
    setRegsLoading(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
    return `יום ${days[date.getDay()]} ${date.getDate()}.${date.getMonth() + 1} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  };

  const statusConfig: Record<string, { text: string; color: string }> = {
    live: { text: "שידור חי", color: "bg-red-100 text-red-700" },
    scheduled: { text: "מתוזמן", color: "bg-blue-100 text-blue-700" },
    ended: { text: "הסתיים", color: "bg-gray-100 text-gray-600" },
    cancelled: { text: "בוטל", color: "bg-orange-100 text-orange-700" },
  };

  const liveEvents = events.filter((e) => e.status === "live");
  const scheduledEvents = events.filter((e) => e.status === "scheduled").sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  const pastEvents = events.filter((e) => e.status === "ended" || e.status === "cancelled").sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

  return (
    <div className="bg-white rounded-2xl shadow-md border border-[#D5C4B7]/30 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#D5C4B7]/20 to-[#B8A99C]/20 p-4 border-b border-[#D5C4B7]/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#D5C4B7] rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-[#2D3142]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-[#2D3142]">ניהול שידורים חיים</h3>
              <p className="text-xs text-[#5D5D5D]">לוח שידורים + Vimeo embed</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchEvents} disabled={loading} className="text-sm bg-[#F7F3EB] text-[#2D3142] px-3 py-2 rounded-lg hover:bg-[#D5C4B7]/30 transition-colors disabled:opacity-50">
              {loading ? "..." : "רענן"}
            </button>
            <button onClick={() => { setForm({ title: "", description: "", scheduledAt: "", scheduledTime: "", estimatedDuration: 60, vimeoEmbedUrl: savedEmbedUrl, vimeoEventUrl: "" }); setEditingEvent(null); setShowForm(true); }} className="text-sm bg-[#D5C4B7] text-[#2D3142] px-4 py-2 rounded-lg hover:bg-[#B8A99C] transition-colors font-medium">
              + שידור חדש
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4" dir="rtl">
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

        {/* Create/Edit Form */}
        {showForm && (
          <div className="bg-[#F7F3EB] border border-[#D5C4B7]/50 rounded-xl p-4 space-y-3">
            <h4 className="font-bold text-[#2D3142] text-sm">{editingEvent ? "עריכת שידור" : "שידור חדש"}</h4>

            <div>
              <label className="text-xs text-[#5D5D5D] block mb-1">כותרת *</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border border-[#D5C4B7] rounded-lg px-3 py-2 text-sm bg-white" placeholder="שיעור פיילסטיק שבועי" />
            </div>

            <div>
              <label className="text-xs text-[#5D5D5D] block mb-1">תיאור</label>
              <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-[#D5C4B7] rounded-lg px-3 py-2 text-sm bg-white" placeholder="שיעור לכל הרמות" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[#5D5D5D] block mb-1">תאריך *</label>
                <input type="date" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} className="w-full border border-[#D5C4B7] rounded-lg px-3 py-2 text-sm bg-white" />
              </div>
              <div>
                <label className="text-xs text-[#5D5D5D] block mb-1">שעה * (HH:MM)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.scheduledTime}
                  onChange={(e) => {
                    let val = e.target.value.replace(/[^\d:]/g, "");
                    // Auto-insert colon after 2 digits
                    if (val.length === 2 && !val.includes(":") && form.scheduledTime.length < val.length) {
                      val = val + ":";
                    }
                    if (val.length <= 5) {
                      setForm({ ...form, scheduledTime: val });
                    }
                  }}
                  placeholder="21:00"
                  className="w-full border border-[#D5C4B7] rounded-lg px-3 py-2 text-sm bg-white text-center"
                  maxLength={5}
                />
              </div>
            </div>
            <div className="w-1/2">
              <label className="text-xs text-[#5D5D5D] block mb-1">משך (דקות)</label>
              <input type="number" value={form.estimatedDuration} onChange={(e) => setForm({ ...form, estimatedDuration: parseInt(e.target.value) || 60 })} className="w-full border border-[#D5C4B7] rounded-lg px-3 py-2 text-sm bg-white" />
            </div>

            {/* Vimeo Embed URL - show as info if already saved, editable if not */}
            {form.vimeoEmbedUrl ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 text-xs">✅</span>
                    <span className="text-xs text-green-700 font-medium">Vimeo Event מקושר</span>
                  </div>
                  <button type="button" onClick={() => setForm({ ...form, vimeoEmbedUrl: "" })} className="text-xs text-green-600 hover:text-green-800 underline">
                    שנה
                  </button>
                </div>
                <p className="text-[10px] text-green-600 font-mono mt-1" dir="ltr">{form.vimeoEmbedUrl}</p>
              </div>
            ) : (
              <div>
                <label className="text-xs text-[#5D5D5D] block mb-1">Vimeo Embed URL (פעם אחת בלבד)</label>
                <input type="text" value={form.vimeoEmbedUrl} onChange={(e) => setForm({ ...form, vimeoEmbedUrl: e.target.value })} className="w-full border border-[#D5C4B7] rounded-lg px-3 py-2 text-sm bg-white font-mono text-xs" dir="ltr" placeholder="https://vimeo.com/event/XXXXX/embed/XXXXX/interaction" />
                <p className="text-[10px] text-[#5D5D5D] mt-1">ב-Vimeo: Embed → העתק את ה-src URL מתוך ה-iframe. מספיק פעם אחת — ישמר לכל השידורים הבאים.</p>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button onClick={handleSave} disabled={saving} className="bg-[#2D3142] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#2D3142]/80 transition-colors disabled:opacity-50">
                {saving ? "שומר..." : editingEvent ? "עדכן" : "צור שידור"}
              </button>
              <button onClick={resetForm} className="bg-white text-[#5D5D5D] px-4 py-2 rounded-lg text-sm border border-[#D5C4B7] hover:bg-[#F7F3EB] transition-colors">
                ביטול
              </button>
            </div>
          </div>
        )}

        {/* Live Now */}
        {liveEvents.map((event) => (
          <div key={event.id} className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                </div>
                <span className="font-bold text-red-700">שידור פעיל: {event.title}</span>
              </div>
              <button onClick={() => handleStatusChange(event.id, "ended")} className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors">
                סיים שידור
              </button>
            </div>
            {event.vimeoEmbedUrl && <p className="text-xs text-red-600 mt-1 font-mono" dir="ltr">{event.vimeoEmbedUrl}</p>}
          </div>
        ))}

        {/* Scheduled Events */}
        {scheduledEvents.length > 0 && (
          <div>
            <h4 className="font-medium text-[#2D3142] mb-2 text-sm">📅 שידורים מתוזמנים ({scheduledEvents.length})</h4>
            <div className="space-y-2">
              {scheduledEvents.map((event) => {
                const cfg = statusConfig[event.status] || statusConfig.scheduled;
                return (
                  <div key={event.id} className="bg-[#F7F3EB] p-3 rounded-lg">
                    <div className="flex items-center gap-3 text-sm">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>{cfg.text}</span>
                      <span className="text-[#2D3142] font-medium flex-1 truncate">{event.title}</span>
                      <span className="text-[#5D5D5D] text-xs whitespace-nowrap">{formatDate(event.scheduledAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => handleStatusChange(event.id, "live")} className="text-xs bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors">
                        התחל שידור
                      </button>
                      <button onClick={() => fetchRegistrations(event.id)} className={`text-xs px-3 py-1 rounded-lg border transition-colors ${expandedRegs === event.id ? "bg-[#D5C4B7]/30 border-[#D5C4B7]" : "bg-white border-[#D5C4B7] hover:bg-[#D5C4B7]/20"} text-[#2D3142]`}>
                        👥 נרשמים
                      </button>
                      <button onClick={() => openEditForm(event)} className="text-xs bg-white text-[#2D3142] px-3 py-1 rounded-lg border border-[#D5C4B7] hover:bg-[#D5C4B7]/20 transition-colors">
                        ערוך
                      </button>
                      <button onClick={() => handleStatusChange(event.id, "cancelled")} className="text-xs text-orange-600 px-2 py-1 hover:bg-orange-50 rounded-lg transition-colors">
                        בטל
                      </button>
                      <button onClick={() => handleDelete(event.id)} className="text-xs text-red-400 px-2 py-1 hover:bg-red-50 rounded-lg transition-colors">
                        מחק
                      </button>
                    </div>

                    {/* Registrations list */}
                    {expandedRegs === event.id && (
                      <div className="mt-3 bg-white border border-[#D5C4B7]/40 rounded-lg p-3">
                        <h5 className="text-xs font-bold text-[#2D3142] mb-2">👥 נרשמים לשיעור</h5>
                        {regsLoading ? (
                          <p className="text-xs text-[#5D5D5D]">טוען...</p>
                        ) : (regsData[event.id]?.length || 0) === 0 ? (
                          <p className="text-xs text-[#5D5D5D]">אין נרשמים עדיין</p>
                        ) : (
                          <div className="space-y-1.5">
                            {regsData[event.id].map((reg: any, i: number) => (
                              <div key={reg.id} className="flex items-center gap-2 text-xs p-1.5 rounded bg-[#F7F3EB]/50">
                                <span className="text-[#5D5D5D] w-5">{i + 1}.</span>
                                <span className="font-medium text-[#2D3142]">{reg.userName}</span>
                                <span className="text-[#5D5D5D]">{reg.userEmail}</span>
                                {reg.isSubscriber && <span className="text-[8px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">מנוי</span>}
                              </div>
                            ))}
                            <p className="text-[10px] text-[#5D5D5D] mt-2 pt-2 border-t border-[#D5C4B7]/20">סה"כ: {regsData[event.id].length} נרשמים</p>
                          </div>
                        )}

                        {/* Send message to registrants */}
                        {(regsData[event.id]?.length || 0) > 0 && !msgForm && (
                          <button
                            onClick={() => setMsgForm({ eventId: event.id, title: `עדכון: ${event.title}`, content: "" })}
                            className="mt-3 w-full text-xs bg-[#2D3142] text-white px-3 py-2 rounded-lg hover:bg-[#2D3142]/80 transition-colors font-medium flex items-center justify-center gap-1.5"
                          >
                            ✉️ שלח הודעה לנרשמים
                          </button>
                        )}

                        {msgForm && msgForm.eventId === event.id && (
                          <div className="mt-3 bg-[#F7F3EB] border border-[#D5C4B7]/50 rounded-lg p-3 space-y-2">
                            <h6 className="text-xs font-bold text-[#2D3142]">✉️ הודעה לנרשמים ({regsData[event.id]?.length || 0})</h6>
                            <input
                              type="text"
                              value={msgForm.title}
                              onChange={(e) => setMsgForm({ ...msgForm, title: e.target.value })}
                              className="w-full border border-[#D5C4B7] rounded-lg px-3 py-1.5 text-xs bg-white"
                              placeholder="כותרת (למשל: השיעור מבוטל)"
                            />
                            <textarea
                              value={msgForm.content}
                              onChange={(e) => setMsgForm({ ...msgForm, content: e.target.value })}
                              className="w-full border border-[#D5C4B7] rounded-lg px-3 py-1.5 text-xs bg-white min-h-[60px] resize-none"
                              placeholder="תוכן ההודעה..."
                            />
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => sendMessageToRegistrants(event.id)}
                                disabled={sendingMsg}
                                className="text-xs bg-[#2D3142] text-white px-3 py-1.5 rounded-lg hover:bg-[#2D3142]/80 transition-colors disabled:opacity-50"
                              >
                                {sendingMsg ? "שולח..." : "שלח"}
                              </button>
                              <button
                                onClick={() => setMsgForm(null)}
                                className="text-xs bg-white text-[#5D5D5D] px-3 py-1.5 rounded-lg border border-[#D5C4B7] hover:bg-[#F7F3EB] transition-colors"
                              >
                                ביטול
                              </button>
                            </div>
                          </div>
                        )}

                        {msgSuccess && expandedRegs === event.id && (
                          <div className="mt-2 bg-green-50 border border-green-200 text-green-700 text-xs p-2 rounded-lg text-center">
                            {msgSuccess}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Past Events - Collapsible */}
        {pastEvents.length > 0 && (
          <div className="border border-[#D5C4B7]/30 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowPastEvents(!showPastEvents)}
              className="w-full flex items-center justify-between p-3 bg-[#F7F3EB]/50 hover:bg-[#F7F3EB] transition-colors text-sm"
            >
              <span className="font-medium text-[#5D5D5D]">🕐 היסטוריית שידורים ({pastEvents.length})</span>
              <svg className={`w-4 h-4 text-[#5D5D5D] transition-transform ${showPastEvents ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showPastEvents && (
              <div className="p-3 space-y-1 max-h-64 overflow-y-auto">
                {pastEvents.map((event) => {
                  const cfg = statusConfig[event.status] || statusConfig.ended;
                  return (
                    <div key={event.id} className="flex items-center gap-3 p-2 rounded-lg text-sm text-[#5D5D5D] hover:bg-[#F7F3EB]/50">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${cfg.color}`}>{cfg.text}</span>
                      <span className="truncate flex-1">{event.title}</span>
                      <span className="text-xs whitespace-nowrap">{formatDate(event.scheduledAt)}</span>
                      <button onClick={() => handleDelete(event.id)} className="text-xs text-red-400 hover:text-red-600">מחק</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!loading && events.length === 0 && !error && !showForm && (
          <div className="text-center py-6 text-[#5D5D5D]">
            <p className="text-sm">אין שידורים מתוזמנים</p>
            <p className="text-xs mt-1">לחץ ״+ שידור חדש״ כדי להוסיף</p>
          </div>
        )}

        {/* Vimeo link */}
        <div className="bg-[#F7F3EB] rounded-xl p-3 text-center">
          <a href="https://vimeo.com/manage/live-events" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs font-medium text-[#5D5D5D] hover:text-[#2D3142] transition-colors">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            פתח Vimeo Live Events
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminVimeoLivePanel;
