"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { useAuth } from "@/lib/useAuth";

const defaultLinks = [
  { href: "/calendar", label: "Calendar" },
  { href: "/log", label: "Workout Log" },
  { href: "/progress", label: "Progress" },
  { href: "/pictures", label: "Pictures" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, role } = useAuth();
  const isTrainer = role === "trainer";

  const linksToRender = useMemo(() => {
    const links = [...defaultLinks];
    if (isTrainer) {
      links.splice(3, 0, { href: "/trainer", label: "Trainer" });
    }
    if (!user) {
      links.push({ href: "/login", label: "Login" });
    } else {
      links.push({ href: "/preferences", label: "Preferences" });
      links.push({ href: "#signout", label: "Sign out", onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        import("firebase/auth").then(({ signOut }) => {
          import("@/lib/firebase").then(({ auth }) => {
            signOut(auth);
            window.location.href = "/login";
          });
        });
      }});
    }
    return links;
  }, [isTrainer, user]);

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-pink-500 to-amber-300 shadow-md">
      <h1 className="text-2xl font-black text-white tracking-wide">REPS N RECORD</h1>

      <ul className="flex gap-6 items-center">
        {linksToRender.map((link) => (
          <li key={link.href}>
            {link.onClick ? (
              <a
                href={link.href}
                onClick={link.onClick}
                className={`text-white font-semibold hover:underline underline-offset-4`}
              >
                {link.label}
              </a>
            ) : (
              <Link
                href={link.href}
                className={`text-white font-semibold hover:underline underline-offset-4 ${
                  pathname === link.href ? "underline" : ""
                }`}
              >
                {link.label}
              </Link>
            )}
          </li>
        ))}
        {user && (
          <li>
            <span className="ml-2 px-3 py-1 rounded-full bg-white/30 text-white text-xs font-bold border border-white/40">
              Role: {role ? role : "user"}
            </span>
          </li>
        )}
      </ul>
    </nav>
  );
}
