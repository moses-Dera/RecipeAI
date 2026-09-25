"use client";

import { useState } from "react";
import Link from "next/link";
import { FiMail, FiArrowLeft, FiCheckCircle } from "react-icons/fi";
import { Navbar } from "@/components/layout/Navbar";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      if (res.ok) {
        setStatus("success");
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed to send reset link");
      }
    } catch (err: any) {
      setErrorMsg(err.message);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Link href="/api/auth/signin" className="inline-flex items-center text-text-secondary hover:text-brand-primary mb-6 transition-colors">
            <FiArrowLeft className="mr-2" /> Back to Login
          </Link>

          <div className="bg-bg-surface p-8 rounded-3xl border border-text-secondary/10 shadow-xl">
            <h1 className="font-heading text-3xl font-bold text-text-primary mb-2">Forgot Password</h1>
            
            {status === "success" ? (
              <div className="text-center py-6">
                <FiCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-text-primary mb-2">Check your email</h3>
                <p className="text-text-secondary">
                  If an account exists for {email}, you will receive a password reset link shortly.
                </p>
              </div>
            ) : (
              <>
                <p className="text-text-secondary mb-8 leading-relaxed">
                  Enter the email address associated with your account and we'll send you a link to reset your password.
                </p>

                {status === "error" && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-6 text-sm">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-text-secondary">Email Address</label>
                    <div className="relative">
                      <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-bg-primary border border-text-secondary/20 rounded-xl py-3 pl-12 pr-4 text-text-primary focus:outline-none focus:border-brand-primary transition-colors"
                        placeholder="chef@recipeai.com"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full bg-brand-primary text-white font-bold rounded-xl py-4 hover:bg-brand-secondary transition-colors disabled:opacity-50"
                  >
                    {status === "loading" ? "Sending..." : "Send Reset Link"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
