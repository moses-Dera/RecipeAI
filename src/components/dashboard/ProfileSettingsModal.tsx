"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/ToastContext";
import { FiTrash } from "react-icons/fi";
import { signOut, useSession } from "next-auth/react";

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileSettingsModal({ isOpen, onClose }: ProfileSettingsModalProps) {
  const { data: session } = useSession();
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const toast = useToast();

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
    <Modal isOpen={isOpen} onClose={onClose} title="Profile Settings" maxWidth="max-w-2xl">
      <div className="space-y-6">
        <div className="bg-bg-surface rounded-2xl">
          <p className="text-text-secondary mb-6">Update your personal information.</p>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Display Name</label>
              <input type="text" className="w-full px-4 py-2 rounded-xl border border-text-secondary/20 bg-bg-default text-text-primary" defaultValue={session?.user?.name || ""} />
            </div>
            <button className="bg-brand-primary text-white px-6 py-2 rounded-xl font-medium hover:bg-brand-secondary transition-colors">Save Changes</button>
          </div>
        </div>

        <div className="bg-bg-surface border border-red-500/20 rounded-2xl p-6 shadow-sm mt-8">
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
    </Modal>
  );
}
