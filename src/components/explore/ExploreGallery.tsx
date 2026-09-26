"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiClock, FiMapPin } from "react-icons/fi";
import Image from "next/image";
import Link from "next/link";
import type { Recipe } from "@prisma/client";

interface ExploreGalleryProps {
  initialRecipes: Recipe[];
}

const REGIONS = ["All", "West Africa", "Northern Nigeria", "South East", "South South", "South West"];

export default function ExploreGallery({ initialRecipes }: ExploreGalleryProps) {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("query") || "");
  const [activeRegion, setActiveRegion] = useState("All");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter recipes based on search query and active region
  const filteredRecipes = useMemo(() => {
    return initialRecipes.filter((recipe) => {
      const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            recipe.ingredients.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRegion = activeRegion === "All" || recipe.region === activeRegion;

      return matchesSearch && matchesRegion;
    });
  }, [initialRecipes, searchQuery, activeRegion]);

  return (
    <div className="w-full">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
        <div>
          <h1 className="text-5xl md:text-6xl font-heading font-bold text-text-primary mb-4">
            Explore <span className="text-brand-primary italic">Recipes</span>
          </h1>
          <p className="text-text-secondary text-lg max-w-xl">
            Discover our collection of authentic, flavorful dishes. Search by name, ingredient, or filter by region.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row w-full lg:w-auto shrink-0 gap-4">
          {/* Search Bar */}
          <div className="relative w-full sm:w-72 xl:w-96">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-secondary">
              <FiSearch size={20} />
            </div>
            <input
              type="text"
              placeholder="Search recipes or ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-bg-surface border border-text-secondary/10 rounded-2xl text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all shadow-sm font-medium"
            />
          </div>

          {/* Region Filter Dropdown (Custom) */}
          <div className="relative w-full sm:w-56" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full pl-11 pr-10 py-3.5 flex justify-between items-center bg-bg-surface border border-text-secondary/10 rounded-2xl text-text-primary hover:border-brand-primary/30 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all shadow-sm font-medium cursor-pointer"
            >
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-secondary">
                <FiMapPin size={20} />
              </div>
              <span className="truncate">{activeRegion === "All" ? "All Regions" : activeRegion}</span>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-text-secondary">
                <svg className={`transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute z-50 w-full mt-2 bg-bg-surface border border-text-secondary/10 rounded-2xl shadow-xl overflow-hidden py-2"
                >
                  {REGIONS.map((region) => (
                    <button
                      key={region}
                      onClick={() => {
                        setActiveRegion(region);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${
                        activeRegion === region 
                          ? "bg-brand-primary/10 text-brand-primary" 
                          : "text-text-primary hover:bg-text-secondary/5"
                      }`}
                    >
                      {region === "All" ? "All Regions" : region}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredRecipes.map((recipe) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              key={recipe.recipe_id}
            >
              <Link
                href={`/recipe/${recipe.recipe_id}`}
                className="group cursor-pointer bg-bg-surface rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full border border-text-secondary/5 block"
              >
                <div className="relative w-full aspect-[4/3] overflow-hidden">
                  <Image
                    src={recipe.image_url || "/images/placeholder-1.jpg"}
                    alt={recipe.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                </div>
                
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-heading text-xl font-bold text-text-primary mb-3 group-hover:text-brand-primary transition-colors line-clamp-2 break-words">
                    {recipe.title}
                  </h3>
                  
                  <div className="mt-auto pt-4 flex gap-3 text-text-secondary text-sm font-bold border-t border-text-secondary/10">
                    <span className="flex items-center gap-1.5 bg-bg-primary px-3 py-1.5 rounded-full">
                      <FiClock /> {recipe.prep_time_min ? `${recipe.prep_time_min}m` : 'N/A'}
                    </span>
                    {recipe.region && (
                      <span className="flex items-center gap-1.5 bg-bg-primary px-3 py-1.5 rounded-full truncate">
                        <FiMapPin /> {recipe.region}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredRecipes.length === 0 && (
        <div className="w-full py-20 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center mb-6">
            <FiSearch size={32} />
          </div>
          <h3 className="text-2xl font-heading font-bold text-text-primary mb-2">No recipes found</h3>
          <p className="text-text-secondary">Try adjusting your search or filters to find what you&apos;re looking for.</p>
        </div>
      )}
    </div>
  );
}
