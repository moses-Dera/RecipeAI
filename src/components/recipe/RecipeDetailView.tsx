"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FiClock, FiMapPin, FiBookmark, FiShare2, FiArrowLeft, FiCheck, FiDownload } from "react-icons/fi";
import type { Recipe } from "@prisma/client";
import { useToast } from "@/components/ui/ToastContext";

interface RecipeDetailViewProps {
  recipe: Recipe & { owner?: { username: string } | null };
}

export default function RecipeDetailView({ recipe }: RecipeDetailViewProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const toast = useToast();
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  let ingredients: any[] = [];
  let steps: string[] = [];
  let nutrition: string[] = [];

  try { ingredients = JSON.parse(recipe.ingredients); } catch {}
  try { steps = JSON.parse(recipe.steps); } catch {}
  try { 
    if (recipe.nutrition) nutrition = JSON.parse(recipe.nutrition); 
  } catch {}

  const handleSave = async () => {
    if (!session?.user) {
      toast.error("Please sign in to save recipes");
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipe_id: recipe.recipe_id }),
      });
      if (res.ok) {
        setIsSaved(true);
        toast.success("Recipe saved to your collection!");
      } else if (res.status === 409) {
        setIsSaved(true);
        toast.info("Already in your collection");
      } else {
        toast.error("Failed to save recipe");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: recipe.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch(`/api/export/${recipe.recipe_id}`);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${recipe.title.replace(/\s+/g, "_")}.docx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Recipe exported!");
    } catch {
      toast.error("Failed to export recipe");
    }
  };

  return (
    <div className="w-full">
      {/* Hero Image Section */}
      <div className="relative w-full h-[50vh] md:h-[65vh]">
        <Image
          src={recipe.image_url || "/images/placeholder-1.jpg"}
          alt={recipe.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

        {/* Back Button */}
        <Link
          href="/explore"
          className="absolute top-6 left-6 z-20 flex items-center gap-2 bg-black/30 backdrop-blur-md text-white px-4 py-2.5 rounded-full font-bold text-sm hover:bg-black/50 transition-colors"
        >
          <FiArrowLeft /> Back
        </Link>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-6 md:p-12 lg:p-16 max-w-5xl">
          <div className="flex flex-wrap gap-3 mb-4">
            <span className="flex items-center gap-1.5 text-sm font-bold bg-white/15 text-white px-4 py-1.5 rounded-full backdrop-blur-md">
              <FiClock /> {recipe.prep_time_min ? `${recipe.prep_time_min} mins` : "N/A"}
            </span>
            {recipe.region && (
              <span className="flex items-center gap-1.5 text-sm font-bold bg-white/15 text-white px-4 py-1.5 rounded-full backdrop-blur-md">
                <FiMapPin /> {recipe.region}
              </span>
            )}
            <span className="text-sm font-bold bg-brand-primary/80 text-white px-4 py-1.5 rounded-full backdrop-blur-md capitalize">
              {recipe.difficulty}
            </span>
          </div>

          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 break-words">
            {recipe.title}
          </h1>

          {recipe.owner?.username && (
            <p className="text-white/70 text-sm font-medium mb-6">
              By {recipe.owner.username}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving || isSaved}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-base transition-colors shadow-lg ${
                isSaved
                  ? "bg-green-500 text-white"
                  : "bg-brand-primary hover:bg-brand-primary/90 text-white"
              }`}
            >
              {isSaved ? <FiCheck /> : <FiBookmark />}
              {isSaved ? "Saved" : isSaving ? "Saving..." : "Save Recipe"}
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white px-6 py-3 rounded-xl font-bold backdrop-blur-md transition-colors"
            >
              <FiShare2 /> Share
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white px-6 py-3 rounded-xl font-bold backdrop-blur-md transition-colors"
            >
              <FiDownload /> Export
            </button>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      {recipe.gallery && recipe.gallery.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 md:px-12 pt-8 pb-4">
          <h2 className="font-heading text-xl font-bold text-text-primary mb-4 border-b border-text-secondary/10 pb-2">
            Recipe Gallery
          </h2>
          <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar">
            {recipe.gallery.map((url: string, idx: number) => (
              <div key={idx} className="relative w-48 h-48 sm:w-64 sm:h-64 rounded-2xl overflow-hidden shrink-0 border border-text-secondary/10 shadow-sm hover:shadow-md transition-shadow">
                <Image src={url} alt={`${recipe.title} gallery image ${idx + 1}`} fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className="max-w-5xl mx-auto px-6 md:px-12 py-12 md:py-16 pt-8 md:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
          {/* Left Column: Ingredients + Nutrition */}
          <div className="lg:col-span-1 space-y-10">
            {/* Ingredients */}
            <div>
              <h2 className="font-heading text-2xl font-bold text-text-primary mb-6 pb-3 border-b border-text-secondary/10">
                Ingredients
              </h2>
              <ul className="space-y-3">
                {ingredients.map((ing: any, i: number) => (
                  <li key={i} className="flex justify-between items-start gap-4 py-2 border-b border-text-secondary/5">
                    <span className="text-text-secondary break-words">{ing.name}</span>
                    <span className="text-text-primary font-bold whitespace-nowrap shrink-0">
                      {ing.quantity} {ing.unit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Nutritional Benefits */}
            {nutrition.length > 0 && (
              <div>
                <h2 className="font-heading text-2xl font-bold text-text-primary mb-6 pb-3 border-b border-text-secondary/10">
                  Nutritional Benefits
                </h2>
                <ul className="space-y-3">
                  {nutrition.map((benefit: string, i: number) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="mt-1 shrink-0 w-5 h-5 rounded-full bg-green-500/15 flex items-center justify-center">
                        <FiCheck className="text-green-600 text-xs" />
                      </div>
                      <span className="text-text-secondary text-sm leading-relaxed">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column: Steps */}
          <div className="lg:col-span-2">
            <h2 className="font-heading text-2xl font-bold text-text-primary mb-8 pb-3 border-b border-text-secondary/10">
              Instructions
            </h2>
            <div className="space-y-8">
              {steps.map((step: string, i: number) => (
                <div key={i} className="flex gap-5 group">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-lg group-hover:bg-brand-primary group-hover:text-white transition-colors">
                    {i + 1}
                  </div>
                  <p className="text-text-secondary leading-relaxed pt-2 break-words max-w-prose">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
