"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastContext";
import { FiPlus, FiTrash2, FiUpload, FiImage, FiX, FiArrowLeft, FiSave, FiCheck } from "react-icons/fi";
import Image from "next/image";
import { useSession } from "next-auth/react";

interface RecipeEditorProps {
  recipeId?: string; // If editing an existing recipe
  initialData?: any; // Data loaded from DB if editing
}

export default function RecipeEditor({ recipeId, initialData }: RecipeEditorProps) {
  const router = useRouter();
  const toast = useToast();
  const { data: session } = useSession();
  const MOCK_USER_NAME = session?.user?.name || "Cook";
  
  // We use a specific draft key per recipe (or "new" for creations)
  const draftKey = `recipe_draft_${recipeId || "new"}`;

  const [title, setTitle] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [region, setRegion] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [mealType, setMealType] = useState("");
  const [occasion, setOccasion] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([""]);
  const [instructions, setInstructions] = useState<string[]>([""]);
  const [nutrition, setNutrition] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDraftRestored, setIsDraftRestored] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasInitialized = useRef(false);

  // Initialize data (either from draft, initialData, or default)
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    
    let loaded = false;
    
    // Check local storage first
    try {
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTitle(parsed.title || "");
        setPrepTime(parsed.prepTime || "");
        setRegion(parsed.region || "");
        setImageUrl(parsed.imageUrl || "");
        setGallery(parsed.gallery || []);
        setMealType(parsed.mealType || "");
        setOccasion(parsed.occasion || "");
        setIngredients(parsed.ingredients || [""]);
        setInstructions(parsed.instructions || [""]);
        setNutrition(parsed.nutrition || "");
        setIsPublic(parsed.isPublic || false);
        setLastSaved(new Date(parsed.updatedAt));
        loaded = true;
        toast.success("Draft restored");
      }
    } catch (e) {
      console.error("Failed to restore draft", e);
    }

    // If no draft but editing an existing recipe
    if (!loaded && initialData) {
      setTitle(initialData.title);
      setPrepTime(initialData.prep_time_min ? initialData.prep_time_min.toString() : "");
      setRegion(initialData.region || "");
      setImageUrl(initialData.image_url || "");
      setGallery(initialData.gallery || []);
      
      let mTypes: string[] = [];
      try { mTypes = JSON.parse(initialData.meal_type) || []; } catch { mTypes = initialData.meal_type || []; }
      setMealType(Array.isArray(mTypes) ? mTypes.join(", ") : "");
      
      let occs: string[] = [];
      try { occs = JSON.parse(initialData.occasion) || []; } catch { occs = initialData.occasion || []; }
      setOccasion(Array.isArray(occs) ? occs.join(", ") : "");
      
      try {
        const parsedIng = JSON.parse(initialData.ingredients);
        setIngredients(parsedIng.map((i: any) => i.name));
      } catch { setIngredients([""]); }
      
      try {
        setInstructions(JSON.parse(initialData.steps));
      } catch { setInstructions([""]); }
      
      try {
        if (initialData.nutrition) {
          const parsedNut = JSON.parse(initialData.nutrition);
          setNutrition(parsedNut.join("\n"));
        } else {
          setNutrition("");
        }
      } catch { setNutrition(""); }
      
      setIsPublic(!initialData.is_private);
    }
    
    setIsDraftRestored(true);
  }, [draftKey, initialData, toast]);

  // Auto-save logic
  useEffect(() => {
    if (!isDraftRestored) return; // Don't overwrite draft before restoring

    const isDirty = title || region || imageUrl || gallery.length > 0 || mealType || occasion || ingredients.some(i => i) || instructions.some(i => i) || nutrition;
    if (!isDirty && !recipeId) return; // Don't save completely empty new drafts

    const saveDraft = () => {
      const data = {
        title, prepTime, region, imageUrl, gallery, mealType, occasion,
        ingredients, instructions, nutrition, isPublic,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(draftKey, JSON.stringify(data));
      
      // Update the master draft list
      try {
        const draftsObj = JSON.parse(localStorage.getItem('recipe_drafts_index') || '{}');
        draftsObj[draftKey] = {
          title: title || 'Untitled Recipe',
          updatedAt: data.updatedAt,
          id: draftKey,
          recipeId
        };
        localStorage.setItem('recipe_drafts_index', JSON.stringify(draftsObj));
      } catch (e) {
        console.error(e);
      }
      setLastSaved(new Date());
    };

    const timeoutId = setTimeout(saveDraft, 1000);
    return () => clearTimeout(timeoutId);
  }, [title, prepTime, region, imageUrl, gallery, mealType, occasion, ingredients, instructions, nutrition, isPublic, draftKey, isDraftRestored, recipeId]);


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
      
      if (!imageUrl) {
        setImageUrl(url); // First image uploaded becomes cover
      } else {
        setGallery((prev) => [...prev, url]); // Subsequent images go to gallery
      }
      
      toast.success("Image uploaded!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const clearDraft = () => {
    localStorage.removeItem(draftKey);
    try {
      const draftsObj = JSON.parse(localStorage.getItem('recipe_drafts_index') || '{}');
      delete draftsObj[draftKey];
      localStorage.setItem('recipe_drafts_index', JSON.stringify(draftsObj));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    if (!title || !ingredients[0] || !instructions[0]) {
      toast.error("Please enter a title, at least one ingredient, and one instruction.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title,
        prep_time_min: parseInt(prepTime) || 30,
        region,
        image_url: imageUrl || undefined,
        gallery,
        meal_type: mealType.split(",").map(s => s.trim()).filter(Boolean),
        occasion: occasion.split(",").map(s => s.trim()).filter(Boolean),
        ingredients: JSON.stringify(ingredients.filter(Boolean).map(name => ({ name, quantity: "some", unit: "" }))),
        steps: JSON.stringify(instructions.filter(Boolean)),
        nutrition: nutrition ? JSON.stringify(nutrition.split("\n").map(s => s.trim()).filter(Boolean)) : undefined,
        is_private: !isPublic,
      };

      const url = recipeId ? `/api/recipes/${recipeId}` : "/api/recipes";
      const method = recipeId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save recipe");
      }

      toast.success(recipeId ? "Recipe updated!" : "Recipe successfully added to your cookbook!");
      clearDraft();
      router.push("/dashboard?tab=recipes");
    } catch (error: any) {
      toast.error(error.message || "Failed to save recipe. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleDiscard = () => {
    if (window.confirm("Are you sure you want to discard this draft? This cannot be undone.")) {
      clearDraft();
      router.push("/dashboard?tab=recipes");
    }
  };

  if (!isDraftRestored) {
    return <div className="p-8 text-center text-text-secondary">Loading editor...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animation-fade-in pb-32">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-text-secondary/10 pb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push("/dashboard?tab=recipes")}
            className="p-2 rounded-full hover:bg-text-secondary/10 transition-colors text-text-secondary"
            title="Back to Dashboard"
          >
            <FiArrowLeft size={24} />
          </button>
          <div>
            <h1 className="font-heading text-3xl font-bold text-text-primary">
              {recipeId ? "Edit Recipe" : "Write a Recipe"}
            </h1>
            <div className="flex items-center gap-2 mt-1 text-sm text-text-secondary">
              {lastSaved ? (
                <>
                  <FiCheck className="text-green-500" />
                  <span>Draft auto-saved at {lastSaved.toLocaleTimeString()}</span>
                </>
              ) : (
                <span>Not saved yet</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDiscard}
            className="px-4 py-2 rounded-xl text-red-500 font-medium hover:bg-red-500/10 transition-colors text-sm"
          >
            Discard
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || uploading}
            className="px-6 py-2 rounded-xl bg-brand-primary text-white font-bold hover:bg-brand-secondary transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <FiSave />
            {isSubmitting ? "Publishing..." : (recipeId ? "Update Recipe" : "Publish")}
          </button>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8 bg-bg-surface p-6 sm:p-8 rounded-3xl border border-text-secondary/10 shadow-sm">
        
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text-secondary mb-1">Recipe Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Grandma's Secret Egusi"
              className="w-full bg-transparent border border-text-secondary/20 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary transition-colors text-text-primary font-heading text-xl"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text-secondary mb-2">Recipe Image</label>
            <div className="flex items-center gap-4">
              {imageUrl ? (
                <div className="relative w-40 h-40 rounded-xl overflow-hidden shrink-0 border border-text-secondary/20 group">
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
                <div className="w-40 h-40 rounded-xl border-2 border-dashed border-text-secondary/40 flex flex-col items-center justify-center text-text-secondary shrink-0 bg-text-secondary/5">
                  <FiImage size={32} className="mb-2 opacity-50" />
                  <span className="text-sm">No cover image</span>
                </div>
              )}
              
              <div className="flex flex-col gap-3 w-full max-w-md">
                <input 
                  type="text" 
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Paste cover image URL here..."
                  className="w-full bg-transparent border border-text-secondary/20 rounded-xl px-4 py-2 focus:outline-none focus:border-brand-primary transition-colors text-text-primary text-sm"
                />
                <div className="flex items-center gap-3">
                  <span className="text-sm text-text-secondary font-medium">OR</span>
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
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-text-secondary/10 hover:bg-brand-primary/10 hover:text-brand-primary border border-transparent rounded-xl text-sm font-bold text-text-primary transition-colors disabled:opacity-50 flex-1"
                  >
                    <FiUpload />
                    {uploading ? "Uploading..." : "Upload from Device"}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Gallery Images */}
          {imageUrl && (
            <div className="md:col-span-2 mt-2">
              <label className="block text-sm font-medium text-text-secondary mb-2">Additional Gallery Images</label>
              
              <div className="flex flex-wrap items-center gap-4">
                {gallery.map((url, idx) => (
                  <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 border border-text-secondary/20 group">
                    <Image src={url} alt={`Gallery ${idx + 1}`} fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => setGallery(gallery.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 bg-black/60 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-24 h-24 rounded-xl border-2 border-dashed border-text-secondary/40 flex flex-col items-center justify-center text-text-secondary hover:text-brand-primary hover:border-brand-primary/50 transition-colors shrink-0 bg-text-secondary/5"
                >
                  <FiPlus size={24} className="mb-1" />
                  <span className="text-xs font-medium">Add Photo</span>
                </button>
              </div>
            </div>
          )}

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
        <div className="pt-6 border-t border-text-secondary/10">
          <label className="block text-lg font-heading font-bold text-text-primary mb-4">Ingredients</label>
          <div className="space-y-3">
            {ingredients.map((ing, i) => (
              <div key={i} className="flex items-center gap-3">
                <input 
                  type="text" 
                  value={ing}
                  onChange={(e) => handleIngredientChange(i, e.target.value)}
                  placeholder="e.g. 2 cups of melon seeds"
                  className="flex-grow bg-transparent border border-text-secondary/20 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary transition-colors text-text-primary"
                />
                <button 
                  type="button"
                  onClick={() => setIngredients(ingredients.filter((_, idx) => idx !== i))}
                  className="p-3 bg-text-secondary/5 text-text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>
          <button 
            type="button" 
            onClick={() => setIngredients([...ingredients, ""])}
            className="mt-4 flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-text-secondary/20 hover:border-brand-primary/50 text-text-secondary hover:text-brand-primary rounded-xl font-bold transition-colors"
          >
            <FiPlus /> Add Ingredient
          </button>
        </div>

        {/* Instructions */}
        <div className="pt-6 border-t border-text-secondary/10">
          <label className="block text-lg font-heading font-bold text-text-primary mb-4">Step-by-Step Instructions</label>
          <div className="space-y-4">
            {instructions.map((inst, i) => (
              <div key={i} className="flex items-start gap-4 p-4 bg-text-secondary/5 rounded-2xl border border-text-secondary/10 relative">
                <div className="w-8 h-8 shrink-0 bg-brand-primary text-white rounded-full flex items-center justify-center font-bold">
                  {i + 1}
                </div>
                <textarea 
                  value={inst}
                  onChange={(e) => handleInstructionChange(i, e.target.value)}
                  placeholder="e.g. Blend the melon seeds until smooth..."
                  rows={3}
                  className="flex-grow bg-transparent border-none focus:ring-0 text-text-primary resize-none custom-scrollbar outline-none"
                />
                <button 
                  type="button"
                  onClick={() => setInstructions(instructions.filter((_, idx) => idx !== i))}
                  className="p-2 absolute top-4 right-4 text-text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>
          <button 
            type="button" 
            onClick={() => setInstructions([...instructions, ""])}
            className="mt-4 flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-text-secondary/20 hover:border-brand-primary/50 text-text-secondary hover:text-brand-primary rounded-xl font-bold transition-colors"
          >
            <FiPlus /> Add Step
          </button>
        </div>

        {/* Nutritional Benefits */}
        <div className="pt-6 border-t border-text-secondary/10">
          <label className="block text-lg font-heading font-bold text-text-primary mb-1">
            Nutritional Benefits
          </label>
          <span className="block text-sm text-text-secondary mb-4">Separate each benefit with a new line</span>
          <textarea 
            value={nutrition}
            onChange={(e) => setNutrition(e.target.value)}
            placeholder="e.g. Rich in protein and essential amino acids&#10;High in dietary fiber, aids digestion"
            rows={4}
            className="w-full bg-transparent border border-text-secondary/20 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary transition-colors text-text-primary resize-none custom-scrollbar"
          />
        </div>

        {/* Publish Toggle */}
        <div className="pt-6 border-t border-text-secondary/10">
          <div className="flex items-center gap-4 p-5 bg-brand-primary/5 rounded-2xl border border-brand-primary/20">
            <input 
              type="checkbox" 
              id="publishToggle"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-6 h-6 accent-brand-primary cursor-pointer"
            />
            <div className="flex flex-col">
              <label htmlFor="publishToggle" className="text-base font-bold text-text-primary cursor-pointer">
                Publish to Community
              </label>
              <span className="text-sm text-text-secondary mt-1">
                Make this recipe public. It will show &quot;Submitted by {MOCK_USER_NAME}&quot; on the card. Uncheck to keep it private.
              </span>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
