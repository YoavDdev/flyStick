"use client";

import React, { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const STORAGE_KEY = "flystick_chat";
const SESSION_TTL = 24 * 60 * 60 * 1000; // 24 hours

const loadSession = (): { messages: Message[]; isOpen: boolean } => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { messages: [], isOpen: false };
    const data = JSON.parse(raw);
    if (Date.now() - data.ts > SESSION_TTL) {
      localStorage.removeItem(STORAGE_KEY);
      return { messages: [], isOpen: false };
    }
    return { messages: data.messages || [], isOpen: data.isOpen || false };
  } catch {
    return { messages: [], isOpen: false };
  }
};

const saveSession = (messages: Message[], isOpen: boolean) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, isOpen, ts: Date.now() }));
  } catch {}
};

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [initialized, setInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load persisted session on mount
  useEffect(() => {
    const session = loadSession();
    setMessages(session.messages);
    setIsOpen(session.isOpen);
    setInitialized(true);
  }, []);

  // Persist messages & open state whenever they change
  useEffect(() => {
    if (initialized) saveSession(messages, isOpen);
  }, [messages, isOpen, initialized]);

  // Check if AI chat is enabled
  useEffect(() => {
    const checkEnabled = async () => {
      try {
        const res = await fetch("/api/admin/ai-settings");
        const data = await res.json();
        setEnabled(data.success ? data.enabled : true);
      } catch {
        setEnabled(true); // Default to enabled on error
      }
    };
    checkEnabled();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const clearConversation = () => {
    setMessages([]);
    saveSession([], isOpen);
  };

  // Don't render if disabled or still loading setting
  if (enabled === null || enabled === false) return null;

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMessage: Message = { role: "user", content: trimmed };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();
      if (data.success) {
        setMessages([...newMessages, { role: "assistant", content: data.message }]);
      } else {
        setMessages([
          ...newMessages,
          { role: "assistant", content: "מצטער, משהו השתבש. נסו שוב." },
        ]);
      }
    } catch {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "שגיאה בחיבור. נסו שוב מאוחר יותר." },
      ]);
    } finally {
      setLoading(false);
      // Keep focus in input field for continuous conversation
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Format message content - handle markdown links, bold text, and line breaks
  const formatMessage = (content: string) => {
    // Split by lines first
    return content.split("\n").map((line, lineIdx) => (
      <React.Fragment key={lineIdx}>
        {lineIdx > 0 && <br />}
        {formatLine(line)}
      </React.Fragment>
    ));
  };

  // Strip any domain GPT might add and return only the path
  const sanitizeHref = (raw: string): string => {
    let href = raw;
    // Strip full URLs: https://www.example.com/path → /path
    try {
      if (href.match(/^https?:\/\//)) {
        const url = new URL(href);
        href = url.pathname + url.search + url.hash;
      }
    } catch {}
    // Ensure leading /
    if (!href.startsWith("/") && !href.startsWith("#")) {
      href = "/" + href;
    }
    // Handle /explore?video= links — normalize encoding
    const exploreMatch = href.match(/^\/?explore\?video=(.+)$/);
    if (exploreMatch) {
      const searchTerm = decodeURIComponent(exploreMatch[1]);
      return `/explore?video=${encodeURIComponent(searchTerm)}`;
    }
    // Handle /styles/ links
    if (href.startsWith("/styles/")) {
      return `/styles/${encodeURIComponent(decodeURIComponent(href.replace("/styles/", "")))}`;
    }
    return href;
  };

  const formatLine = (line: string) => {
    // Match markdown links [text](url) and bold **text**
    const regex = /(\[.*?\]\(.*?\)|\*\*.*?\*\*)/g;
    const parts = line.split(regex);

    return parts.map((part, i) => {
      // Markdown link: [text](/path)
      const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
      if (linkMatch) {
        const text = linkMatch[1];
        const href = linkMatch[2];
        const encodedHref = sanitizeHref(href);
        return (
          <a
            key={i}
            href={encodedHref}
            className="font-bold text-[#8B6F5E] underline decoration-[#D5C4B7] hover:text-[#6B4F3E] transition-colors"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {text}
          </a>
        );
      }
      // Bold text: **text**
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-bold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <React.Fragment key={i}>{part}</React.Fragment>;
    });
  };

  return (
    <>
      {/* Chat toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-5 right-5 z-[55] w-14 h-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
          isOpen
            ? "bg-[#2D3142] hover:bg-[#3d4152] rotate-0"
            : "bg-[#2D3142] hover:bg-[#3d4152] hover:scale-105"
        }`}
        aria-label={isOpen ? "סגור צ׳אט" : "פתח צ׳אט עוזר"}
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-5 z-[55] w-[340px] sm:w-[380px] h-[480px] bg-white border-2 border-[#2D3142] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          dir="rtl"
        >
          {/* Header */}
          <div className="bg-[#2D3142] px-4 py-3 flex items-center gap-3 flex-shrink-0 border-b-2 border-[#2D3142]">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-sm">העוזר של סטודיו בועז</h3>
              <p className="text-white/70 text-xs">מצא שיעורים ותרגילים</p>
            </div>
            {messages.length > 0 && (
              <button
                onClick={clearConversation}
                className="text-white/60 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10"
                title="שיחה חדשה"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {/* Welcome message */}
            {messages.length === 0 && (
              <div className="text-center py-6">
                <div className="w-14 h-14 bg-[#F7F3EB] rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-7 h-7 text-[#B8A99C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                </div>
                <p className="text-[#2D3142] font-medium text-sm mb-1">
                  שלום! איך אוכל לעזור?
                </p>
                <p className="text-[#5D5D5D] text-xs leading-relaxed">
                  אני יכול לעזור לך למצוא שיעורים, להמליץ על תרגילים ולענות על שאלות
                </p>
                {/* Quick suggestions */}
                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  {[
                    "שיעור למתחילים",
                    "תרגילים לגב",
                    "שיעור קצר",
                    "פלייסטיק",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setInput(suggestion);
                        setTimeout(() => {
                          const userMsg: Message = { role: "user", content: suggestion };
                          setMessages([userMsg]);
                          setLoading(true);
                          fetch("/api/chat", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ messages: [userMsg] }),
                          })
                            .then((r) => r.json())
                            .then((data) => {
                              if (data.success) {
                                setMessages([userMsg, { role: "assistant", content: data.message }]);
                              }
                            })
                            .catch(() => {})
                            .finally(() => setLoading(false));
                          setInput("");
                        }, 0);
                      }}
                      className="text-xs bg-[#F7F3EB] hover:bg-[#E6DEDA] text-[#2D3142] px-3 py-1.5 rounded-full border border-[#D5C4B7]/40 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat messages */}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#D5C4B7]/20 text-[#2D3142] rounded-tr-sm"
                      : "bg-[#F7F3EB] text-[#2D3142] border border-[#D5C4B7]/20 rounded-tl-sm"
                  }`}
                >
                  {formatMessage(msg.content)}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="flex justify-end">
                <div className="bg-[#F7F3EB] border border-[#D5C4B7]/20 px-4 py-3 rounded-2xl rounded-tl-sm">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-[#B8A99C] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-[#B8A99C] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-[#B8A99C] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-[#D5C4B7]/30 p-3 flex-shrink-0 bg-white">
            <div className="flex gap-2 items-center">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="שאלו אותי משהו..."
                className="flex-1 bg-[#F7F3EB] border border-[#D5C4B7]/40 rounded-full px-4 py-2.5 text-sm text-[#2D3142] placeholder-[#B8A99C] focus:outline-none focus:border-[#B8A99C] transition-colors"
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="w-10 h-10 bg-gradient-to-br from-[#D5C4B7] to-[#B8A99C] hover:from-[#c4b3a6] hover:to-[#a7988b] text-white rounded-full flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12l14-7-4 7 4 7L5 12zm0 0h9" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
