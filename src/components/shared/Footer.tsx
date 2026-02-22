import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-surface-200 bg-surface-50 py-8 dark:border-surface-800 dark:bg-surface-950">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-surface-500">
            <Heart className="h-4 w-4 text-warmth-500" fill="currentColor" />
            <span>Soulful Connections</span>
          </div>
          <p className="text-xs text-surface-400">
            &copy; {new Date().getFullYear()} Soulful Connections. You are never
            alone.
          </p>
        </div>
      </div>
    </footer>
  );
}
