"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

export function useAuth() {
  // user = undefined means "still checking"
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser); // either a User object or null
    });
    return () => unsubscribe();
  }, []);

  return {
    user,
    loading: user === undefined,
  };
}
