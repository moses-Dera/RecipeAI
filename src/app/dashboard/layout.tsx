"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiBookOpen, FiHeart, FiSettings, FiShield } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";

// Mock user session for UI demonstration
const MOCK_USER = {
  name: "Chef Ada",
  role: "admin", // Change to "user" to test hiding the admin tab
};

import { Suspense } from "react";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "recipes";

  const navItems = [
    { id: "recipes", label: "My Recipes", icon: <FiBookOpen /> },
    { id: "saved", label: "Saved Recipes", icon: <FiHeart /> },
    { id: "settings", label: "Settings", icon: <FiSettings /> },
  ];

  if (MOCK_USER.role === "admin") {
    navItems.push({ id: "admin", label: "Admin Control Panel", icon: <FiShield /> });
  }

  return (
    <div className="flex h-screen bg-bg-default pt-20">
      {/* Sidebar */}
      <aside className="w-64 hidden md:flex flex-col border-r border-text-secondary/10 bg-bg-surface p-6">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center text-3xl">
            <FaUserCircle className="text-brand-primary" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-lg text-text-primary">{MOCK_USER.name}</h2>
            <p className="text-xs text-text-secondary capitalize">{MOCK_USER.role} Account</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={`/dashboard?tab=${item.id}`}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors relative ${
                activeTab === item.id ? "text-brand-primary" : "text-text-secondary hover:bg-brand-primary/5 hover:text-brand-primary"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {item.label}
              
              {activeTab === item.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute inset-0 bg-brand-primary/10 rounded-xl -z-10"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="text-center py-20 text-text-secondary">Loading Layout...</div>}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  );
}
