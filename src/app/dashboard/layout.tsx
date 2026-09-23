"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiBookOpen, FiHeart, FiSettings, FiShield } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";
import { useSession } from "next-auth/react";
import { Suspense } from "react";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "recipes";

  const userRole = (session?.user as any)?.role || "user";
  const userName = session?.user?.name || "User";

  const navItems = [
    { id: "recipes", label: "My Recipes", icon: <FiBookOpen /> },
    { id: "saved", label: "Saved Recipes", icon: <FiHeart /> },
  ];

  return (
    <div className="flex min-h-[calc(100vh-8rem)] bg-bg-default rounded-2xl overflow-hidden shadow-sm border border-text-secondary/10">
      {/* Sidebar */}
      <aside className="w-64 hidden md:flex flex-col border-r border-text-secondary/10 bg-bg-surface p-6">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center text-3xl">
            <FaUserCircle className="text-brand-primary" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-lg text-text-primary">{userName}</h2>
            <p className="text-xs text-text-secondary capitalize">{userRole} Account</p>
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
      <main className="flex-1 p-4 md:p-8 relative">
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
