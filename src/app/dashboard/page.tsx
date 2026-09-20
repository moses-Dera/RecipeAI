"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { FiBook, FiHeart, FiPlus, FiEdit2, FiTrash2, FiTrash } from "react-icons/fi";
import AdminPanel from "@/components/dashboard/AdminPanel";
import CreateRecipeModal from "@/components/dashboard/CreateRecipeModal";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/components/ui/ToastContext";
import { signOut, useSession } from "next-auth/react";

function DashboardContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "recipes";
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [recipeToEdit, setRecipeToEdit] = useState<any>(null);
  
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
        const extractedRecipes = data.savedRecipes.map((s: any) => s.recipe);
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
      fetchRecipes(1);
    } else if (tab === "saved") {
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
            {tab.replace("-", " ")}
          </h1>
          <p className="text-text-secondary mt-2">
            {tab === "admin" 
              ? "Manage system settings, AI providers, and platform metrics."
              : "Manage your culinary journey and saved favorites."}
          </p>
        </div>

        {tab === "recipes" && (
          <button 
            onClick={() => { setRecipeToEdit(null); setIsCreateModalOpen(true); }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-primary text-white font-bold hover:bg-brand-secondary transition-colors shadow-lg shadow-brand-primary/20"
          >
            <FiPlus className="text-xl" /> Add Custom Recipe
          </button>
        )}
      </header>

      {/* Render tab content based on searchParams */}
      <div className="w-full">
        {tab === "recipes" && (
          <div>
            {isLoadingRecipes && recipes.length === 0 ? (
              <div className="text-center py-10 text-text-secondary">Loading your recipes...</div>
            ) : recipes.length === 0 ? (
              <div className="p-8 border border-dashed border-text-secondary/30 rounded-2xl flex flex-col items-center justify-center text-center">
                <FiBook className="text-5xl text-brand-primary/50 mb-4" />
                <h3 className="font-heading text-xl font-bold">Your Recipe Book is Empty</h3>
                <p className="text-text-secondary max-w-sm mt-2 mb-6">Start talking to Chef Ada or add your own traditional Nigerian recipe manually!</p>
                <button 
                  onClick={() => { setRecipeToEdit(null); setIsCreateModalOpen(true); }}
                  className="text-brand-primary font-bold hover:opacity-80 transition-opacity"
                >
                  + Create Recipe Manually
                </button>
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
                            <button
                              onClick={() => { setRecipeToEdit(recipe); setIsCreateModalOpen(true); }}
                              className="p-2 bg-bg-primary text-text-secondary hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <FiEdit2 size={16} />
                            </button>
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

        {tab === "settings" && (
          <div className="space-y-6">
            <div className="bg-bg-surface border border-text-secondary/10 rounded-2xl p-6 shadow-sm">
              <h3 className="font-heading text-xl font-bold mb-4">Profile Settings</h3>
              <p className="text-text-secondary mb-6">Update your personal information.</p>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Display Name</label>
                  <input type="text" className="w-full px-4 py-2 rounded-xl border border-text-secondary/20 bg-bg-default text-text-primary" defaultValue={session?.user?.name || ""} />
                </div>
                <button className="bg-brand-primary text-white px-6 py-2 rounded-xl font-medium hover:bg-brand-secondary transition-colors">Save Changes</button>
              </div>
            </div>

            <div className="bg-bg-surface border border-red-500/20 rounded-2xl p-6 shadow-sm">
              <h3 className="font-heading text-xl font-bold text-red-500 mb-4 flex items-center gap-2">
                <FiTrash /> Danger Zone
              </h3>
              <p className="text-text-secondary mb-4 max-w-xl">
                Deleting your account is permanent. All your private recipes, saved recipes, and chat history will be removed. Any public recipes you created will remain available to the community but will no longer be linked to your account.
              </p>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Type DELETE to confirm</label>
                  <input 
                    type="text" 
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-red-500/20 bg-bg-default text-text-primary focus:outline-none focus:border-red-500" 
                    placeholder="DELETE" 
                  />
                </div>
                <button 
                  onClick={handleDeleteAccount}
                  disabled={isDeletingAccount || deleteConfirmText !== "DELETE"}
                  className="bg-red-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {isDeletingAccount ? "Deleting..." : "Delete Account"}
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === "admin" && <AdminPanel />}
      </div>

      <CreateRecipeModal 
        isOpen={isCreateModalOpen} 
        onClose={() => {
          setIsCreateModalOpen(false);
          setRecipeToEdit(null);
        }} 
        recipeToEdit={recipeToEdit}
        onSuccess={() => fetchRecipes(1)}
      />
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
