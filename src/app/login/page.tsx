"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useAuth } from "@/lib/useAuth";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/calendar";

  useEffect(() => {
    if (!loading && user) {
      router.replace(next);
    }
  }, [loading, user, router, next]);

  const handleGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
    router.replace(next);
  };

  return (
    <main className="min-h-screen grid place-items-center bg-gradient-to-r from-pink-500 to-amber-300">
      <div className="bg-white/85 p-8 rounded-2xl shadow-xl text-center space-y-6">
        <h1 className="text-3xl font-black">REPS N RECORD</h1>
        <button
          onClick={handleGoogle}
          className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-xl font-semibold shadow"
        >
          Continue with Google
        </button>
      </div>
    </main>
  );
}
