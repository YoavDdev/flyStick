"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaReply, FaEnvelope, FaEnvelopeOpen, FaChevronDown, FaChevronUp, FaCheck } from "react-icons/fa";

interface Reply {
  id: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

interface MessageWithReplies {
  id: string;
  title: string;
  content: string;
  targetGroup: string | null;
  createdAt: string;
  replies: Reply[];
  _count: { replies: number };
}

const GROUP_LABELS: Record<string, string> = {
  all: "כל המשתמשים",
  active: "מנויים פעילים",
  free: "גישה חינמית",
  series: "רוכשי סדרות",
  newsletter: "מנויי ניוזלטר",
  individual: "משתמש בודד",
};

const AdminMessageReplies = () => {
  const [messages, setMessages] = useState<MessageWithReplies[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchReplies = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/message-replies");
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Error fetching replies:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReplies();
    // Poll every 30 seconds
    const interval = setInterval(fetchReplies, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (messageId: string) => {
    try {
      await fetch("/api/admin/message-replies", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId }),
      });
      fetchReplies();
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const toggleMessage = (messageId: string) => {
    if (expandedMessage === messageId) {
      setExpandedMessage(null);
    } else {
      setExpandedMessage(messageId);
      // Mark replies of this message as read
      const msg = messages.find((m) => m.id === messageId);
      if (msg?.replies.some((r) => !r.isRead)) {
        markAsRead(messageId);
      }
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("he-IL", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="mb-6">
      {!isOpen ? (
        <motion.button
          onClick={() => setIsOpen(true)}
          className="relative bg-gradient-to-r from-[#D5C4B7] to-[#B8A99C] hover:from-[#B8A99C] hover:to-[#D5C4B7] text-[#2D3142] py-3 px-6 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#D5C4B7]/30 flex items-center gap-2 font-medium shadow-md"
          whileHover={{ y: -2 }}
          whileTap={{ y: 0 }}
        >
          <FaReply className="text-sm" />
          תשובות מהמשתמשים
          {unreadCount > 0 && (
            <span className="absolute -top-2 -left-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#D5C4B7]/40 rounded-xl p-6 shadow-lg"
          style={{ direction: "rtl" }}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-[#2D3142]">
                💬 תשובות מהמשתמשים
              </h3>
              {unreadCount > 0 && (
                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} חדשות
                </span>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#3D3D3D] hover:text-[#2D3142] transition-colors"
            >
              ✕
            </button>
          </div>

          {isLoading && messages.length === 0 ? (
            <div className="text-center py-8 text-[#B8A99C]">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#D5C4B7] border-t-transparent mx-auto mb-2" />
              טוען...
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-[#B8A99C]">
              <FaReply className="mx-auto text-3xl mb-2 opacity-30" />
              <p>אין תשובות עדיין</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {messages.map((msg) => {
                const isExpanded = expandedMessage === msg.id;
                const unreadReplies = msg.replies.filter((r) => !r.isRead).length;

                return (
                  <div
                    key={msg.id}
                    className="border border-[#D5C4B7]/20 rounded-lg overflow-hidden"
                  >
                    {/* Message Header */}
                    <button
                      onClick={() => toggleMessage(msg.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 text-right transition-colors ${
                        isExpanded ? "bg-[#F7F3EB]" : "hover:bg-[#F7F3EB]/50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {unreadReplies > 0 ? (
                          <FaEnvelope className="text-[#D5C4B7] text-sm" />
                        ) : (
                          <FaEnvelopeOpen className="text-[#B8A99C]/50 text-sm" />
                        )}
                        <div>
                          <span className="font-bold text-sm text-[#2D3142]">
                            {msg.title}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-[#3D3D3D]/50">
                              {formatDate(msg.createdAt)}
                            </span>
                            {msg.targetGroup && (
                              <span className="text-xs bg-[#D5C4B7]/20 px-1.5 py-0.5 rounded text-[#2D3142]">
                                {GROUP_LABELS[msg.targetGroup] || msg.targetGroup}
                              </span>
                            )}
                            <span className="text-xs text-[#B8A99C]">
                              {msg._count.replies} תשובות
                            </span>
                            {unreadReplies > 0 && (
                              <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold">
                                {unreadReplies} חדשות
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {isExpanded ? (
                        <FaChevronUp className="text-[#B8A99C] text-xs" />
                      ) : (
                        <FaChevronDown className="text-[#B8A99C] text-xs" />
                      )}
                    </button>

                    {/* Replies */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-[#D5C4B7]/20"
                        >
                          <div className="divide-y divide-[#D5C4B7]/10">
                            {msg.replies.map((reply) => (
                              <div
                                key={reply.id}
                                className={`px-4 py-3 ${
                                  !reply.isRead ? "bg-blue-50/50" : ""
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    {reply.user.image ? (
                                      <img
                                        src={reply.user.image}
                                        alt=""
                                        className="w-6 h-6 rounded-full"
                                      />
                                    ) : (
                                      <div className="w-6 h-6 rounded-full bg-[#D5C4B7] flex items-center justify-center text-white text-xs font-bold">
                                        {(reply.user.name || reply.user.email)[0]}
                                      </div>
                                    )}
                                    <span className="font-medium text-sm text-[#2D3142]">
                                      {reply.user.name || reply.user.email}
                                    </span>
                                    {!reply.isRead && (
                                      <span className="w-2 h-2 bg-blue-500 rounded-full" />
                                    )}
                                  </div>
                                  <span className="text-xs text-[#3D3D3D]/50">
                                    {formatDate(reply.createdAt)}
                                  </span>
                                </div>
                                <p className="text-sm text-[#3D3D3D] leading-relaxed mr-8">
                                  {reply.content}
                                </p>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default AdminMessageReplies;
