"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaEnvelope, FaEnvelopeOpen, FaTimes, FaExternalLinkAlt, FaReply, FaCheck, FaTrashAlt } from "react-icons/fa";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

interface MessageReply {
  id: string;
  content: string;
  createdAt: string;
}

interface Message {
  id: string;
  title: string;
  content: string;
  link?: string;
  linkText?: string;
  allowReply?: boolean;
  replies?: MessageReply[];
  createdAt: string;
}

interface UserMessageNotificationProps {
  className?: string;
}

const UserMessageNotification = ({ className = "" }: UserMessageNotificationProps) => {
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);
  const [messages, setMessages] = useState<{
    unreadMessages: Message[];
    readMessages: Message[];
  }>({ unreadMessages: [], readMessages: [] });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);

  const fetchMessages = async () => {
    if (!session?.user?.email) return;

    try {
      const response = await fetch("/api/user/messages");
      if (response.ok) {
        const data = await response.json();
        setMessages({
          unreadMessages: data.unreadMessages || [],
          readMessages: data.readMessages || [],
        });
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const response = await fetch("/api/user/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messageId }),
      });

      if (response.ok) {
        // Move message from unread to read
        const messageToMove = messages.unreadMessages.find(msg => msg.id === messageId);
        if (messageToMove) {
          setMessages(prev => ({
            unreadMessages: prev.unreadMessages.filter(msg => msg.id !== messageId),
            readMessages: [messageToMove, ...prev.readMessages],
          }));
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  const markAllAsRead = async () => {
    setIsLoading(true);
    try {
      for (const message of messages.unreadMessages) {
        await markAsRead(message.id);
      }
    } catch (error) {
      console.error("Error marking all messages as read:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-mark all unread messages as read when modal opens
  const handleModalOpen = async () => {
    setIsModalOpen(true);
    
    // Auto-mark all unread messages as read
    if (messages.unreadMessages.length > 0) {
      try {
        for (const message of messages.unreadMessages) {
          await markAsRead(message.id);
        }
      } catch (error) {
        console.error("Error auto-marking messages as read:", error);
      }
    }
  };

  const handleDismissMessage = async (messageId: string) => {
    try {
      const res = await fetch("/api/user/messages", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId }),
      });
      if (res.ok) {
        setMessages((prev) => ({
          unreadMessages: prev.unreadMessages.filter((m) => m.id !== messageId),
          readMessages: prev.readMessages.filter((m) => m.id !== messageId),
        }));
        setUnreadCount((prev) => {
          const wasUnread = messages.unreadMessages.some((m) => m.id === messageId);
          return wasUnread ? Math.max(0, prev - 1) : prev;
        });
        toast.success("ההודעה נמחקה");
      }
    } catch (err) {
      toast.error("שגיאה במחיקת ההודעה");
    }
  };

  const handleSubmitReply = async (messageId: string) => {
    if (!replyText.trim()) return;
    setIsSendingReply(true);
    try {
      const res = await fetch("/api/user/message-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, content: replyText.trim() }),
      });
      if (res.ok) {
        toast.success("התשובה נשלחה בהצלחה!");
        setReplyingTo(null);
        setReplyText("");
        fetchMessages();
      } else {
        const data = await res.json();
        toast.error(data.error || "שגיאה בשליחה");
      }
    } catch (err) {
      toast.error("שגיאה בשליחת התשובה");
    } finally {
      setIsSendingReply(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    
    // Poll for new messages every 5 minutes (reduced from 30 seconds)
    // Only poll when page is visible to save resources
    const pollInterval = 300000; // 5 minutes
    
    const interval = setInterval(() => {
      // Only fetch if page is visible
      if (!document.hidden) {
        fetchMessages();
      }
    }, pollInterval);
    
    // Also fetch when page becomes visible again
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchMessages();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [session]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("he-IL", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const allMessages = [...messages.unreadMessages, ...messages.readMessages];

  return (
    <>
      {/* Notification Icon */}
      <motion.button
        onClick={handleModalOpen}
        className={`relative p-2.5 w-10 h-10 rounded-full bg-[#E5DFD0]/70 hover:bg-[#D5C4B7] shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center ${className}`}
        whileHover={{ opacity: 0.9 }}
        whileTap={{ scale: 0.95 }}
      >
        <FaEnvelope className="text-[#2D3142] text-lg" />
        
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center font-bold"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </motion.div>
        )}
      </motion.button>

      {/* Messages Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 flex items-start justify-center z-[10002] p-4 pt-16 sm:pt-20"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#F7F3EB] rounded-xl max-w-sm w-full max-h-[60vh] overflow-hidden shadow-lg border border-[#D5C4B7]/40"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-[#D5C4B7] px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FaEnvelope className="text-[#2D3142] text-base" />
                  <h2 className="text-base font-bold text-[#2D3142]">
                    הודעות מבועז
                  </h2>
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-[#2D3142] hover:text-[#1A1D2E] transition-colors"
                >
                  <FaTimes className="text-sm" />
                </button>
              </div>

              {/* Messages List */}
              <div className="p-3 max-h-[50vh] overflow-y-auto">
                {allMessages.length === 0 ? (
                  <div className="text-center py-6 text-[#3D3D3D]">
                    <FaEnvelopeOpen className="text-2xl mx-auto mb-3 opacity-50" />
                    <p className="text-sm">אין הודעות עדיין</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {/* Unread Messages */}
                    {messages.unreadMessages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#D5C4B7]/30 border border-[#D5C4B7] rounded-lg p-3 shadow-sm group relative"
                      >
                        <button
                          onClick={() => handleDismissMessage(message.id)}
                          className="absolute top-2 left-2 text-[#3D3D3D]/30 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          title="מחק הודעה"
                        >
                          <FaTrashAlt className="text-[11px]" />
                        </button>
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-[#2D3142] text-sm">
                            {message.title}
                          </h3>
                          <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 mr-2">
                            חדש
                          </span>
                        </div>
                        
                        <p className="text-[#3D3D3D] text-xs leading-relaxed mb-2">
                          {message.content}
                        </p>
                        
                        {message.link && (
                          <a
                            href={message.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 bg-[#D5C4B7] hover:bg-[#B8A99C] text-[#2D3142] px-3 py-1.5 rounded-md transition-colors text-xs font-medium"
                          >
                            {message.linkText || "לחץ כאן"}
                            <FaExternalLinkAlt className="text-[10px]" />
                          </a>
                        )}

                        {/* Reply Section */}
                        {message.allowReply && (
                          <div className="mt-2 pt-2 border-t border-[#D5C4B7]/30">
                            {message.replies && message.replies.length > 0 ? (
                              <div className="bg-green-50 border border-green-200 rounded-md p-2">
                                <div className="flex items-center gap-1 mb-1">
                                  <FaCheck className="text-green-500 text-[10px]" />
                                  <span className="text-[10px] text-green-700 font-medium">התשובה שנשלחה:</span>
                                </div>
                                <p className="text-xs text-green-800">{message.replies[0].content}</p>
                              </div>
                            ) : replyingTo === message.id ? (
                              <div className="space-y-2">
                                <textarea
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder="כתוב תשובה לבועז..."
                                  rows={2}
                                  className="w-full px-3 py-2 border border-[#D5C4B7]/40 rounded-md text-xs resize-none focus:outline-none focus:ring-1 focus:ring-[#D5C4B7] bg-white text-[#2D3142]"
                                  style={{ direction: "rtl" }}
                                  autoFocus
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleSubmitReply(message.id)}
                                    disabled={isSendingReply || !replyText.trim()}
                                    className="bg-[#2D3142] hover:bg-[#4A4E69] disabled:opacity-50 text-white px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-colors"
                                  >
                                    {isSendingReply ? "שולח..." : <>שלח <FaReply className="text-[10px]" /></>}
                                  </button>
                                  <button
                                    onClick={() => { setReplyingTo(null); setReplyText(""); }}
                                    className="text-[#3D3D3D]/60 hover:text-[#3D3D3D] px-2 py-1 text-xs transition-colors"
                                  >
                                    ביטול
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setReplyingTo(message.id)}
                                className="flex items-center gap-1 text-[#2D3142] hover:text-[#4A4E69] text-xs font-medium transition-colors"
                              >
                                <FaReply className="text-[10px]" />
                                השב לבועז
                              </button>
                            )}
                          </div>
                        )}
                        
                        <div className="text-[10px] text-[#3D3D3D]/60 mt-2">
                          {formatDate(message.createdAt)}
                        </div>
                      </motion.div>
                    ))}

                    {/* Read Messages */}
                    {messages.readMessages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-[#D5C4B7]/30 rounded-lg p-3 shadow-sm opacity-70 group relative"
                      >
                        <button
                          onClick={() => handleDismissMessage(message.id)}
                          className="absolute top-2 left-2 text-[#3D3D3D]/20 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          title="מחק הודעה"
                        >
                          <FaTrashAlt className="text-[11px]" />
                        </button>
                        <h3 className="font-bold text-[#2D3142] text-sm mb-1">
                          {message.title}
                        </h3>
                        
                        <p className="text-[#3D3D3D] text-xs leading-relaxed mb-2">
                          {message.content}
                        </p>
                        
                        {message.link && (
                          <a
                            href={message.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 bg-[#D5C4B7]/50 hover:bg-[#D5C4B7] text-[#2D3142] px-3 py-1.5 rounded-md transition-colors text-xs font-medium"
                          >
                            {message.linkText || "לחץ כאן"}
                            <FaExternalLinkAlt className="text-[10px]" />
                          </a>
                        )}

                        {/* Reply Section for read messages */}
                        {message.allowReply && (
                          <div className="mt-2 pt-2 border-t border-[#D5C4B7]/20">
                            {message.replies && message.replies.length > 0 ? (
                              <div className="bg-green-50/70 border border-green-200/50 rounded-md p-2">
                                <div className="flex items-center gap-1 mb-1">
                                  <FaCheck className="text-green-400 text-[10px]" />
                                  <span className="text-[10px] text-green-600 font-medium">התשובה שנשלחה:</span>
                                </div>
                                <p className="text-xs text-green-700">{message.replies[0].content}</p>
                              </div>
                            ) : replyingTo === message.id ? (
                              <div className="space-y-2">
                                <textarea
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder="כתוב תשובה לבועז..."
                                  rows={2}
                                  className="w-full px-3 py-2 border border-[#D5C4B7]/40 rounded-md text-xs resize-none focus:outline-none focus:ring-1 focus:ring-[#D5C4B7] bg-white text-[#2D3142]"
                                  style={{ direction: "rtl" }}
                                  autoFocus
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleSubmitReply(message.id)}
                                    disabled={isSendingReply || !replyText.trim()}
                                    className="bg-[#2D3142] hover:bg-[#4A4E69] disabled:opacity-50 text-white px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-colors"
                                  >
                                    {isSendingReply ? "שולח..." : <>שלח <FaReply className="text-[10px]" /></>}
                                  </button>
                                  <button
                                    onClick={() => { setReplyingTo(null); setReplyText(""); }}
                                    className="text-[#3D3D3D]/60 hover:text-[#3D3D3D] px-2 py-1 text-xs transition-colors"
                                  >
                                    ביטול
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setReplyingTo(message.id)}
                                className="flex items-center gap-1 text-[#2D3142]/60 hover:text-[#2D3142] text-xs font-medium transition-colors"
                              >
                                <FaReply className="text-[10px]" />
                                השב לבועז
                              </button>
                            )}
                          </div>
                        )}
                        
                        <div className="text-[10px] text-[#3D3D3D]/60 mt-2">
                          {formatDate(message.createdAt)}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default UserMessageNotification;
