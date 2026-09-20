"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/ToastContext";
import { motion, AnimatePresence } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { FiMail, FiLock, FiUser } from "react-icons/fi";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const result = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });

        if (result?.error) {
          toast.error("Invalid email or password");
        } else {
          toast.success("Successfully logged in!");
          onClose();
        }
      } else {
        if (password !== confirmPassword) {
          toast.error("Passwords do not match");
          return;
        }

        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, username, confirmPassword }),
        });

        if (res.ok) {
          toast.success("Account created! Please sign in.");
          setIsLogin(true);
        } else {
          const data = await res.json();
          toast.error(data.error || "Failed to create account");
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md" title={isLogin ? "Welcome Back" : "Join RecipeAI"}>
      
      {/* Toggle */}
      <div className="flex p-1 bg-text-secondary/10 rounded-xl mb-6 relative">
        <button
          onClick={() => setIsLogin(true)}
          className={`flex-1 py-2 text-sm font-bold z-10 transition-colors ${isLogin ? "text-text-primary" : "text-text-secondary"}`}
        >
          Sign In
        </button>
        <button
          onClick={() => setIsLogin(false)}
          className={`flex-1 py-2 text-sm font-bold z-10 transition-colors ${!isLogin ? "text-text-primary" : "text-text-secondary"}`}
        >
          Create Account
        </button>
        {/* Animated Highlight */}
        <motion.div 
          className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-bg-surface rounded-lg shadow-sm"
          animate={{ left: isLogin ? "4px" : "calc(50%)" }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <AnimatePresence mode="popLayout">
          {!isLogin && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-transparent border border-text-secondary/20 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-brand-primary transition-colors text-text-primary"
                  required={!isLogin}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative">
          <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-transparent border border-text-secondary/20 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-brand-primary transition-colors text-text-primary"
            required
          />
        </div>

        <div className="relative">
          <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-transparent border border-text-secondary/20 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-brand-primary transition-colors text-text-primary"
            required
          />
        </div>

        <AnimatePresence>
          {!isLogin && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="relative pt-4">
                <FiLock className="absolute left-4 top-1/2 translate-y-[-10%] text-text-secondary" />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-transparent border border-text-secondary/20 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-brand-primary transition-colors text-text-primary"
                  required={!isLogin}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-brand-primary text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity mt-2"
        >
          {isLoading ? "Please wait..." : (isLogin ? "Sign In" : "Create Account")}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-text-secondary/20" />
        <span className="text-xs text-text-secondary font-medium">OR CONTINUE WITH</span>
        <div className="flex-1 h-px bg-text-secondary/20" />
      </div>

      {/* Social Auth */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        className="w-full flex items-center justify-center gap-3 bg-bg-surface border border-text-secondary/20 text-text-primary font-bold py-3 rounded-xl hover:bg-text-secondary/5 transition-colors"
      >
        <FcGoogle className="text-xl" />
        Google
      </button>

    </Modal>
  );
}
