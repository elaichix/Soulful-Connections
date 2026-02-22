"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Heart, RefreshCw, ArrowLeft } from "lucide-react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-surface-50 px-4 text-center dark:bg-surface-950">
      <Heart className="mb-6 h-16 w-16 text-warmth-300 dark:text-warmth-500" />
      <h1 className="mb-2 font-serif text-4xl font-bold text-surface-800 dark:text-surface-100">
        Something went wrong
      </h1>
      <p className="mb-8 max-w-md text-surface-500 dark:text-surface-400">
        We hit an unexpected bump. Don&apos;t worry — your conversations are
        safe.
      </p>
      <div className="flex items-center gap-4">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-full bg-calm px-6 py-3 text-sm font-semibold text-calm-foreground shadow-lg shadow-calm/25 transition-all hover:bg-calm-dark hover:shadow-calm/40"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border-2 border-surface-200 bg-white px-6 py-3 text-sm font-semibold text-surface-700 transition-all hover:border-calm-300 hover:text-calm-dark dark:border-surface-700 dark:bg-surface-900 dark:text-surface-300 dark:hover:border-calm dark:hover:text-calm-light"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Home
        </Link>
      </div>
    </div>
  );
}
