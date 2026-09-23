"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { FiBook, FiHeart, FiPlus, FiEdit2, FiTrash2, FiTrash } from "react-icons/fi";
import AdminPanel from "@/components/dashboard/AdminPanel";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/components/ui/ToastContext";
import { signOut, useSession } from "next-auth/react";

function DashboardContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "recipes";
  const [drafts, setDrafts] = useState<any[]>([]);
  
  const [recipes, setRecipes] = useState<any[]>([]);
  const [recipesPage, setRecipesPage] = useState(1);
  const [recipesTotalPages, setRecipesTotalPages] = useState(1);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(true);

  const [savedRecipes, setSavedRecipes] = useState<any[]>([]);
  const [savedPage, setSavedPage] = useState(1);
  const [savedTotalPages, setSavedTotalPages] = useState(1);
  const [isLoadingSaved, setIsLoadingSaved] = useState(true);

  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const toast = useToast();
  const { data: session } = useSession();

  const fetchRecipes = async (page = 1) => {
    setIsLoadingRecipes(true);
    try {
      const res = await fetch(`/api/recipes/me?page=${page}&limit=12`);
      if (res.ok) {
        const data = await res.json();
        if (page === 1) setRecipes(data.recipes || []);
        else setRecipes(prev => [...prev, ...(data.recipes || [])]);
        setRecipesPage(data.page);
        setRecipesTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingRecipes(false);
    }
  };

  const fetchSaved = async (page = 1) => {
    setIsLoadingSaved(true);
    try {
      const res = await fetch(`/api/saved?page=${page}&limit=12`);
      if (res.ok) {
        const data = await res.json();
        const extractedRecipes = (data.saved || []).map((s: any) => s.recipe);
        if (page === 1) setSavedRecipes(extractedRecipes);
        else setSavedRecipes(prev => [...prev, ...extractedRecipes]);
        setSavedPage(data.page);
        setSavedTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingSaved(false);
    }
  };

  useEffect(() => {
    if (tab === "recipes") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchRecipes(1);
      // Load drafts
      try {
        const draftsObj = JSON.parse(localStorage.getItem('recipe_drafts_index') || '{}');
        const draftsArray = Object.values(draftsObj).sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDrafts(draftsArray);
      } catch(e) {}
    } else if (tab === "saved") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchSaved(1);
    }
  }, [tab]);

  const handleDeleteRecipe = async (id: number) => {
    if (!confirm("Are you sure you want to delete this recipe?")) return;
    try {
      const res = await fetch(`/api/recipes/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Recipe deleted");
        setRecipes(recipes.filter(r => r.recipe_id !== id));
      } else {
        toast.error("Failed to delete recipe");
      }
    } catch {
      toast.error("Failed to delete recipe");
    }
  };

  const handleUnsaveRecipe = async (id: number) => {
    try {
      const res = await fetch(`/api/saved?recipeId=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Recipe removed from saved");
        setSavedRecipes(savedRecipes.filter(r => r.recipe_id !== id));
      } else {
        toast.error("Failed to unsave recipe");
      }
    } catch {
      toast.error("Failed to unsave recipe");
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      toast.error("Please type DELETE to confirm");
      return;
    }
    setIsDeletingAccount(true);
    try {
      const res = await fetch("/api/user/account", { method: "DELETE" });
      if (res.ok) {
        toast.success("Account deleted");
        signOut({ callbackUrl: "/" });
      } else {
        toast.error("Failed to delete account");
      }
    } catch {
      toast.error("Failed to delete account");
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="w-full animation-fade-in">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-text-primary capitalize">
            {tab === "recipes" ? "My Recipes" : tab.replace("-", " ")}
          </h1>
          <p className="text-text-secondary mt-2">
            Manage your culinary journey and saved favorites.
          </p>
        </div>

        {tab === "recipes" && (
          <Link 
            href="/recipe/create"
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-primary text-white font-bold hover:bg-brand-secondary transition-colors shadow-lg shadow-brand-primary/20"
          >
            <FiPlus className="text-xl" /> Add Custom Recipe
          </Link>
        )}
      </header>

      {/* Navigation Tabs (Mobile Only) */}
      <div className="flex md:hidden overflow-x-auto border-b border-text-secondary/10 mb-8 gap-6 hide-scrollbar px-1">
        {[
          { id: "recipes", label: "My Recipes", icon: <FiBook className="mr-2 inline" /> },
          { id: "saved", label: "Saved Recipes", icon: <FiHeart className="mr-2 inline" /> },
        ].map((t) => (
          <Link
            key={t.id}
            href={`/dashboard?tab=${t.id}`}
            className={`pb-4 font-bold transition-colors whitespace-nowrap border-b-2 ${
              tab === t.id ? "text-brand-primary border-brand-primary" : "text-text-secondary border-transparent hover:text-text-primary"
            }`}
          >
            {t.icon}
            {t.label}
          </Link>
        ))}
      </div>

      {/* Render tab content based on searchParams */}
      <div className="w-full">
        {tab === "recipes" && (
          <div className="space-y-12">
            {drafts.length > 0 && (
              <div>
                <h2 className="font-heading text-xl font-bold mb-4 flex items-center gap-2">
                  <FiEdit2 className="text-text-secondary" /> Unpublished Drafts
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {drafts.map((draft) => (
                    <Link
                      key={draft.id}
                      href={draft.recipeId ? `/recipe/${draft.recipeId}/edit` : `/recipe/create`}
                      className="bg-bg-surface border border-brand-primary/20 rounded-xl p-4 hover:shadow-md transition-shadow flex flex-col justify-between"
                    >
                      <div>
                        <h3 className="font-bold text-text-primary line-clamp-1">{draft.title || "Untitled Recipe"}</h3>
                        <p className="text-xs text-text-secondary mt-1">
                          Last edited: {new Date(draft.updatedAt).toLocaleDateString()} at {new Date(draft.updatedAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="mt-4 text-brand-primary text-sm font-bold flex items-center gap-1">
                        Continue editing &rarr;
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <h2 className="font-heading text-xl font-bold mb-4">Published Recipes</h2>
              {isLoadingRecipes && recipes.length === 0 ? (
                <div className="text-center py-10 text-text-secondary">Loading your recipes...</div>
              ) : recipes.length === 0 ? (
                <div className="p-8 border border-dashed border-text-secondary/30 rounded-2xl flex flex-col items-center justify-center text-center">
                  <FiBook className="text-5xl text-brand-primary/50 mb-4" />
                  <h3 className="font-heading text-xl font-bold">Your Recipe Book is Empty</h3>
                  <p className="text-text-secondary max-w-sm mt-2 mb-6">Start talking to Chef Ada or add your own traditional Nigerian recipe manually!</p>
                  <Link 
                    href="/recipe/create"
                    className="text-brand-primary font-bold hover:opacity-80 transition-opacity"
                  >
                    + Create Recipe Manually
                  </Link>
                </div>
              ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {recipes.map((recipe: any) => (
                    <div key={recipe.recipe_id} className="group bg-bg-surface border border-text-secondary/10 rounded-2xl overflow-hidden shadow-sm flex flex-col hover:shadow-xl transition-all h-full">
                      <Link href={`/recipe/${recipe.recipe_id}`} className="block h-48 bg-text-secondary/5 relative overflow-hidden">
                        <Image src={recipe.image_url || "/images/placeholder-1.jpg"} alt={recipe.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                        {recipe.is_private && (
                          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur text-white text-xs px-2 py-1 rounded-md font-medium z-10">
                            Private
                          </div>
                        )}
                      </Link>
                      <div className="p-5 flex-grow flex flex-col">
                        <Link href={`/recipe/${recipe.recipe_id}`}>
                          <h3 className="font-heading font-bold text-lg text-text-primary line-clamp-2 group-hover:text-brand-primary transition-colors">{recipe.title}</h3>
                        </Link>
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-text-secondary/10">
                          <div className="flex gap-2">
                            <Link
                              href={`/recipe/${recipe.recipe_id}/edit`}
                              className="p-2 bg-bg-primary text-text-secondary hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <FiEdit2 size={16} />
                            </Link>
                            <button
                              onClick={() => handleDeleteRecipe(recipe.recipe_id)}
                              className="p-2 bg-bg-primary text-text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {recipesPage < recipesTotalPages && (
                  <div className="mt-8 flex justify-center">
                    <button
                      onClick={() => fetchRecipes(recipesPage + 1)}
                      className="px-6 py-2.5 bg-bg-surface border border-text-secondary/20 rounded-full font-bold text-text-secondary hover:text-brand-primary transition-colors"
                    >
                      Load More
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {tab === "saved" && (
          <div>
            {isLoadingSaved && savedRecipes.length === 0 ? (
               <div className="text-center py-10 text-text-secondary">Loading saved recipes...</div>
            ) : savedRecipes.length === 0 ? (
              <div className="p-8 border border-dashed border-text-secondary/30 rounded-2xl flex flex-col items-center justify-center text-center">
                <FiHeart className="text-5xl text-brand-secondary/50 mb-4" />
                <h3 className="font-heading text-xl font-bold">No Saved Recipes Yet</h3>
                <p className="text-text-secondary max-w-sm mt-2 mb-6">Explore the community catalogue and save your favorites here.</p>
                <Link href="/explore" className="text-brand-primary font-bold hover:opacity-80 transition-opacity">
                  Explore Recipes
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {savedRecipes.map((recipe: any) => (
                    <div key={recipe.recipe_id} className="group bg-bg-surface border border-text-secondary/10 rounded-2xl overflow-hidden shadow-sm flex flex-col hover:shadow-xl transition-all h-full">
                      <Link href={`/recipe/${recipe.recipe_id}`} className="block h-48 bg-text-secondary/5 relative overflow-hidden">
                        <Image src={recipe.image_url || "/images/placeholder-1.jpg"} alt={recipe.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                      </Link>
                      <div className="p-5 flex-grow flex flex-col">
                        <Link href={`/recipe/${recipe.recipe_id}`}>
                          <h3 className="font-heading font-bold text-lg text-text-primary line-clamp-2 group-hover:text-brand-primary transition-colors">{recipe.title}</h3>
                        </Link>
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-text-secondary/10">
                           <span className="text-sm font-bold text-text-secondary truncate">{recipe.owner?.username || "Platform"}</span>
                           <button
                              onClick={() => handleUnsaveRecipe(recipe.recipe_id)}
                              className="p-2 bg-bg-primary text-brand-secondary hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Remove from saved"
                            >
                              <FiHeart size={16} className="fill-current" />
                            </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {savedPage < savedTotalPages && (
                  <div className="mt-8 flex justify-center">
                    <button
                      onClick={() => fetchSaved(savedPage + 1)}
                      className="px-6 py-2.5 bg-bg-surface border border-text-secondary/20 rounded-full font-bold text-text-secondary hover:text-brand-primary transition-colors"
                    >
                      Load More
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import { Suspense } from 'react';

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-text-secondary">Loading Dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
