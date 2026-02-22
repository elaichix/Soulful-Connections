import Link from "next/link";
import { Heart, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-surface-50 px-4 text-center dark:bg-surface-950">
      <Heart className="mb-6 h-16 w-16 text-calm-300 dark:text-calm-700" />
      <h1 className="mb-2 font-serif text-4xl font-bold text-surface-800 dark:text-surface-100">
        Page not found
      </h1>
      <p className="mb-8 max-w-md text-surface-500 dark:text-surface-400">
        It looks like this page doesn&apos;t exist. Let&apos;s get you back to a
        safe space.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-full bg-calm px-6 py-3 text-sm font-semibold text-calm-foreground shadow-lg shadow-calm/25 transition-all hover:bg-calm-dark hover:shadow-calm/40"
      >
        <ArrowLeft className="h-4 w-4" />
        Go Home
      </Link>
    </div>
  );
}
