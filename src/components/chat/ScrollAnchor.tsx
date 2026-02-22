"use client";

import { ArrowDown } from "lucide-react";

interface ScrollAnchorProps {
  visible: boolean;
  onClick: () => void;
}

export function ScrollAnchor({ visible, onClick }: ScrollAnchorProps) {
  if (!visible) return null;

  return (
    <button
      onClick={onClick}
      className="absolute bottom-20 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-surface-200 bg-white shadow-lg transition-all hover:bg-surface-50 dark:border-surface-600 dark:bg-surface-800 dark:hover:bg-surface-700 animate-fade-in"
      aria-label="Scroll to bottom"
    >
      <ArrowDown className="h-4 w-4 text-surface-600 dark:text-surface-300" />
    </button>
  );
}
