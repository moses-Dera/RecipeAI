"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiClock, FiMapPin, FiBookmark, FiShare2 } from "react-icons/fi";
import Image from "next/image";
import type { Recipe } from "@prisma/client";
import { useEffect } from "react";

interface RecipeDetailModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function RecipeDetailModal({ recipe, isOpen, onClose }: RecipeDetailModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!recipe) return null;

  let ingredients: any[] = [];
  let steps: string[] = [];
  try {
    ingredients = JSON.parse(recipe.ingredients);
  } catch (e) {
    console.error("Failed to parse ingredients", e);
  }
  try {
    steps = JSON.parse(recipe.steps);
  } catch (e) {
    console.error("Failed to parse steps", e);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full h-full md:w-[90vw] md:max-w-6xl md:h-[85vh] bg-bg-surface rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-50 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white p-3 rounded-full transition-colors"
            >
              <FiX size={24} />
            </button>

            {/* Left: Image Hero */}
            <div className="w-full md:w-2/5 h-72 md:h-full relative shrink-0">
              <Image
                src={recipe.image_url || "/images/placeholder-1.jpg"}
                alt={recipe.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full text-white">
                <div className="flex gap-3 mb-4">
                  <span className="flex items-center gap-1 text-sm font-bold bg-white/20 px-4 py-1.5 rounded-full backdrop-blur-md">
                    <FiClock /> {recipe.prep_time_min ? `${recipe.prep_time_min}m` : 'N/A'}
                  </span>
                  {recipe.region && (
                    <span className="flex items-center gap-1 text-sm font-bold bg-white/20 px-4 py-1.5 rounded-full backdrop-blur-md">
                      <FiMapPin /> {recipe.region}
                    </span>
                  )}
                </div>
                <h2 className="font-heading text-4xl md:text-5xl font-bold leading-tight mb-6 text-white drop-shadow-md">
                  {recipe.title}
                </h2>
                <div className="flex gap-3">
                  <button className="flex-1 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 transition-colors text-lg shadow-lg">
                    <FiBookmark /> Save Recipe
                  </button>
                  <button className="bg-white/20 hover:bg-white/30 text-white p-4 rounded-xl backdrop-blur-md transition-colors">
                    <FiShare2 size={24} />
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Recipe Content (Scrollable) */}
            <div className="w-full md:w-3/5 h-full overflow-y-auto p-6 md:p-12 bg-bg-primary text-text-primary">
              
              {/* Ingredients */}
              <div className="mb-12">
                <h3 className="font-heading text-3xl font-bold mb-6 text-text-primary border-b border-text-secondary/10 pb-4">
                  Ingredients
                </h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  {ingredients.map((ing: any, i: number) => (
                    <li key={i} className="flex justify-between items-center py-2 border-b border-text-secondary/5">
                      <span className="font-medium text-lg text-text-secondary">{ing.name}</span>
                      <span className="text-text-primary font-bold font-sans">
                        {ing.quantity} {ing.unit}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Steps */}
              <div>
                <h3 className="font-heading text-3xl font-bold mb-6 text-text-primary border-b border-text-secondary/10 pb-4">
                  Instructions
                </h3>
                <div className="space-y-8">
                  {steps.map((step: string, i: number) => (
                    <div key={i} className="flex gap-6 group">
                      <div className="shrink-0 w-12 h-12 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-xl group-hover:bg-brand-primary group-hover:text-white transition-colors">
                        {i + 1}
                      </div>
                      <p className="text-lg leading-relaxed pt-1.5 text-text-secondary">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
