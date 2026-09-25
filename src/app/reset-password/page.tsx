"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FiLock, FiCheckCircle } from "react-icons/fi";
import { Navbar } from "@/components/layout/Navbar";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  if (!token) {
    return (
      <div className="bg-bg-surface p-8 rounded-3xl border border-text-secondary/10 shadow-xl text-center">
        <h1 className="font-heading text-2xl font-bold text-red-500 mb-4">Invalid Reset Link</h1>
        <p className="text-text-secondary mb-6">
          This password reset link is invalid or missing the required token.
        </p>
        <Link href="/forgot-password" className="text-brand-primary font-bold hover:underline">
          Request a new link
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      setStatus("error");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword })
      });

      if (res.ok) {
        setStatus("success");
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed to reset password");
      }
    } catch (err: any) {
      setErrorMsg(err.message);
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="bg-bg-surface p-8 rounded-3xl border border-text-secondary/10 shadow-xl text-center">
        <FiCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="font-heading text-2xl font-bold text-text-primary mb-2">Password Reset Successful!</h1>
        <p className="text-text-secondary mb-8">
          Your password has been successfully updated. You can now log in with your new password.
        </p>
        <Link href="/api/auth/signin" className="bg-brand-primary text-white font-bold px-8 py-4 rounded-xl hover:bg-brand-secondary transition-colors inline-block w-full">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-bg-surface p-8 rounded-3xl border border-text-secondary/10 shadow-xl">
      <h1 className="font-heading text-3xl font-bold text-text-primary mb-2">Create New Password</h1>
      <p className="text-text-secondary mb-8 leading-relaxed">
        Please enter your new password below.
      </p>

      {status === "error" && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-6 text-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-bold text-text-secondary">New Password</label>
          <div className="relative">
            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-bg-primary border border-text-secondary/20 rounded-xl py-3 pl-12 pr-4 text-text-primary focus:outline-none focus:border-brand-primary transition-colors"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-text-secondary">Confirm New Password</label>
          <div className="relative">
            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-bg-primary border border-text-secondary/20 rounded-xl py-3 pl-12 pr-4 text-text-primary focus:outline-none focus:border-brand-primary transition-colors"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full bg-brand-primary text-white font-bold rounded-xl py-4 hover:bg-brand-secondary transition-colors disabled:opacity-50"
        >
          {status === "loading" ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Suspense fallback={<div className="text-center p-8">Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
