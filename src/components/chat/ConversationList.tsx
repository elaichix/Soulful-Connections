"use client";

import { Plus, MessageCircle } from "lucide-react";
import { clsx } from "clsx";
import type { Conversation } from "@/types";

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
}

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  onNew,
}: ConversationListProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="p-4">
        <button
          onClick={onNew}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-calm-200 bg-calm-50 px-4 py-3 text-sm font-medium text-calm-700 transition-colors hover:bg-calm-100 dark:border-calm-800 dark:bg-calm-900/30 dark:text-calm-300 dark:hover:bg-calm-900/50"
        >
          <Plus className="h-4 w-4" />
          New Conversation
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {conversations.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-surface-400 dark:text-surface-500">
            No conversations yet. Start one!
          </p>
        ) : (
          <div className="space-y-1">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={clsx(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition-colors",
                  activeId === conv.id
                    ? "bg-calm-100 text-calm-800 dark:bg-calm-900/40 dark:text-calm-200"
                    : "text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800"
                )}
              >
                <MessageCircle className="h-4 w-4 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{conv.title}</p>
                  <p className="truncate text-xs text-surface-400 dark:text-surface-500">
                    {new Date(conv.last_message_at).toLocaleDateString()}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
