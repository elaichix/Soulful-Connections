"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { Copy, Check } from "lucide-react";
import Markdown from "react-markdown";
import { formatRelativeTime } from "@/lib/utils/relative-time";
import type { UIMessage } from "ai";

// Extended type: the chat page sets createdAt when loading from Supabase
type ChatUIMessage = UIMessage & { createdAt?: Date };

interface ChatMessageProps {
  message: ChatUIMessage;
}

function getMessageText(message: ChatUIMessage): string {
  // AI SDK v6 uses parts array; fall back to content string
  if (message.parts && message.parts.length > 0) {
    return message.parts
      .filter((p) => p.type === "text")
      .map((p) => p.text)
      .join("");
  }
  return "";
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const text = getMessageText(message);
  const [copied, setCopied] = useState(false);

  if (!text) return null;

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className={clsx(
        "mb-4 flex px-4 animate-fade-in",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div className="group max-w-[80%] sm:max-w-[70%]">
        <div
          className={clsx(
            isUser
              ? "rounded-2xl rounded-br-md bg-calm px-4 py-3 text-calm-foreground"
              : "rounded-2xl rounded-bl-md border border-surface-100 bg-white px-4 py-3 shadow-sm dark:border-surface-700 dark:bg-surface-800"
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {text}
            </p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
              <Markdown>{text}</Markdown>
            </div>
          )}
        </div>

        {/* Metadata row: timestamp + copy button */}
        <div
          className={clsx(
            "mt-1 flex items-center gap-2 px-1 text-xs text-surface-400 dark:text-surface-500",
            isUser ? "justify-end" : "justify-start"
          )}
        >
          {message.createdAt && (
            <span>{formatRelativeTime(message.createdAt)}</span>
          )}
          {!isUser && (
            <button
              onClick={handleCopy}
              className="rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-surface-100 dark:hover:bg-surface-800"
              aria-label={copied ? "Copied!" : "Copy message"}
              title={copied ? "Copied!" : "Copy to clipboard"}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-calm" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
