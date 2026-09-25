"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FiSearch, FiLoader } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export function NavbarSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/recipes/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
        }
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      setShowDropdown(false);
      router.push(`/explore?query=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="relative flex-1" ref={dropdownRef}>
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
        <input 
          type="text" 
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search recipes, ingredients..." 
          className="w-full bg-bg-primary border border-text-secondary/20 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-brand-primary transition-colors text-text-primary"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <FiLoader className="animate-spin text-brand-primary" />
          </div>
        )}
      </div>

      <AnimatePresence>
        {showDropdown && query.trim().length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full mt-2 w-full bg-bg-surface border border-text-secondary/10 rounded-2xl shadow-xl overflow-hidden z-50 max-h-[400px] overflow-y-auto"
          >
            {results.length > 0 ? (
              <div className="py-2">
                {results.map((recipe) => (
                  <Link
                    key={recipe.recipe_id}
                    href={`/recipe/${recipe.recipe_id}`}
                    onClick={() => {
                      setShowDropdown(false);
                      setQuery("");
                    }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-text-secondary/5 transition-colors group"
                  >
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-text-secondary/10">
                      {recipe.image_url ? (
                        <Image 
                          src={recipe.image_url} 
                          alt={recipe.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-secondary text-xs">No img</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-text-primary truncate group-hover:text-brand-primary transition-colors">
                        {recipe.title}
                      </h4>
                      <p className="text-xs text-text-secondary mt-1">
                        {recipe.prep_time_min} mins • {recipe.difficulty}
                      </p>
                    </div>
                  </Link>
                ))}
                
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    router.push(`/explore?query=${encodeURIComponent(query)}`);
                  }}
                  className="w-full text-center py-3 text-sm text-brand-primary font-bold hover:bg-brand-primary/5 transition-colors border-t border-text-secondary/10 mt-1"
                >
                  View all results
                </button>
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-text-secondary">
                {isSearching ? "Searching..." : "No recipes found matching your query."}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
