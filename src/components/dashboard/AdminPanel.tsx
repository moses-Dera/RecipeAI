"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/ToastContext";
import { FiUsers, FiBookOpen, FiMessageSquare, FiSettings, FiEdit2, FiTrash2, FiShield } from "react-icons/fi";
import Image from "next/image";
import Link from "next/link";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<"settings" | "recipes" | "users">("settings");
  
  // Settings State
  const [provider, setProvider] = useState("gemini");
  const [baseUrl, setBaseUrl] = useState("");
  const [modelName, setModelName] = useState("");
  const [apiKey, setApiKey] = useState("");

  
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalRecipes: 0,
    totalChats: 0
  });

  // Recipes State
  const [recipes, setRecipes] = useState<any[]>([]);
  const [recipesPage, setRecipesPage] = useState(1);
  const [recipesTotalPages, setRecipesTotalPages] = useState(1);
  const [recipeToEdit, setRecipeToEdit] = useState<any>(null);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);

  // Users State
  const [users, setUsers] = useState<any[]>([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);

  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  const fetchAdminData = async () => {
    try {
      const res = await fetch("/api/admin");
      if (!res.ok) throw new Error("Failed to fetch admin data");
      const data = await res.json();
      
      setProvider(data.settings.provider || "gemini");
      setBaseUrl(data.settings.baseUrl || "");
      setModelName(data.settings.modelName || "");
      setApiKey(data.settings.apiKeyConfigured ? "configured" : "");
      
      setMetrics({
        totalUsers: data.metrics.totalUsers || 0,
        totalRecipes: data.metrics.totalRecipes || 0,
        totalChats: data.metrics.totalChats || 0,
      });
    } catch (error) {
      toast.error("Failed to load settings.");
    }
  };

  const fetchRecipes = async (page = 1) => {
    try {
      const res = await fetch(`/api/admin/recipes?page=${page}&limit=12`);
      if (res.ok) {
        const data = await res.json();
        if (page === 1) setRecipes(data.recipes);
        else setRecipes(prev => [...prev, ...data.recipes]);
        setRecipesPage(data.page);
        setRecipesTotalPages(data.totalPages);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUsers = async (page = 1) => {
    try {
      const res = await fetch(`/api/admin/users?page=${page}&limit=20`);
      if (res.ok) {
        const data = await res.json();
        if (page === 1) setUsers(data.users);
        else setUsers(prev => [...prev, ...data.users]);
        setUsersPage(data.page);
        setUsersTotalPages(data.totalPages);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    Promise.all([fetchAdminData(), fetchRecipes(), fetchUsers()]).finally(() => {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(false);
    });
  }, []);



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

  const handleToggleRole = async (userId: number, currentRole: string) => {
    if (!confirm(`Are you sure you want to change this user's role?`)) return;
    const newRole = currentRole === "admin" ? "user" : "admin";
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        toast.success(`Role updated to ${newRole}`);
        setUsers(users.map(u => u.user_id === userId ? { ...u, role: newRole } : u));
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update role");
      }
    } catch {
      toast.error("Failed to update role");
    }
  };

  if (isLoading) {
    return <div className="text-center py-10 text-text-secondary">Loading Admin Dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
        {[
          { label: "Total Users", value: metrics.totalUsers, icon: <FiUsers /> },
          { label: "Total Recipes", value: metrics.totalRecipes, icon: <FiBookOpen /> },
          { label: "AI Chats", value: metrics.totalChats, icon: <FiMessageSquare /> },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-bg-surface border border-text-secondary/10 rounded-2xl p-6 shadow-sm flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-2xl text-brand-primary">
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-text-secondary">{stat.label}</p>
              <h4 className="text-2xl font-bold text-text-primary font-heading">{stat.value}</h4>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Admin Sub-navigation (Segmented Pills) */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 p-1 bg-bg-surface border border-text-secondary/10 rounded-xl">
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold transition-all text-sm ${activeTab === "settings" ? "bg-brand-primary text-white shadow-md" : "text-text-secondary hover:bg-text-secondary/5 hover:text-text-primary"}`}
        >
          <FiSettings className="shrink-0" /> 
          <span className="hidden sm:inline">AI Settings</span>
          <span className="sm:hidden">Settings</span>
        </button>
        <button
          onClick={() => setActiveTab("recipes")}
          className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold transition-all text-sm ${activeTab === "recipes" ? "bg-brand-primary text-white shadow-md" : "text-text-secondary hover:bg-text-secondary/5 hover:text-text-primary"}`}
        >
          <FiBookOpen className="shrink-0" /> 
          <span className="hidden sm:inline">Manage Recipes</span>
          <span className="sm:hidden">Recipes</span>
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold transition-all text-sm ${activeTab === "users" ? "bg-brand-primary text-white shadow-md" : "text-text-secondary hover:bg-text-secondary/5 hover:text-text-primary"}`}
        >
          <FiUsers className="shrink-0" /> 
          <span className="hidden sm:inline">Manage Users</span>
          <span className="sm:hidden">Users</span>
        </button>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === "settings" && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-bg-surface border border-text-secondary/10 rounded-2xl p-8 shadow-sm"
          >
            <div className="mb-6 border-b border-text-secondary/10 pb-4">
              <h3 className="font-heading text-xl font-bold text-text-primary">AI Provider Configuration</h3>
              <p className="text-text-secondary text-sm">Configuration is managed via server environment variables (.env file).</p>
            </div>

            <div className="space-y-5 max-w-2xl">
              <div className="flex items-center justify-between p-4 bg-bg-default rounded-xl border border-text-secondary/10">
                <div>
                  <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Active Provider</p>
                  <p className="text-lg font-bold text-text-primary capitalize mt-1">{provider}</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${apiKey ? "bg-green-500 shadow-green-500/50 shadow-md" : "bg-red-500 shadow-red-500/50 shadow-md"}`} title={apiKey ? "API Key Configured" : "No API Key"} />
              </div>

              {baseUrl && (
                <div className="p-4 bg-bg-default rounded-xl border border-text-secondary/10">
                  <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Base URL</p>
                  <p className="text-sm font-mono text-text-primary mt-1 break-all">{baseUrl}</p>
                </div>
              )}

              {modelName && (
                <div className="p-4 bg-bg-default rounded-xl border border-text-secondary/10">
                  <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Model</p>
                  <p className="text-sm font-mono text-text-primary mt-1">{modelName}</p>
                </div>
              )}

              <div className="p-4 bg-bg-default rounded-xl border border-text-secondary/10">
                <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">API Key</p>
                <p className={`text-sm font-bold mt-1 ${apiKey ? "text-green-600" : "text-red-500"}`}>
                  {apiKey ? "✓ Configured (from server environment)" : "✗ Not configured — add to .env file"}
                </p>
              </div>

              <p className="text-xs text-text-secondary/60 italic pt-2">
                To change these settings, update the environment variables on the server and restart.
              </p>
            </div>
          </motion.div>
        )}

        {activeTab === "recipes" && (
          <motion.div
            key="recipes"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="bg-bg-surface border border-text-secondary/10 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-text-secondary/5 border-b border-text-secondary/10">
                      <th className="p-4 font-bold text-sm text-text-secondary uppercase">Recipe</th>
                      <th className="p-4 font-bold text-sm text-text-secondary uppercase">Author</th>
                      <th className="p-4 font-bold text-sm text-text-secondary uppercase">Status</th>
                      <th className="p-4 font-bold text-sm text-text-secondary uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recipes.map((recipe) => (
                      <tr key={recipe.recipe_id} className="border-b border-text-secondary/5 hover:bg-text-secondary/5 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 relative rounded-lg overflow-hidden shrink-0">
                              <Image src={recipe.image_url || "/images/placeholder-1.jpg"} alt="" fill className="object-cover" />
                            </div>
                            <Link href={`/recipe/${recipe.recipe_id}`} className="font-bold text-text-primary hover:text-brand-primary truncate max-w-xs">
                              {recipe.title}
                            </Link>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-text-secondary">
                          {recipe.owner?.username || "Platform"}
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${recipe.is_private ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-600"}`}>
                            {recipe.is_private ? "Private" : "Public"}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/recipe/${recipe.recipe_id}/edit`}
                              className="p-2 text-text-secondary hover:text-brand-primary transition-colors"
                              title="Edit"
                            >
                              <FiEdit2 />
                            </Link>
                            <button
                              onClick={() => handleDeleteRecipe(recipe.recipe_id)}
                              className="p-2 text-text-secondary hover:text-red-500 transition-colors"
                              title="Delete"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {recipes.length === 0 && <div className="p-8 text-center text-text-secondary">No recipes found.</div>}
            </div>
            
            {recipesPage < recipesTotalPages && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => fetchRecipes(recipesPage + 1)}
                  className="px-6 py-2.5 bg-bg-surface border border-text-secondary/20 rounded-full font-bold text-text-secondary hover:text-brand-primary transition-colors"
                >
                  Load More
                </button>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "users" && (
          <motion.div
            key="users"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="bg-bg-surface border border-text-secondary/10 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-text-secondary/5 border-b border-text-secondary/10">
                      <th className="p-4 font-bold text-sm text-text-secondary uppercase">User</th>
                      <th className="p-4 font-bold text-sm text-text-secondary uppercase">Email</th>
                      <th className="p-4 font-bold text-sm text-text-secondary uppercase">Joined</th>
                      <th className="p-4 font-bold text-sm text-text-secondary uppercase">Role</th>
                      <th className="p-4 font-bold text-sm text-text-secondary uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.user_id} className="border-b border-text-secondary/5 hover:bg-text-secondary/5 transition-colors">
                        <td className="p-4 font-bold text-text-primary">{u.username}</td>
                        <td className="p-4 text-sm text-text-secondary">{u.email}</td>
                        <td className="p-4 text-sm text-text-secondary">{new Date(u.created_at).toLocaleDateString()}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${u.role === "admin" ? "bg-brand-primary/10 text-brand-primary" : "bg-text-secondary/10 text-text-secondary"}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleToggleRole(u.user_id, u.role)}
                            className="px-3 py-1.5 text-xs font-bold border border-text-secondary/20 rounded-lg hover:bg-text-secondary/10 transition-colors flex items-center justify-center ml-auto gap-1"
                          >
                            <FiShield /> {u.role === "admin" ? "Demote" : "Promote"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {users.length === 0 && <div className="p-8 text-center text-text-secondary">No users found.</div>}
            </div>
            
            {usersPage < usersTotalPages && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => fetchUsers(usersPage + 1)}
                  className="px-6 py-2.5 bg-bg-surface border border-text-secondary/20 rounded-full font-bold text-text-secondary hover:text-brand-primary transition-colors"
                >
                  Load More
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
