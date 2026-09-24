"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiSend, FiLoader } from "react-icons/fi";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChefAdaDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChefAdaDrawer({ isOpen, onClose }: ChefAdaDrawerProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const sessionIdRef = useRef<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize session and history
  useEffect(() => {
    const initializeChat = async () => {
      // 1. Get or create sessionId
      let storedSessionId = localStorage.getItem("recipe_ai_session_id");
      if (!storedSessionId) {
        storedSessionId = `session_${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem("recipe_ai_session_id", storedSessionId);
      }
      sessionIdRef.current = storedSessionId;

      const initialGreeting = { role: "assistant", content: "Hello! I'm Chef Ada. What are we cooking today?" };

      // 2. Fetch history from backend (works universally now for guests and auth)
      try {
        const res = await fetch(`/api/chat?sessionId=${storedSessionId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.history && data.history.length > 0) {
            setMessages(data.history.map((h: any) => ({ role: h.role, content: h.message })));
          } else {
            setMessages([initialGreeting]);
          }
        } else {
          setMessages([initialGreeting]);
        }
      } catch (error) {
        setMessages([initialGreeting]);
      }
      setIsInitialized(true);
    };

    initializeChat();
  }, [session?.user]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isScrolledUp = useRef(false);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    // If the user has scrolled up more than 100px from the bottom, mark as scrolled up
    isScrolledUp.current = scrollHeight - scrollTop - clientHeight > 100;
  };

  // Auto-scroll to bottom only if not manually scrolled up
  useEffect(() => {
    if (!isScrolledUp.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [messages, isTyping]);

  // Prevent body scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping || !sessionIdRef.current) return;

    const userMessage = input.trim();
    const newHistory = [...messages, { role: "user", content: userMessage }];
    setMessages(newHistory);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          session_id: sessionIdRef.current,
          context: {
            currentPath: window.location.pathname,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch response");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");
      
      const decoder = new TextDecoder();
      let done = false;

      // Add empty assistant message to start appending to
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);
      setIsTyping(false); // Disable typing indicator as we start streaming

      let accumulatedText = "";
      let lastUpdateTime = Date.now();

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const textChunk = decoder.decode(value, { stream: true });
          accumulatedText += textChunk;

          const now = Date.now();
          if (now - lastUpdateTime > 50 || done) {
            const currentAccumulated = accumulatedText;
            accumulatedText = "";
            lastUpdateTime = now;

            setMessages(prev => {
              const last = prev[prev.length - 1];
              return [
                ...prev.slice(0, -1),
                { ...last, content: last.content + currentAccumulated }
              ];
            });
          }
        }
      }

      // Final flush just in case
      if (accumulatedText) {
        setMessages(prev => {
          const last = prev[prev.length - 1];
          return [
            ...prev.slice(0, -1),
            { ...last, content: last.content + accumulatedText }
          ];
        });
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Oops, something went wrong connecting to my brain. Please try again later." 
      }]);
      setIsTyping(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 bottom-0 right-0 md:top-auto md:bottom-4 md:right-4 h-[100dvh] md:h-[600px] w-[90vw] sm:w-[400px] md:w-[380px] bg-bg-surface z-50 shadow-2xl flex flex-col md:rounded-2xl border-l md:border border-text-secondary/10 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-text-secondary/10 bg-bg-primary">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-brand-primary">
                  <Image
                    src="/images/chef_ada_avatar.jpg"
                    alt="Chef Ada"
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-text-primary">Chef Ada</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Online</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-text-secondary/10 text-text-secondary transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Chat Area */}
            <div 
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-bg-surface custom-scrollbar"
            >
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div 
                    className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${
                      msg.role === "user" 
                        ? "bg-brand-primary text-white rounded-br-none" 
                        : "bg-bg-primary text-text-primary border border-text-secondary/10 rounded-bl-none prose prose-sm prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0.5 prose-strong:text-text-primary prose-a:text-brand-primary break-words max-w-full"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    ) : (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-bg-primary border border-text-secondary/10 rounded-2xl rounded-bl-none p-4 shadow-sm">
                    <div className="flex gap-1.5 items-center h-5">
                      <motion.div className="w-2 h-2 rounded-full bg-brand-primary/50" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                      <motion.div className="w-2 h-2 rounded-full bg-brand-primary/50" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
                      <motion.div className="w-2 h-2 rounded-full bg-brand-primary/50" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-bg-primary border-t border-text-secondary/10">
              <form onSubmit={handleSend} className="relative">
                <input
                  type="text"
                  placeholder="Ask about recipes..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full bg-bg-surface border border-text-secondary/20 rounded-full pl-4 pr-10 py-3 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all shadow-inner"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-brand-primary text-white rounded-full hover:bg-brand-primary/90 disabled:opacity-50 disabled:hover:bg-brand-primary transition-colors flex items-center justify-center w-8 h-8"
                >
                  {isTyping ? <FiLoader className="animate-spin" size={14} /> : <FiSend size={14} />}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
