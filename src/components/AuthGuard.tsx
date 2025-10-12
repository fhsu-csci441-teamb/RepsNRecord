// src/components/AuthGuard.tsx
"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/useAuth";

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // If not loading and no user, kick to /login (preserve where they tried to go)
  useEffect(() => {
    if (!loading && !user) {
      const next = encodeURIComponent(pathname || "/calendar");
      router.replace(`/login?next=${next}`);
    }
  }, [loading, user, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="animate-pulse text-sm text-neutral-500">Checking session…</div>
      </div>
    );
  }

  if (!user) return null; // redirecting

  return <>{children}</>;
}
