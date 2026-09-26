"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { FiBook, FiHeart, FiPlus, FiEdit2, FiTrash2, FiTrash, FiEye, FiClock, FiMessageSquare, FiFolder } from "react-icons/fi";
import AdminPanel from "@/components/dashboard/AdminPanel";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/components/ui/ToastContext";
import { signOut, useSession } from "next-auth/react";

function DashboardContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "recipes";
  const [drafts, setDrafts] = useState<any[]>([]);

  const [stats, setStats] = useState({ totalRecipes: 0, totalSaved: 0, totalViews: 0 });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const [recommended, setRecommended] = useState<any[]>([]);
  const [isLoadingRecommended, setIsLoadingRecommended] = useState(true);
  
  const [chatSessions, setChatSessions] = useState<any[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  
  const [collections, setCollections] = useState<any[]>([]);
  const [isLoadingCollections, setIsLoadingCollections] = useState(true);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);

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

  const fetchStats = async () => {
    setIsLoadingStats(true);
    setIsLoadingRecommended(true);
    setIsLoadingChats(true);
    setIsLoadingCollections(true);
    try {
      const [statsRes, recRes, chatRes, colRes] = await Promise.all([
        fetch("/api/user/stats"),
        fetch("/api/recipes/recommended"),
        fetch("/api/chat/history"),
        fetch("/api/collections")
      ]);
      
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }
      
      if (recRes.ok) {
        const data = await recRes.json();
        setRecommended(data.recipes || []);
      }

      if (chatRes.ok) {
        const data = await chatRes.json();
        setChatSessions(data.sessions || []);
      }

      if (colRes.ok) {
        const data = await colRes.json();
        setCollections(data.collections || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingStats(false);
      setIsLoadingRecommended(false);
      setIsLoadingChats(false);
      setIsLoadingCollections(false);
    }
  };

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
    fetchStats();
  }, []);

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
      {!isLoadingStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-bg-surface border border-text-secondary/10 p-6 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center text-xl">
              <FiBook />
            </div>
            <div>
              <p className="text-text-secondary text-sm font-medium">Total Recipes</p>
              <h3 className="text-2xl font-bold font-heading">{stats.totalRecipes}</h3>
            </div>
          </div>
          <div className="bg-bg-surface border border-text-secondary/10 p-6 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 bg-orange-500/10 text-orange-500 rounded-full flex items-center justify-center text-xl">
              <FiEye />
            </div>
            <div>
              <p className="text-text-secondary text-sm font-medium">Total Views</p>
              <h3 className="text-2xl font-bold font-heading">{stats.totalViews}</h3>
            </div>
          </div>
          <div className="bg-bg-surface border border-text-secondary/10 p-6 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center text-xl">
              <FiHeart />
            </div>
            <div>
              <p className="text-text-secondary text-sm font-medium">Saved Favorites</p>
              <h3 className="text-2xl font-bold font-heading">{stats.totalSaved}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Chef Ada Recommends */}
      {!isLoadingRecommended && recommended.length > 0 && (
        <div className="mb-12">
          <h2 className="font-heading text-2xl font-bold text-text-primary mb-4 flex items-center gap-2">
            <span className="text-brand-primary">Chef Ada</span> Recommends
          </h2>
          <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
            {recommended.map((recipe) => (
              <Link 
                key={recipe.recipe_id} 
                href={`/recipe/${recipe.recipe_id}`}
                className="group relative min-w-[260px] md:min-w-[300px] h-[180px] md:h-[200px] rounded-2xl overflow-hidden flex-shrink-0 border border-text-secondary/10 shadow-sm hover:shadow-md transition-shadow"
              >
                <Image 
                  src={recipe.image_url || "/images/placeholder-1.jpg"} 
                  alt={recipe.title} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4">
                  <h3 className="text-white font-bold font-heading text-lg leading-tight line-clamp-2">{recipe.title}</h3>
                  <p className="text-white/80 text-sm mt-1">{recipe.prep_time_min ? `${recipe.prep_time_min} mins` : recipe.difficulty}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

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
          { id: "collections", label: "Collections", icon: <FiFolder className="mr-2 inline" /> },
          { id: "chats", label: "Chat History", icon: <FiClock className="mr-2 inline" /> },
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

        {tab === "chats" && (
          <div className="space-y-6">
            <h2 className="font-heading text-xl font-bold mb-4 flex items-center gap-2">
              <FiMessageSquare className="text-brand-primary" /> Recent AI Suggestions
            </h2>
            {isLoadingChats ? (
              <div className="text-center py-12 text-text-secondary">Loading chat history...</div>
            ) : chatSessions.length === 0 ? (
              <div className="text-center py-12 bg-bg-surface border border-text-secondary/10 rounded-2xl">
                <p className="text-text-secondary">No chat history found. Start talking to Chef Ada!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {chatSessions.map((session) => (
                  <Link
                    key={session.session_id}
                    href={`/chat?session_id=${session.session_id}`}
                    className="bg-bg-surface border border-text-secondary/10 p-5 rounded-2xl flex items-center justify-between group hover:shadow-md transition-all"
                  >
                    <div>
                      <h3 className="font-bold text-text-primary group-hover:text-brand-primary transition-colors line-clamp-1">{session.preview}</h3>
                      <p className="text-sm text-text-secondary mt-1">
                        {new Date(session.created_at).toLocaleDateString()} at {new Date(session.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform flex-shrink-0 ml-4">
                      <FiMessageSquare />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "collections" && (
          <div className="space-y-6">
            <h2 className="font-heading text-xl font-bold mb-4 flex items-center gap-2">
              <FiFolder className="text-brand-primary" /> My Collections
            </h2>

            {/* Create Collection Form */}
            <div className="bg-bg-surface border border-text-secondary/10 p-5 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
              <input
                type="text"
                placeholder="New collection name..."
                className="flex-1 bg-bg-default border border-text-secondary/20 rounded-xl px-4 py-2.5 focus:outline-none focus:border-brand-primary transition-colors"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === "Enter" && newCollectionName.trim() && !isCreatingCollection) {
                    setIsCreatingCollection(true);
                    try {
                      const res = await fetch("/api/collections", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name: newCollectionName.trim() }),
                      });
                      if (res.ok) {
                        toast.success("Collection created!");
                        setNewCollectionName("");
                        fetchStats(); // re-fetch collections
                      } else {
                        const data = await res.json();
                        toast.error(data.error || "Failed to create collection");
                      }
                    } catch {
                      toast.error("Failed to create collection");
                    } finally {
                      setIsCreatingCollection(false);
                    }
                  }
                }}
              />
              <button
                disabled={!newCollectionName.trim() || isCreatingCollection}
                onClick={async () => {
                  setIsCreatingCollection(true);
                  try {
                    const res = await fetch("/api/collections", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ name: newCollectionName.trim() }),
                    });
                    if (res.ok) {
                      toast.success("Collection created!");
                      setNewCollectionName("");
                      fetchStats(); // re-fetch collections
                    } else {
                      const data = await res.json();
                      toast.error(data.error || "Failed to create collection");
                    }
                  } catch {
                    toast.error("Failed to create collection");
                  } finally {
                    setIsCreatingCollection(false);
                  }
                }}
                className="px-6 py-2.5 bg-brand-primary text-white font-bold rounded-xl disabled:opacity-50"
              >
                {isCreatingCollection ? "Creating..." : "Create"}
              </button>
            </div>

            {isLoadingCollections ? (
              <div className="text-center py-12 text-text-secondary">Loading collections...</div>
            ) : collections.length === 0 ? (
              <div className="text-center py-12 bg-bg-surface border border-text-secondary/10 rounded-2xl">
                <p className="text-text-secondary">No collections yet. Create one above to organize your saved recipes!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collections.map((collection) => (
                  <Link href={`/dashboard/collections/${collection.id}`} key={collection.id} className="bg-bg-surface border border-text-secondary/10 rounded-2xl overflow-hidden shadow-sm group hover:shadow-md transition-all cursor-pointer block">
                    <div className="p-5 flex flex-col h-full">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary">
                          <FiFolder className="text-xl" />
                        </div>
                        <button 
                          onClick={async (e) => {
                            e.preventDefault();
                            if (confirm("Are you sure you want to delete this collection? Saved recipes in this collection will also be removed from your saved list.")) {
                              try {
                                const res = await fetch(`/api/collections/${collection.id}`, { method: "DELETE" });
                                if (res.ok) {
                                  toast.success("Collection deleted");
                                  fetchStats();
                                } else {
                                  toast.error("Failed to delete collection");
                                }
                              } catch {
                                toast.error("Failed to delete collection");
                              }
                            }
                          }}
                          className="p-2 text-text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                      <h3 className="font-bold text-lg text-text-primary mb-1 group-hover:text-brand-primary transition-colors">{collection.name}</h3>
                      <p className="text-sm text-text-secondary flex-grow">
                        {collection._count?.saved_recipes || 0} recipe{(collection._count?.saved_recipes || 0) === 1 ? '' : 's'}
                      </p>
                      
                      <div className="mt-4 pt-4 border-t border-text-secondary/10">
                        <p className="text-xs text-text-secondary">
                          Created {new Date(collection.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
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
