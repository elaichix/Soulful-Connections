"use client";

import { useRef, useEffect } from "react";
import { Send, Mic, Keyboard } from "lucide-react";
import type { VoiceMode } from "@/types/voice";

interface ChatInputProps {
  input: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  voiceMode: VoiceMode;
  onToggleVoiceMode: () => void;
}

export function ChatInput({
  input,
  onChange,
  onSubmit,
  isLoading,
  voiceMode,
  onToggleVoiceMode,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 160) + "px";
    }
  }, [input]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        onSubmit(e as unknown as React.FormEvent);
      }
    }
  }

  // When in voice mode, only show the toggle button to switch back to text
  if (voiceMode === "voice") {
    return null;
  }

  return (
    <div className="border-t border-surface-200 bg-white/80 backdrop-blur-xl p-4 dark:border-surface-700 dark:bg-surface-950/80">
      <form
        onSubmit={onSubmit}
        className="mx-auto flex max-w-3xl items-end gap-3"
      >
        {/* Voice mode toggle */}
        <button
          type="button"
          onClick={onToggleVoiceMode}
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-surface-200 bg-surface-50 text-surface-500 transition-all hover:border-calm hover:text-calm dark:border-surface-600 dark:bg-surface-800 dark:text-surface-400 dark:hover:border-calm dark:hover:text-calm"
          aria-label="Switch to voice mode"
          title="Switch to voice mode"
        >
          <Mic className="h-4 w-4" />
        </button>

        <textarea
          ref={textareaRef}
          value={input}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          placeholder="Share what's on your mind..."
          disabled={isLoading}
          rows={1}
          className="flex-1 resize-none rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm text-surface-800 placeholder:text-surface-400 focus:border-calm focus:outline-none focus:ring-2 focus:ring-calm/20 disabled:opacity-50 dark:border-surface-600 dark:bg-surface-800 dark:text-surface-100 dark:placeholder:text-surface-500"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-calm text-calm-foreground shadow-lg shadow-calm/25 transition-all hover:bg-calm-dark hover:shadow-calm/40 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
