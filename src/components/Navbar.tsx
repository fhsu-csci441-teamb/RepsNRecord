"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/calendar", label: "Calendar" },
  { href: "/log", label: "Workout Log" },
  { href: "/progress", label: "Progress" },
  { href: "/pictures", label: "Pictures" },
  { href: "/login", label: "Login" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-pink-500 to-amber-300 shadow-md">
      <h1 className="text-2xl font-black text-white tracking-wide">REPS N RECORD</h1>

      <ul className="flex gap-6">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={`text-white font-semibold hover:underline underline-offset-4 ${
                pathname === link.href ? "underline" : ""
              }`}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
