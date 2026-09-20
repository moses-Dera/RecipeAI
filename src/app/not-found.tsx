"use client";

import Link from "next/link";
import { FiSearch } from "react-icons/fi";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-default px-4">
      <div className="max-w-lg w-full bg-bg-surface p-10 rounded-3xl shadow-xl text-center border border-text-secondary/10">
        <h1 className="font-heading text-8xl font-black text-brand-primary/20 mb-2">404</h1>
        <h2 className="font-heading text-3xl font-bold text-text-primary mb-4">
          Recipe Not Found
        </h2>
        <p className="text-text-secondary mb-8">
          It looks like this page has gone missing, or perhaps the recipe was kept a secret! Don't worry, there's plenty more to discover.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/explore"
            className="px-6 py-3 flex items-center justify-center gap-2 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-secondary transition-colors"
          >
            <FiSearch className="text-lg" />
            Explore Recipes
          </Link>
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
