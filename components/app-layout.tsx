"use client";

import { useAuth } from "./auth-provider";
import { Sidebar } from "./sidebar";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && pathname !== '/login') {
      router.push('/login');
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!user && pathname !== '/login') {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
      {user && <Sidebar />}
      <div className="flex-1 flex flex-col overflow-y-auto w-full">
        {children}
      </div>
    </div>
  );
}
