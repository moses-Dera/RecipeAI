"use client";

import { ReactNode, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  maxWidth?: string; // e.g., "max-w-md", "max-w-4xl"
}

export function Modal({ isOpen, onClose, children, title, maxWidth = "max-w-md" }: ModalProps) {
  
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Prevent background scrolling
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`relative w-full ${maxWidth} bg-bg-surface border border-text-secondary/10 shadow-2xl rounded-3xl overflow-hidden`}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-text-secondary/10">
              {title ? (
                <h3 className="font-heading font-bold text-xl text-text-primary">{title}</h3>
              ) : (
                <div /> // Spacer
              )}
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-text-secondary/10 transition-colors text-text-secondary hover:text-text-primary"
              >
                <FiX className="text-xl" />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
              {children}
            </div>
            
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
