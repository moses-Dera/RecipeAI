"use client";

import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import AdminPanel from "@/components/dashboard/AdminPanel";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated" || (status === "authenticated" && session?.user?.role !== "admin")) {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  if (status === "loading" || session?.user?.role !== "admin") {
    return <div className="p-8 text-center text-text-secondary">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 pb-8 max-w-7xl animation-fade-in">
      <div className="mb-4">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-text-secondary hover:text-brand-primary transition-colors mb-4 font-medium"
        >
          <FiArrowLeft /> Back to Dashboard
        </Link>
        <h1 className="font-heading text-3xl font-bold text-text-primary capitalize">
          Admin Control Panel
        </h1>
        <p className="text-text-secondary mt-2">
          Manage system settings, AI providers, and platform metrics.
        </p>
      </div>

      <AdminPanel />
    </div>
  );
}
