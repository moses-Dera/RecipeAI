"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import AuthModal from "@/components/auth/AuthModal";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { NavbarSearch } from "./NavbarSearch";
import ChefAdaDrawer from "@/components/chat/ChefAdaDrawer";
import { FiUser, FiMessageCircle, FiGrid, FiLogOut, FiSettings, FiShield } from "react-icons/fi";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";

export function Navbar() {
  const { data: session } = useSession();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAdaDrawerOpen, setIsAdaDrawerOpen] = useState(false);
  
  // Smart Navbar Hide/Show on Scroll
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150) {
      setHidden(true); // Scrolling down, hide
    } else {
      setHidden(false); // Scrolling up, show
    }
  });

  return (
    <>
      <motion.nav 
        variants={{
          visible: { y: 0, opacity: 1 },
          hidden: { y: "-100%", opacity: 0 }
        }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="sticky top-0 z-50 w-full backdrop-blur-md bg-bg-surface/80 border-b border-text-secondary/10 shadow-sm"
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-brand-primary/20 group-hover:border-brand-primary transition-colors shrink-0">
              <Image 
                src="/images/chef_ada_avatar.jpg" 
                alt="RecipeAI Logo" 
                fill 
                className="object-cover"
              />
            </div>
            <span className="hidden sm:block font-heading font-bold text-2xl text-brand-primary">
              RecipeAI
            </span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-8">
            <ThemeToggle />
            <NavbarSearch />
          </div>

          <div className="flex items-center gap-2 sm:space-x-4">
            {session ? (
              <div className="flex items-center gap-2 sm:gap-4">
                <Link href="/dashboard" className="flex items-center justify-center w-10 h-10 sm:w-auto sm:h-auto sm:bg-transparent bg-text-secondary/10 rounded-full text-text-secondary hover:text-brand-primary font-medium text-sm transition-colors" title="Dashboard">
                  <FiGrid className="sm:hidden text-lg" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <Link href="/settings" className="flex items-center justify-center w-10 h-10 sm:w-auto sm:h-auto sm:bg-transparent bg-text-secondary/10 rounded-full text-text-secondary hover:text-brand-primary font-medium text-sm transition-colors" title="Settings">
                  <FiSettings className="sm:hidden text-lg" />
                  <span className="hidden sm:inline">Settings</span>
                </Link>
                {session?.user?.role === "admin" && (
                  <Link href="/admin" className="flex items-center justify-center w-10 h-10 sm:w-auto sm:h-auto sm:bg-transparent bg-brand-primary/10 rounded-full text-brand-primary hover:text-red-500 font-medium text-sm transition-colors" title="Admin Control Panel">
                    <FiShield className="sm:hidden text-lg" />
                    <span className="hidden sm:inline font-bold">Admin</span>
                  </Link>
                )}
                <div className="flex items-center justify-center w-10 h-10 sm:w-auto sm:h-auto sm:px-3 sm:py-1.5 gap-2 bg-text-secondary/10 rounded-full cursor-pointer group" onClick={() => signOut()} title="Log out">
                  <FiLogOut className="sm:hidden text-brand-primary text-lg" />
                  <FiUser className="hidden sm:block text-brand-primary" />
                  <span className="hidden sm:inline text-sm font-bold text-text-primary group-hover:text-red-500 transition-colors">
                    Log out
                  </span>
                </div>
              </div>
            ) : (
              <>
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-text-secondary hover:text-brand-primary transition-colors font-medium text-sm hidden sm:block"
                >
                  Log In
                </button>
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="bg-brand-primary text-white px-4 py-2 rounded-full font-medium text-sm hover:scale-105 active:scale-95 transition-all shadow-orange-500/20 shadow-lg"
                >
                  Sign Up
                </button>
              </>
            )}
            
            {/* Ask Chef Ada Button */}
            <button
              onClick={() => setIsAdaDrawerOpen(true)}
              className="flex items-center justify-center w-10 h-10 sm:w-auto sm:h-auto sm:px-4 sm:py-2 gap-2 bg-text-secondary/10 hover:bg-brand-primary/10 text-text-primary hover:text-brand-primary rounded-full transition-colors font-bold text-sm shadow-sm sm:ml-2"
              title="Ask Ada"
            >
              <FiMessageCircle size={18} />
              <span className="hidden sm:inline">Ask Ada</span>
            </button>
          </div>
        </div>
      </motion.nav>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />

      <ChefAdaDrawer 
        isOpen={isAdaDrawerOpen} 
        onClose={() => setIsAdaDrawerOpen(false)} 
      />
    </>
  );
}
