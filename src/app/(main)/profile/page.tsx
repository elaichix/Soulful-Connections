"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { User, Heart, Palette, Save, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Profile } from "@/types";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [companionName, setCompanionName] = useState("");
  const [moodPref, setMoodPref] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      if (!supabase) {
        setEmail("Demo User");
        setLoading(false);
        return;
      }
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setEmail(user.email ?? null);

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data);
        setDisplayName(data.display_name || "");
        setCompanionName(data.companion_name || "");
        setMoodPref(data.mood_pref || "");
      }

      setLoading(false);
    }
    loadProfile();
  }, [router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const supabase = createClient();
    if (!supabase) {
      setMessage("Profile saving is not available in demo mode.");
      setSaving(false);
      return;
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim() || null,
        companion_name: companionName.trim() || null,
        mood_pref: moodPref.trim() || null,
      })
      .eq("id", user.id);

    if (error) {
      setMessage("Failed to save. Please try again.");
    } else {
      setMessage("Profile updated successfully!");
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex h-dvh items-center justify-center bg-surface-50 dark:bg-surface-950">
        <Loader2 className="h-8 w-8 animate-spin text-calm" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col bg-surface-50 dark:bg-surface-950">
      <Navbar userEmail={email} />

      <main className="flex-1 px-4 py-8">
        <div className="mx-auto max-w-xl">
          <Link
            href="/chat"
            className="mb-6 inline-flex items-center gap-2 text-sm text-surface-500 hover:text-calm-dark dark:text-surface-400 dark:hover:text-calm-light"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Chat
          </Link>

          <h1 className="mb-8 font-serif text-3xl font-bold text-surface-800 dark:text-surface-100">
            Your Profile
          </h1>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Display Name */}
            <div>
              <label
                htmlFor="displayName"
                className="mb-1.5 flex items-center gap-2 text-sm font-medium text-surface-700 dark:text-surface-300"
              >
                <User className="h-4 w-4" />
                Display Name
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="How should we address you?"
                className="w-full rounded-xl border border-surface-200 bg-white px-4 py-3 text-sm text-surface-800 placeholder:text-surface-400 focus:border-calm focus:outline-none focus:ring-2 focus:ring-calm/20 dark:border-surface-600 dark:bg-surface-800 dark:text-surface-100"
              />
            </div>

            {/* Companion Name */}
            <div>
              <label
                htmlFor="companionName"
                className="mb-1.5 flex items-center gap-2 text-sm font-medium text-surface-700 dark:text-surface-300"
              >
                <Heart className="h-4 w-4" />
                Companion Name
              </label>
              <input
                id="companionName"
                type="text"
                value={companionName}
                onChange={(e) => setCompanionName(e.target.value)}
                placeholder="Give your AI companion a name (optional)"
                className="w-full rounded-xl border border-surface-200 bg-white px-4 py-3 text-sm text-surface-800 placeholder:text-surface-400 focus:border-calm focus:outline-none focus:ring-2 focus:ring-calm/20 dark:border-surface-600 dark:bg-surface-800 dark:text-surface-100"
              />
              <p className="mt-1 text-xs text-surface-400">
                Your companion will respond to this name in conversations.
              </p>
            </div>

            {/* Mood Preference */}
            <div>
              <label
                htmlFor="moodPref"
                className="mb-1.5 flex items-center gap-2 text-sm font-medium text-surface-700 dark:text-surface-300"
              >
                <Palette className="h-4 w-4" />
                Mood Preference
              </label>
              <select
                id="moodPref"
                value={moodPref}
                onChange={(e) => setMoodPref(e.target.value)}
                className="w-full rounded-xl border border-surface-200 bg-white px-4 py-3 text-sm text-surface-800 focus:border-calm focus:outline-none focus:ring-2 focus:ring-calm/20 dark:border-surface-600 dark:bg-surface-800 dark:text-surface-100"
              >
                <option value="">Let the companion decide</option>
                <option value="uplifting">Uplifting & Encouraging</option>
                <option value="calm">Calm & Soothing</option>
                <option value="playful">Playful & Light-hearted</option>
                <option value="thoughtful">Thoughtful & Reflective</option>
              </select>
            </div>

            {message && (
              <div
                className={`rounded-lg px-4 py-3 text-sm ${
                  message.includes("success")
                    ? "bg-calm-50 text-calm-700 dark:bg-calm-900/30 dark:text-calm-300"
                    : "bg-warmth-50 text-warmth-dark dark:bg-warmth-dark/10 dark:text-warmth-300"
                }`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-calm px-6 py-3 text-sm font-semibold text-calm-foreground shadow-lg shadow-calm/25 transition-all hover:bg-calm-dark hover:shadow-calm/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
