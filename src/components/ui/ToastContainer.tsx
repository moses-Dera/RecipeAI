"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FiCheckCircle, FiAlertCircle, FiInfo } from "react-icons/fi";
import { Toast } from "./ToastContext";

export function ToastContainer({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="pointer-events-auto flex items-center gap-3 px-6 py-4 rounded-xl shadow-xl shadow-black/10 backdrop-blur-md border bg-white/90 dark:bg-slate-900/90 min-w-[300px]"
          >
            {toast.type === "success" && <FiCheckCircle className="text-green-500 text-xl flex-shrink-0" />}
            {toast.type === "error" && <FiAlertCircle className="text-red-500 text-xl flex-shrink-0" />}
            {toast.type === "info" && <FiInfo className="text-blue-500 text-xl flex-shrink-0" />}
            
            <p className="font-medium text-text-primary text-sm">{toast.message}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
