"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

export function useAuth() {
  // user = undefined means "still checking"
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [role, setRole] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser); // either a User object or null
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // When user is authenticated, fetch their role via our API
    if (!user) {
      setRole(null);
      return;
    }
    const fetchRole = async () => {
      try {
        const res = await fetch(`/api/me?userId=${user.uid}`);
        if (!res.ok) {
          // Fallback to any pending role selected before login (sessionStorage)
          const pending = typeof window !== 'undefined' ? sessionStorage.getItem('pendingRole') : null;
          setRole(pending ?? null);
          return;
        }
        const json = await res.json();
        // If server doesn't report a role yet, use pending role if present
        const pending = typeof window !== 'undefined' ? sessionStorage.getItem('pendingRole') : null;
        setRole(json?.role ?? pending ?? null);
      } catch (e) {
        const pending = typeof window !== 'undefined' ? sessionStorage.getItem('pendingRole') : null;
        setRole(pending ?? null);
      }
    };
    fetchRole();
  }, [user]);

  return {
    user,
    loading: user === undefined || role === undefined,
    role,
  };
}
