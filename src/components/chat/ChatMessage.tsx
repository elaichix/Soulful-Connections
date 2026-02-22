"use client";

import { clsx } from "clsx";
import Markdown from "react-markdown";
import type { UIMessage } from "ai";

interface ChatMessageProps {
  message: UIMessage;
}

function getMessageText(message: UIMessage): string {
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

  if (!text) return null;

  return (
    <div
      className={clsx(
        "mb-4 flex px-4 animate-fade-in",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={clsx(
          "max-w-[80%] sm:max-w-[70%]",
          isUser
            ? "rounded-2xl rounded-br-md bg-calm px-4 py-3 text-calm-foreground"
            : "rounded-2xl rounded-bl-md border border-surface-100 bg-white px-4 py-3 shadow-sm dark:border-surface-700 dark:bg-surface-800"
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{text}</p>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            <Markdown>{text}</Markdown>
          </div>
        )}
      </div>
    </div>
  );
}
