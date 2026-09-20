"use client";

import { useEffect } from "react";
import Link from "next/link";
import { FiAlertTriangle } from "react-icons/fi";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-default px-4">
      <div className="max-w-md w-full bg-bg-surface p-8 rounded-3xl shadow-xl text-center border border-text-secondary/10">
        <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
          <FiAlertTriangle />
        </div>
        <h1 className="font-heading text-3xl font-bold text-text-primary mb-4">
          Something went wrong
        </h1>
        <p className="text-text-secondary mb-8">
          We apologize for the inconvenience. Chef Ada has encountered a technical issue while preparing this page.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-secondary transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-bg-default border border-text-secondary/20 text-text-primary rounded-xl font-bold hover:border-brand-primary hover:text-brand-primary transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
