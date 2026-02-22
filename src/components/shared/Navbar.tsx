"use client";

import Link from "next/link";
import {
  Heart,
  LogOut,
  Menu,
  User as UserIcon,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";

const isDemo = !process.env.NEXT_PUBLIC_SUPABASE_URL;

interface NavbarProps {
  userEmail?: string | null;
}

export function Navbar({ userEmail }: NavbarProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Dark mode toggle
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function cycleTheme() {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  }

  const ThemeIcon = !mounted
    ? Sun
    : theme === "dark"
      ? Moon
      : theme === "light"
        ? Sun
        : Monitor;

  // Click-outside and Escape key handler for dropdown
  useEffect(() => {
    if (!menuOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  async function handleSignOut() {
    if (isDemo) {
      router.push("/");
      return;
    }
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-surface-200 bg-white/80 backdrop-blur-xl dark:border-surface-700 dark:bg-surface-950/80">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link
          href={userEmail ? "/chat" : "/"}
          className="flex items-center gap-2 text-lg font-semibold font-serif text-calm-dark dark:text-calm-light"
        >
          <Heart className="h-5 w-5 text-warmth-500" fill="currentColor" />
          Soulful Connections
        </Link>

        <div className="flex items-center gap-2">
          {/* Dark Mode Toggle */}
          <button
            onClick={cycleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-full text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-700 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-200"
            aria-label={`Switch theme (current: ${mounted ? theme : "loading"})`}
            title={`Theme: ${mounted ? theme : "loading"}`}
          >
            <ThemeIcon className="h-4 w-4" />
          </button>

          {userEmail ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 rounded-full px-3 py-2 text-sm text-surface-600 transition-colors hover:bg-surface-100 dark:text-surface-300 dark:hover:bg-surface-800"
              >
                <UserIcon className="h-4 w-4" />
                <span className="hidden sm:inline">{userEmail}</span>
                <Menu className="h-4 w-4 sm:hidden" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-surface-200 bg-white p-1 shadow-lg dark:border-surface-700 dark:bg-surface-900">
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-surface-700 hover:bg-surface-100 dark:text-surface-300 dark:hover:bg-surface-800"
                    onClick={() => setMenuOpen(false)}
                  >
                    <UserIcon className="h-4 w-4" />
                    Profile
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-warmth-dark hover:bg-warmth-50 dark:hover:bg-surface-800"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="rounded-full px-4 py-2 text-sm font-medium text-surface-600 transition-colors hover:text-calm-dark dark:text-surface-300 dark:hover:text-calm-light"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-calm px-4 py-2 text-sm font-semibold text-calm-foreground shadow-lg shadow-calm/25 transition-all hover:bg-calm-dark hover:shadow-calm/40"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
