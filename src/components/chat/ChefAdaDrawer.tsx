"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiSend, FiLoader } from "react-icons/fi";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";

interface ChefAdaDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChefAdaDrawer({ isOpen, onClose }: ChefAdaDrawerProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: "assistant", content: "Hello! I'm Chef Ada. What are we cooking today?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const sessionIdRef = useRef(`session_${Math.random().toString(36).substring(2, 9)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

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
          // Only send history if we are a guest, since the backend handles it for auth users
          ...(!session?.user && { ephemeral_history: messages.slice(1) }) // Skip the initial greeting
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch response");
      }

      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: data.message || "I'm having trouble connecting right now." 
      }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Oops, something went wrong connecting to my brain. Please try again later." 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full md:w-[400px] bg-bg-surface z-50 shadow-2xl flex flex-col border-l border-text-secondary/10"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-text-secondary/10 bg-bg-primary">
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-brand-primary">
                  <Image
                    src="/images/chef_ada_avatar.jpg"
                    alt="Chef Ada"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-xl text-text-primary">Chef Ada</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-xs text-text-secondary font-bold uppercase tracking-wider">Online</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-text-secondary/10 text-text-secondary transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-bg-surface custom-scrollbar">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div 
                    className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                      msg.role === "user" 
                        ? "bg-brand-primary text-white rounded-br-none" 
                        : "bg-bg-primary text-text-primary border border-text-secondary/10 rounded-bl-none whitespace-pre-wrap"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.content}</p>
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
            <div className="p-4 bg-bg-primary border-t border-text-secondary/10">
              <form onSubmit={handleSend} className="relative">
                <input
                  type="text"
                  placeholder="Ask about recipes, ingredients..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full bg-bg-surface border border-text-secondary/20 rounded-full pl-6 pr-12 py-4 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all shadow-inner"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-primary text-white rounded-full hover:bg-brand-primary/90 disabled:opacity-50 disabled:hover:bg-brand-primary transition-colors flex items-center justify-center w-8 h-8"
                >
                  {isTyping ? <FiLoader className="animate-spin" size={16} /> : <FiSend size={16} />}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
