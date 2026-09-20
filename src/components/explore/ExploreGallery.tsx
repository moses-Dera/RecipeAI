"use client";

import { useState, useMemo } from "react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [activeRegion, setActiveRegion] = useState("All");

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
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <h1 className="text-5xl md:text-6xl font-heading font-bold text-text-primary mb-4">
            Explore <span className="text-brand-primary italic">Recipes</span>
          </h1>
          <p className="text-text-secondary text-lg max-w-xl">
            Discover our collection of authentic, flavorful dishes. Search by name, ingredient, or region.
          </p>
        </div>
        
        <div className="relative w-full md:w-96 shrink-0">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-secondary">
            <FiSearch size={20} />
          </div>
          <input
            type="text"
            placeholder="Search recipes or ingredients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-bg-surface border border-text-secondary/10 rounded-2xl text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-3 mb-12">
        {REGIONS.map((region) => (
          <button
            key={region}
            onClick={() => setActiveRegion(region)}
            className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-300 ${
              activeRegion === region 
                ? "bg-brand-primary text-white shadow-md" 
                : "bg-bg-surface text-text-secondary hover:bg-brand-primary/10 hover:text-brand-primary border border-text-secondary/10"
            }`}
          >
            {region}
          </button>
        ))}
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
          <p className="text-text-secondary">Try adjusting your search or filters to find what you're looking for.</p>
        </div>
      )}
    </div>
  );
}
