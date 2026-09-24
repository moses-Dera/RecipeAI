"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import type { Recipe } from "@prisma/client";

export default function TrendingGrid({ initialRecipes }: { initialRecipes: Recipe[] }) {
  const [hoveredRecipe, setHoveredRecipe] = useState<Recipe>(initialRecipes[0] || null);

  if (!initialRecipes || initialRecipes.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-8 md:py-12 relative">
      <div className="flex justify-between items-end mb-12 lg:mb-20">
        <div>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold text-text-primary tracking-tight">
            Trending <span className="text-brand-primary italic">Now</span>
          </h2>
        </div>
        <Link 
          href="/explore"
          className="hidden md:flex items-center gap-2 font-bold text-lg text-text-secondary hover:text-brand-primary transition-colors group"
        >
          Explore All 
          <FiArrowRight className="group-hover:translate-x-2 transition-transform" />
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
        {/* Left: Recipe List */}
        <div className="w-full lg:w-3/5 flex flex-col">
          {initialRecipes.map((recipe, index) => (
            <motion.div
              key={recipe.recipe_id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              onMouseEnter={() => setHoveredRecipe(recipe)}
              className="group border-b border-text-secondary/10 py-6 md:py-8 transition-colors hover:bg-brand-primary/5 -mx-4 px-4 md:-mx-8 md:px-8 rounded-2xl"
            >
              <Link
                href={`/recipe/${recipe.recipe_id}`}
                className="flex flex-col md:flex-row md:items-center justify-between cursor-pointer"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                  <div className="flex items-center gap-4">
                    <span className="text-lg md:text-xl font-bold text-brand-primary/40 font-mono w-6">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    
                    {/* Mobile Image (Hidden on Desktop) */}
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden lg:hidden shrink-0">
                      <Image
                        src={recipe.image_url || "/images/placeholder-1.jpg"}
                        alt={recipe.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <h3 className="text-xl md:text-3xl font-heading font-bold transition-transform duration-500 md:group-hover:translate-x-4 flex-1 line-clamp-1 break-words">
                      {recipe.title}
                    </h3>
                  </div>
                </div>
                <div className="flex gap-4 mt-4 pl-12 md:pl-0 md:mt-0 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-500">
                  <span className="px-3 py-1.5 bg-bg-surface border border-text-secondary/10 text-text-secondary text-xs md:text-sm font-bold rounded-full">
                    {recipe.prep_time_min ? `${recipe.prep_time_min}m` : 'N/A'}
                  </span>
                  {recipe.region && (
                    <span className="px-3 py-1.5 bg-bg-surface border border-text-secondary/10 text-text-secondary text-xs md:text-sm font-bold rounded-full truncate max-w-[120px]">
                      {recipe.region}
                    </span>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Right: Sticky Image Reveal (Desktop Only) */}
        <div className="hidden lg:block w-full lg:w-2/5 relative">
          {hoveredRecipe && (
            <div className="sticky top-32 w-full aspect-[4/5] rounded-3xl overflow-hidden bg-bg-surface shadow-2xl border-4 border-bg-surface">
              <AnimatePresence>
                <motion.div
                  key={hoveredRecipe.recipe_id}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0"
                >
                  <Image
                    src={hoveredRecipe.image_url || "/images/placeholder-1.jpg"}
                    alt={hoveredRecipe.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 p-8 w-full flex flex-col gap-4">
                     <h4 className="text-white font-heading text-3xl font-bold line-clamp-2 break-words">{hoveredRecipe.title}</h4>
                     <Link
                       href={`/recipe/${hoveredRecipe.recipe_id}`}
                       className="bg-brand-primary text-white px-6 py-4 rounded-full font-bold text-base w-full hover:bg-brand-primary/90 transition-colors shadow-lg text-center"
                     >
                       View Recipe
                     </Link>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
