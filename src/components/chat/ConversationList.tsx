"use client";

import { useState } from "react";
import { Plus, MessageCircle, Pencil, Trash2, Check, X } from "lucide-react";
import { clsx } from "clsx";
import type { Conversation } from "@/types";

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
}

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onRename,
}: ConversationListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(
    null
  );

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
              <div key={conv.id} className="group relative">
                {editingId === conv.id ? (
                  /* Inline rename mode */
                  <div className="flex items-center gap-2 rounded-xl px-3 py-3">
                    <MessageCircle className="h-4 w-4 flex-shrink-0 text-surface-400" />
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          onRename(conv.id, editTitle);
                          setEditingId(null);
                        }
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      autoFocus
                      className="flex-1 rounded-lg border border-calm bg-white px-2 py-1 text-sm text-surface-800 focus:outline-none focus:ring-2 focus:ring-calm/20 dark:border-calm-700 dark:bg-surface-800 dark:text-surface-100"
                    />
                    <button
                      onClick={() => {
                        onRename(conv.id, editTitle);
                        setEditingId(null);
                      }}
                      className="text-calm-600 hover:text-calm-800 dark:text-calm-400"
                      aria-label="Save title"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-300"
                      aria-label="Cancel rename"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : confirmingDeleteId === conv.id ? (
                  /* Delete confirmation mode */
                  <div className="flex items-center gap-2 rounded-xl bg-warmth-50 px-3 py-3 dark:bg-warmth-dark/10">
                    <span className="flex-1 text-sm text-warmth-dark dark:text-warmth-300">
                      Delete this conversation?
                    </span>
                    <button
                      onClick={() => {
                        onDelete(conv.id);
                        setConfirmingDeleteId(null);
                      }}
                      className="rounded-lg bg-warmth-500 px-2 py-1 text-xs font-medium text-white hover:bg-warmth-dark"
                      aria-label="Confirm delete"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setConfirmingDeleteId(null)}
                      className="rounded-lg bg-surface-200 px-2 py-1 text-xs font-medium text-surface-600 hover:bg-surface-300 dark:bg-surface-700 dark:text-surface-300"
                      aria-label="Cancel delete"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  /* Normal display mode */
                  <button
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

                    {/* Hover actions */}
                    <div className="flex flex-shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditTitle(conv.title);
                          setEditingId(conv.id);
                        }}
                        className="rounded p-1 text-surface-400 hover:bg-surface-200 hover:text-surface-600 dark:hover:bg-surface-700 dark:hover:text-surface-300"
                        aria-label="Rename conversation"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmingDeleteId(conv.id);
                        }}
                        className="rounded p-1 text-surface-400 hover:bg-warmth-100 hover:text-warmth-dark dark:hover:bg-warmth-dark/20 dark:hover:text-warmth-300"
                        aria-label="Delete conversation"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
