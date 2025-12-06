"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useAuth } from "@/lib/useAuth";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string>("user");
  const [forceAccountSwitch, setForceAccountSwitch] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/calendar";

  useEffect(() => {
    if (!loading && user && !forceAccountSwitch) {
      router.replace(next);
    }
  }, [loading, user, router, next, forceAccountSwitch]);

  const handleGoogle = async () => {
    // Save selected role to localStorage or sessionStorage for later use
    if (selectedRole) {
      sessionStorage.setItem("pendingRole", selectedRole);
    }
    // Force account selection by adding prompt parameter
    googleProvider.setCustomParameters({ prompt: "select_account" });
    await signInWithPopup(auth, googleProvider);
    // If a pendingRole is set, try to persist it server-side for this user
    try {
      const role = sessionStorage.getItem("pendingRole");
      if (role && auth.currentUser?.uid) {
        await fetch("/api/roles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: auth.currentUser.uid, role }),
        });
        sessionStorage.removeItem("pendingRole");
      }
    } catch (err) {
      // ignore failures to set role — the user's auth should still work
      console.error("Failed to set pending role:", err);
    }
    setForceAccountSwitch(false);
    router.replace(next);
  };

  const handleSwitchAccount = async () => {
    await signOut(auth);
    setForceAccountSwitch(true);
    // Reset the provider to require account selection
    googleProvider.setCustomParameters({ prompt: "select_account" });
  };

  // Show switch account option if already logged in and we're on login page
  if (!loading && user && forceAccountSwitch) {
    return (
      <main className="min-h-screen grid place-items-center bg-gradient-to-r from-pink-500 to-amber-300">
        <div className="bg-white/85 p-8 rounded-2xl shadow-xl text-center space-y-6">
          <h1 className="text-3xl font-black">REPS N RECORD</h1>
          <div className="space-y-4">
            <p className="text-gray-700">
              You're currently signed in as: <span className="font-semibold">{user.email}</span>
            </p>
            <div>
              <label className="block mb-2 font-semibold text-pink-700">Login as:</label>
              <div className="flex justify-center gap-4">
                <button
                  className={`px-4 py-2 rounded-lg border font-semibold transition-colors ${selectedRole === "user" ? "bg-pink-500 text-white border-pink-500" : "bg-white text-pink-700 border-pink-300 hover:bg-pink-50"}`}
                  onClick={() => setSelectedRole("user")}
                  aria-pressed={selectedRole === "user"}
                >
                  User
                </button>
                <button
                  className={`px-4 py-2 rounded-lg border font-semibold transition-colors ${selectedRole === "trainer" ? "bg-pink-500 text-white border-pink-500" : "bg-white text-pink-700 border-pink-300 hover:bg-pink-50"}`}
                  onClick={() => setSelectedRole("trainer")}
                  aria-pressed={selectedRole === "trainer"}
                >
                  Trainer
                </button>
              </div>
            </div>
            <button
              onClick={handleGoogle}
              className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-xl font-semibold shadow w-full"
            >
              Continue with This Account
            </button>
            <button
              onClick={async () => {
                await signOut(auth);
                setForceAccountSwitch(false);
              }}
              className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-xl font-semibold shadow w-full"
            >
              Logout & Select Different Account
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen grid place-items-center bg-gradient-to-r from-pink-500 to-amber-300">
      <div className="bg-white/85 p-8 rounded-2xl shadow-xl text-center space-y-6">
        <h1 className="text-3xl font-black">REPS N RECORD</h1>
        {user && (
          <div className="space-y-3 text-sm">
            <p className="text-gray-700">
              Currently signed in as: <span className="font-semibold">{user.email}</span>
            </p>
            <button
              onClick={handleSwitchAccount}
              className="text-pink-600 hover:text-pink-700 font-semibold underline"
            >
              Switch to a different account →
            </button>
          </div>
        )}
        <div className="space-y-4">
          {!user && (
            <>
              <div>
                <label className="block mb-2 font-semibold text-pink-700">Login as:</label>
                <div className="flex justify-center gap-4">
                  <button
                    className={`px-4 py-2 rounded-lg border font-semibold transition-colors ${selectedRole === "user" ? "bg-pink-500 text-white border-pink-500" : "bg-white text-pink-700 border-pink-300 hover:bg-pink-50"}`}
                    onClick={() => setSelectedRole("user")}
                    aria-pressed={selectedRole === "user"}
                  >
                    User
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg border font-semibold transition-colors ${selectedRole === "trainer" ? "bg-pink-500 text-white border-pink-500" : "bg-white text-pink-700 border-pink-300 hover:bg-pink-50"}`}
                    onClick={() => setSelectedRole("trainer")}
                    aria-pressed={selectedRole === "trainer"}
                  >
                    Trainer
                  </button>
                </div>
              </div>
              <button
                onClick={handleGoogle}
                className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-xl font-semibold shadow w-full"
              >
                Continue with Google
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
