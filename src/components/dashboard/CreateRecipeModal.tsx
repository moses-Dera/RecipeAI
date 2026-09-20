"use client";

import { useState, useEffect, useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/ToastContext";
import { FiPlus, FiTrash2, FiUpload, FiImage, FiX } from "react-icons/fi";
import type { Recipe } from "@prisma/client";
import Image from "next/image";
import { useSession } from "next-auth/react";

interface CreateRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipeToEdit?: Recipe | null;
  onSuccess?: () => void;
}

export default function CreateRecipeModal({ isOpen, onClose, recipeToEdit, onSuccess }: CreateRecipeModalProps) {
  const toast = useToast();
  const { data: session } = useSession();
  
  const [title, setTitle] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [region, setRegion] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [mealType, setMealType] = useState("");
  const [occasion, setOccasion] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([""]);
  const [instructions, setInstructions] = useState<string[]>([""]);
  const [nutrition, setNutrition] = useState(""); // newline separated
  const [isPublic, setIsPublic] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = (session?.user as any)?.role === "admin";
  const MOCK_USER_NAME = session?.user?.name || "Cook";

  useEffect(() => {
    if (isOpen) {
      if (recipeToEdit) {
        setTitle(recipeToEdit.title);
        setPrepTime(recipeToEdit.prep_time_min ? recipeToEdit.prep_time_min.toString() : "");
        setRegion(recipeToEdit.region || "");
        setImageUrl(recipeToEdit.image_url || "");
        
        let mTypes: string[] = [];
        try { mTypes = JSON.parse(recipeToEdit.meal_type as any) || []; } catch { mTypes = recipeToEdit.meal_type as any || []; }
        setMealType(Array.isArray(mTypes) ? mTypes.join(", ") : "");
        
        let occs: string[] = [];
        try { occs = JSON.parse(recipeToEdit.occasion as any) || []; } catch { occs = recipeToEdit.occasion as any || []; }
        setOccasion(Array.isArray(occs) ? occs.join(", ") : "");
        
        try {
          const parsedIng = JSON.parse(recipeToEdit.ingredients);
          setIngredients(parsedIng.map((i: any) => i.name));
        } catch { setIngredients([""]); }
        
        try {
          setInstructions(JSON.parse(recipeToEdit.steps));
        } catch { setInstructions([""]); }
        
        try {
          if (recipeToEdit.nutrition) {
            const parsedNut = JSON.parse(recipeToEdit.nutrition);
            setNutrition(parsedNut.join("\n"));
          } else {
            setNutrition("");
          }
        } catch { setNutrition(""); }
        
        setIsPublic(!recipeToEdit.is_private);
      } else {
        // Reset
        setTitle(""); setPrepTime(""); setRegion(""); setImageUrl(""); setMealType(""); setOccasion("");
        setIngredients([""]); setInstructions([""]); setNutrition(""); setIsPublic(false);
      }
    }
  }, [isOpen, recipeToEdit]);

  const handleIngredientChange = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const handleInstructionChange = (index: number, value: string) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      const { url } = await res.json();
      setImageUrl(url);
      toast.success("Image uploaded!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent double submit
    setIsSubmitting(true);
    
    // Validate
    if (!title || !ingredients[0] || !instructions[0]) {
      toast.error("Please enter a title, at least one ingredient, and one instruction.");
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        title,
        prep_time_min: parseInt(prepTime) || 30,
        region,
        image_url: imageUrl || undefined,
        meal_type: mealType.split(",").map(s => s.trim()).filter(Boolean),
        occasion: occasion.split(",").map(s => s.trim()).filter(Boolean),
        ingredients: JSON.stringify(ingredients.filter(Boolean).map(name => ({ name, quantity: "some", unit: "" }))),
        steps: JSON.stringify(instructions.filter(Boolean)),
        nutrition: nutrition ? JSON.stringify(nutrition.split("\n").map(s => s.trim()).filter(Boolean)) : undefined,
        is_private: !isPublic,
      };

      const url = recipeToEdit ? `/api/recipes/${recipeToEdit.recipe_id}` : "/api/recipes";
      const method = recipeToEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save recipe");
      }

      toast.success(recipeToEdit ? "Recipe updated!" : "Recipe successfully added to your cookbook!");
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to save recipe. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={recipeToEdit ? "Edit Recipe" : "Add Custom Recipe"} maxWidth="max-w-3xl">
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar pr-2">
        
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text-secondary mb-1">Recipe Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Grandma's Secret Egusi"
              className="w-full bg-transparent border border-text-secondary/20 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary transition-colors text-text-primary"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text-secondary mb-2">Recipe Image</label>
            <div className="flex items-center gap-4">
              {imageUrl ? (
                <div className="relative w-32 h-32 rounded-xl overflow-hidden shrink-0 border border-text-secondary/20 group">
                  <Image src={imageUrl} alt="Recipe" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ) : (
                <div className="w-32 h-32 rounded-xl border border-dashed border-text-secondary/40 flex flex-col items-center justify-center text-text-secondary shrink-0">
                  <FiImage size={24} className="mb-2" />
                  <span className="text-xs">No image</span>
                </div>
              )}
              
              <div className="flex flex-col gap-2 w-full">
                <input 
                  type="text" 
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Paste image URL here..."
                  className="w-full bg-transparent border border-text-secondary/20 rounded-xl px-4 py-2 focus:outline-none focus:border-brand-primary transition-colors text-text-primary text-sm"
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-secondary">OR</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 px-4 py-1.5 bg-bg-surface border border-text-secondary/20 rounded-lg text-sm font-medium text-text-primary hover:bg-text-secondary/5 transition-colors disabled:opacity-50"
                  >
                    <FiUpload />
                    {uploading ? "Uploading..." : "Upload File"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Region / Origin</label>
            <input 
              type="text" 
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="e.g. South-East Nigeria"
              className="w-full bg-transparent border border-text-secondary/20 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary transition-colors text-text-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Prep/Cook Time (minutes)</label>
            <input 
              type="number" 
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
              placeholder="e.g. 45"
              className="w-full bg-transparent border border-text-secondary/20 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary transition-colors text-text-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Meal Types (comma separated)</label>
            <input 
              type="text" 
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
              placeholder="e.g. Breakfast, Snack"
              className="w-full bg-transparent border border-text-secondary/20 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary transition-colors text-text-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Occasion (comma separated)</label>
            <input 
              type="text" 
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              placeholder="e.g. Everyday, Party"
              className="w-full bg-transparent border border-text-secondary/20 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary transition-colors text-text-primary"
            />
          </div>
        </div>

        {/* Ingredients */}
        <div className="pt-4 border-t border-text-secondary/10">
          <label className="block text-sm font-medium text-text-secondary mb-2">Ingredients</label>
          <div className="space-y-2">
            {ingredients.map((ing, i) => (
              <div key={i} className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={ing}
                  onChange={(e) => handleIngredientChange(i, e.target.value)}
                  placeholder="e.g. 2 cups of melon seeds"
                  className="flex-grow bg-transparent border border-text-secondary/20 rounded-xl px-4 py-2 focus:outline-none focus:border-brand-primary transition-colors text-text-primary text-sm"
                />
                <button 
                  type="button"
                  onClick={() => setIngredients(ingredients.filter((_, idx) => idx !== i))}
                  className="p-2 text-text-secondary hover:text-red-500 transition-colors"
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>
          <button 
            type="button" 
            onClick={() => setIngredients([...ingredients, ""])}
            className="mt-3 flex items-center gap-2 text-sm text-brand-primary font-medium hover:opacity-80 transition-opacity"
          >
            <FiPlus /> Add Ingredient
          </button>
        </div>

        {/* Instructions */}
        <div className="pt-4 border-t border-text-secondary/10">
          <label className="block text-sm font-medium text-text-secondary mb-2">Instructions</label>
          <div className="space-y-2">
            {instructions.map((inst, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="mt-2 text-sm font-bold text-text-secondary w-5 shrink-0">{i + 1}.</span>
                <textarea 
                  value={inst}
                  onChange={(e) => handleInstructionChange(i, e.target.value)}
                  placeholder="e.g. Blend the melon seeds until smooth..."
                  rows={2}
                  className="flex-grow bg-transparent border border-text-secondary/20 rounded-xl px-4 py-2 focus:outline-none focus:border-brand-primary transition-colors text-text-primary text-sm resize-none custom-scrollbar"
                />
                <button 
                  type="button"
                  onClick={() => setInstructions(instructions.filter((_, idx) => idx !== i))}
                  className="p-2 text-text-secondary hover:text-red-500 transition-colors mt-1 shrink-0"
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>
          <button 
            type="button" 
            onClick={() => setInstructions([...instructions, ""])}
            className="mt-3 flex items-center gap-2 text-sm text-brand-primary font-medium hover:opacity-80 transition-opacity"
          >
            <FiPlus /> Add Step
          </button>
        </div>

        {/* Nutritional Benefits */}
        <div className="pt-4 border-t border-text-secondary/10">
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Nutritional Benefits <span className="text-xs font-normal opacity-70">(One per line)</span>
          </label>
          <textarea 
            value={nutrition}
            onChange={(e) => setNutrition(e.target.value)}
            placeholder="e.g. Rich in protein and essential amino acids&#10;High in dietary fiber, aids digestion"
            rows={4}
            className="w-full bg-transparent border border-text-secondary/20 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary transition-colors text-text-primary text-sm resize-none custom-scrollbar"
          />
        </div>

        {/* Publish Toggle */}
        <div className="flex items-center gap-3 p-4 bg-brand-primary/5 rounded-xl border border-brand-primary/10">
          <input 
            type="checkbox" 
            id="publishToggle"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="w-5 h-5 accent-brand-primary cursor-pointer"
          />
          <div className="flex flex-col">
            <label htmlFor="publishToggle" className="text-sm font-bold text-text-primary cursor-pointer">
              Publish to Community
            </label>
            <span className="text-xs text-text-secondary">
              Allow others to see this recipe. It will show "Submitted by {MOCK_USER_NAME}" on the card.
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 flex justify-end gap-4 border-t border-text-secondary/10 sticky bottom-0 bg-bg-surface py-2 z-10">
          <button 
            type="button" 
            onClick={onClose}
            className="px-6 py-2 rounded-xl text-text-secondary font-medium hover:bg-text-secondary/10 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={isSubmitting || uploading}
            className="px-8 py-2 rounded-xl bg-brand-primary text-white font-bold hover:bg-brand-secondary transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : recipeToEdit ? "Update Recipe" : "Save Recipe"}
          </button>
        </div>

      </form>
    </Modal>
  );
}
