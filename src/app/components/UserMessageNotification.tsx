"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaEnvelope, FaEnvelopeOpen, FaTimes, FaExternalLinkAlt } from "react-icons/fa";
import { useSession } from "next-auth/react";

interface Message {
  id: string;
  title: string;
  content: string;
  link?: string;
  linkText?: string;
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
        className={`relative p-2 rounded-full bg-[#F7F3EB] hover:bg-[#D5C4B7] transition-colors duration-200 ${className}`}
        whileHover={{ scale: 1.05 }}
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
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10002] p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#F7F3EB] rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-[#D5C4B7] p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <FaEnvelope className="text-[#2D3142] text-xl" />
                  <h2 className="text-xl font-bold text-[#2D3142]">
                    הודעות מבועז
                  </h2>
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-sm px-2 py-1 rounded-full">
                      {unreadCount} חדשות
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <motion.button
                      onClick={markAllAsRead}
                      disabled={isLoading}
                      className="text-sm bg-[#B8A99C] hover:bg-[#A09080] disabled:bg-[#B8A99C]/50 text-white px-3 py-1 rounded-md transition-colors"
                      whileHover={{ y: -1 }}
                      whileTap={{ y: 0 }}
                    >
                      {isLoading ? "מסמן..." : "סמן הכל כנקרא"}
                    </motion.button>
                  )}
                  
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-[#2D3142] hover:text-[#1A1D2E] transition-colors"
                  >
                    <FaTimes className="text-lg" />
                  </button>
                </div>
              </div>

              {/* Messages List */}
              <div className="p-4 max-h-[60vh] overflow-y-auto">
                {allMessages.length === 0 ? (
                  <div className="text-center py-8 text-[#3D3D3D]">
                    <FaEnvelopeOpen className="text-4xl mx-auto mb-4 opacity-50" />
                    <p>אין הודעות עדיין</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Unread Messages */}
                    {messages.unreadMessages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#D5C4B7]/30 border border-[#D5C4B7] rounded-lg p-4 shadow-sm"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-[#2D3142] text-lg">
                            {message.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                              חדש
                            </span>
                            <button
                              onClick={() => markAsRead(message.id)}
                              className="text-[#3D3D3D] hover:text-[#2D3142] text-sm"
                            >
                              סמן כנקרא
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-[#3D3D3D] mb-3 leading-relaxed">
                          {message.content}
                        </p>
                        
                        {message.link && (
                          <a
                            href={message.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-[#D5C4B7] hover:bg-[#B8A99C] text-[#2D3142] px-4 py-2 rounded-md transition-colors text-sm font-medium"
                          >
                            {message.linkText || "לחץ כאן"}
                            <FaExternalLinkAlt className="text-xs" />
                          </a>
                        )}
                        
                        <div className="text-xs text-[#3D3D3D]/70 mt-3">
                          {formatDate(message.createdAt)}
                        </div>
                      </motion.div>
                    ))}

                    {/* Read Messages */}
                    {messages.readMessages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-[#D5C4B7]/30 rounded-lg p-4 shadow-sm opacity-75"
                      >
                        <h3 className="font-bold text-[#2D3142] text-lg mb-2">
                          {message.title}
                        </h3>
                        
                        <p className="text-[#3D3D3D] mb-3 leading-relaxed">
                          {message.content}
                        </p>
                        
                        {message.link && (
                          <a
                            href={message.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-[#D5C4B7]/50 hover:bg-[#D5C4B7] text-[#2D3142] px-4 py-2 rounded-md transition-colors text-sm font-medium"
                          >
                            {message.linkText || "לחץ כאן"}
                            <FaExternalLinkAlt className="text-xs" />
                          </a>
                        )}
                        
                        <div className="text-xs text-[#3D3D3D]/70 mt-3">
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
