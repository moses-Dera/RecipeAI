"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { FiTrash } from "react-icons/fi";
import { useToast } from "@/components/ui/ToastContext";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { data: session } = useSession();
  const toast = useToast();
  const router = useRouter();
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const [username, setUsername] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const { update } = useSession();

  // Initialize username when session loads
  useEffect(() => {
    if (session?.user?.name) {
      setUsername(session.user.name);
    }
  }, [session]);

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      if (res.ok) {
        toast.success("Profile updated successfully.");
        update({ name: username }); // Update next-auth session
      } else {
        toast.error("Failed to update profile.");
      }
    } catch (e) {
      toast.error("Error updating profile.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") return;
    setIsDeletingAccount(true);
    try {
      const res = await fetch("/api/user/delete", { method: "DELETE" });
      if (res.ok) {
        toast.success("Account deleted successfully.");
        await signOut({ redirect: false });
        router.push("/");
      } else {
        toast.error("Failed to delete account.");
      }
    } catch (e) {
      toast.error("Error deleting account.");
    } finally {
      setIsDeletingAccount(false);
    }
  };

  if (!session) {
    return <div className="text-center py-20 text-text-secondary">Please log in to view settings.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 w-full animation-fade-in space-y-6">
      <header className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-text-primary">
          Settings
        </h1>
        <p className="text-text-secondary mt-2">
          Manage your account preferences and personal information.
        </p>
      </header>

      <div className="bg-bg-surface border border-text-secondary/10 rounded-2xl p-6 shadow-sm">
        <h3 className="font-heading text-xl font-bold mb-4">Profile Settings</h3>
        <p className="text-text-secondary mb-6">Update your personal information.</p>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Display Name</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 rounded-xl border border-text-secondary/20 bg-bg-default text-text-primary" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <button 
            onClick={handleUpdateProfile}
            disabled={isUpdating}
            className="bg-brand-primary text-white px-6 py-2 rounded-xl font-medium hover:bg-brand-secondary transition-colors disabled:opacity-50"
          >
            {isUpdating ? "Saving..." : "Save Changes"}
          </button>
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
  );
}
