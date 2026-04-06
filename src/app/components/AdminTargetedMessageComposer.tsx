"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  FaPaperPlane,
  FaTimes,
  FaUsers,
  FaUser,
  FaCrown,
  FaGift,
  FaNewspaper,
  FaUserFriends,
  FaReply,
  FaSearch,
  FaCheck,
} from "react-icons/fa";

interface UserOption {
  id: string;
  name: string | null;
  email: string;
}

const TARGET_GROUPS = [
  {
    id: "all",
    label: "כל המשתמשים",
    description: "כל מי שרשום באתר",
    icon: <FaUsers className="text-blue-500" />,
    color: "blue",
  },
  {
    id: "active",
    label: "מנויים פעילים",
    description: "משלמים עם מנוי פעיל",
    icon: <FaCrown className="text-yellow-500" />,
    color: "yellow",
  },
  {
    id: "free",
    label: "גישה חינמית",
    description: "משתמשים עם גישה חינמית",
    icon: <FaUserFriends className="text-green-500" />,
    color: "green",
  },
  {
    id: "series",
    label: "רוכשי סדרות",
    description: "שילמו על קורס כלשהו",
    icon: <FaGift className="text-purple-500" />,
    color: "purple",
  },
  {
    id: "newsletter",
    label: "מנויי ניוזלטר",
    description: "רשומים לרשימת התפוצה",
    icon: <FaNewspaper className="text-orange-500" />,
    color: "orange",
  },
  {
    id: "individual",
    label: "משתמש בודד",
    description: "חיפוש לפי שם או אימייל",
    icon: <FaUser className="text-indigo-500" />,
    color: "indigo",
  },
];

const AdminTargetedMessageComposer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"group" | "compose">("group");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [link, setLink] = useState("");
  const [linkText, setLinkText] = useState("");
  const [allowReply, setAllowReply] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Individual user search
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<UserOption[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (selectedGroup !== "individual" || searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/admin/search-users?q=${encodeURIComponent(searchTerm)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.users || []);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedGroup]);

  const handleReset = () => {
    setStep("group");
    setSelectedGroup(null);
    setTitle("");
    setContent("");
    setLink("");
    setLinkText("");
    setAllowReply(false);
    setSearchTerm("");
    setSearchResults([]);
    setSelectedUsers([]);
    setIsOpen(false);
  };

  const handleSelectGroup = (groupId: string) => {
    setSelectedGroup(groupId);
    setStep("compose");
  };

  const toggleUser = (user: UserOption) => {
    setSelectedUsers((prev) => {
      const exists = prev.find((u) => u.id === user.id);
      if (exists) return prev.filter((u) => u.id !== user.id);
      return [...prev, user];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error("כותרת ותוכן נדרשים");
      return;
    }

    if (selectedGroup === "individual" && selectedUsers.length === 0) {
      toast.error("יש לבחור לפחות משתמש אחד");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/send-targeted-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          link: link.trim() || null,
          linkText: linkText.trim() || null,
          targetGroup: selectedGroup,
          individualUserIds:
            selectedGroup === "individual"
              ? selectedUsers.map((u) => u.id)
              : undefined,
          allowReply,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "שגיאה בשליחה");
      }

      const groupLabel = TARGET_GROUPS.find((g) => g.id === selectedGroup)?.label || "";
      toast.success(`${data.message}`, { duration: 5000 });
      handleReset();
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        error instanceof Error ? error.message : "שגיאה בשליחת ההודעה"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-6">
      {!isOpen ? (
        <motion.button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-[#2D3142] to-[#4A4E69] hover:from-[#4A4E69] hover:to-[#2D3142] text-white py-3 px-6 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#2D3142]/30 flex items-center gap-2 font-medium shadow-md"
          whileHover={{ y: -2 }}
          whileTap={{ y: 0 }}
        >
          <FaUsers className="text-sm" />
          הודעה ממוקדת לקבוצה / משתמש
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#D5C4B7]/40 rounded-xl p-6 shadow-lg"
          style={{ direction: "rtl" }}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-[#2D3142]">
                {step === "group" ? "📨 בחר קהל יעד" : "✍️ כתוב הודעה"}
              </h3>
              {selectedGroup && step === "compose" && (
                <span className="bg-[#F7F3EB] text-[#2D3142] text-xs font-medium px-2 py-1 rounded-full">
                  {TARGET_GROUPS.find((g) => g.id === selectedGroup)?.label}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {step === "compose" && (
                <button
                  onClick={() => setStep("group")}
                  className="text-sm text-[#D5C4B7] hover:text-[#B8A99C] transition-colors font-medium"
                >
                  ← חזרה
                </button>
              )}
              <button
                onClick={handleReset}
                className="text-[#3D3D3D] hover:text-[#2D3142] transition-colors"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Group Selection */}
            {step === "group" && (
              <motion.div
                key="group"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="grid grid-cols-2 sm:grid-cols-3 gap-3"
              >
                {TARGET_GROUPS.map((group) => (
                  <motion.button
                    key={group.id}
                    onClick={() => handleSelectGroup(group.id)}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-[#D5C4B7]/20 hover:border-[#D5C4B7] bg-[#F7F3EB]/50 hover:bg-[#F7F3EB] transition-all duration-200 text-center"
                    whileHover={{ y: -2, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="text-2xl">{group.icon}</div>
                    <span className="font-bold text-sm text-[#2D3142]">
                      {group.label}
                    </span>
                    <span className="text-xs text-[#3D3D3D]/70">
                      {group.description}
                    </span>
                  </motion.button>
                ))}
              </motion.div>
            )}

            {/* Step 2: Compose Message */}
            {step === "compose" && (
              <motion.form
                key="compose"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {/* Individual User Search */}
                {selectedGroup === "individual" && (
                  <div className="space-y-3">
                    <div className="relative">
                      <FaSearch className="absolute right-3 top-3 text-[#B8A99C]" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="חפש לפי שם או אימייל..."
                        className="w-full pr-10 pl-4 py-2.5 border border-[#D5C4B7]/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D5C4B7]/30 bg-white text-[#2D3142]"
                      />
                    </div>

                    {/* Search Results */}
                    {searchResults.length > 0 && (
                      <div className="max-h-40 overflow-y-auto border border-[#D5C4B7]/30 rounded-lg divide-y divide-[#D5C4B7]/10">
                        {searchResults.map((user) => {
                          const isSelected = selectedUsers.some(
                            (u) => u.id === user.id
                          );
                          return (
                            <button
                              key={user.id}
                              type="button"
                              onClick={() => toggleUser(user)}
                              className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-[#F7F3EB] transition-colors ${
                                isSelected ? "bg-green-50" : ""
                              }`}
                            >
                              <div className="text-right">
                                <span className="font-medium text-[#2D3142]">
                                  {user.name || "ללא שם"}
                                </span>
                                <span className="text-[#3D3D3D]/60 mr-2 text-xs">
                                  {user.email}
                                </span>
                              </div>
                              {isSelected && (
                                <FaCheck className="text-green-500 text-xs" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {isSearching && (
                      <p className="text-xs text-[#B8A99C] text-center">
                        מחפש...
                      </p>
                    )}

                    {/* Selected Users */}
                    {selectedUsers.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedUsers.map((user) => (
                          <span
                            key={user.id}
                            className="bg-[#D5C4B7]/20 text-[#2D3142] text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1"
                          >
                            {user.name || user.email}
                            <button
                              type="button"
                              onClick={() => toggleUser(user)}
                              className="hover:text-red-500"
                            >
                              <FaTimes className="text-[10px]" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Title */}
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="כותרת ההודעה"
                  className="w-full px-4 py-2.5 border border-[#D5C4B7]/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D5C4B7]/30 bg-white text-[#2D3142] font-medium"
                  required
                />

                {/* Content */}
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="תוכן ההודעה"
                  rows={4}
                  className="w-full px-4 py-2.5 border border-[#D5C4B7]/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D5C4B7]/30 bg-white text-[#2D3142] resize-none"
                  required
                />

                {/* Link */}
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="קישור (אופציונלי)"
                    className="px-4 py-2 border border-[#D5C4B7]/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D5C4B7]/30 bg-white text-[#2D3142] text-sm"
                  />
                  <input
                    type="text"
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    placeholder="טקסט לכפתור"
                    className="px-4 py-2 border border-[#D5C4B7]/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D5C4B7]/30 bg-white text-[#2D3142] text-sm"
                  />
                </div>

                {/* Allow Reply Toggle */}
                <div
                  className="flex items-center gap-3 bg-[#F7F3EB] p-3 rounded-lg cursor-pointer"
                  onClick={() => setAllowReply(!allowReply)}
                >
                  <div
                    className={`w-10 h-5 rounded-full transition-colors duration-200 relative ${
                      allowReply ? "bg-green-400" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all duration-200 shadow ${
                        allowReply ? "left-0.5" : "left-[22px]"
                      }`}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <FaReply
                      className={
                        allowReply ? "text-green-500" : "text-gray-400"
                      }
                    />
                    <div>
                      <span className="font-medium text-sm text-[#2D3142]">
                        אפשר תשובה
                      </span>
                      <p className="text-xs text-[#3D3D3D]/60">
                        {allowReply
                          ? "המשתמשים יוכלו להשיב להודעה"
                          : "הודעת מערכת חד-כיוונית"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-[#2D3142] to-[#4A4E69] hover:from-[#4A4E69] hover:to-[#2D3142] disabled:opacity-50 text-white py-3 px-6 rounded-lg transition-all duration-200 font-bold flex items-center justify-center gap-2 shadow-md"
                  whileHover={!isLoading ? { y: -1 } : {}}
                  whileTap={!isLoading ? { y: 0 } : {}}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      שולח...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="text-sm" />
                      שלח הודעה
                    </>
                  )}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default AdminTargetedMessageComposer;
