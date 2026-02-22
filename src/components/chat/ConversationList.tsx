"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  Plus,
  MessageCircle,
  Pencil,
  Trash2,
  Check,
  X,
  Search,
  MoreVertical,
} from "lucide-react";
import { clsx } from "clsx";
import { groupConversationsByDate } from "@/lib/utils/date-groups";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    if (!menuOpenId) return;

    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpenId(null);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpenId]);

  // Filter conversations by search query
  const filteredConversations = searchQuery.trim()
    ? conversations.filter((c) =>
        c.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
      )
    : conversations;

  // Group filtered conversations by date
  const grouped = useMemo(
    () => groupConversationsByDate(filteredConversations),
    [filteredConversations]
  );

  return (
    <div className="flex h-full flex-col">
      <div className="p-4 pb-2">
        <button
          onClick={onNew}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-calm-200 bg-calm-50 px-4 py-3 text-sm font-medium text-calm-700 transition-colors hover:bg-calm-100 dark:border-calm-800 dark:bg-calm-900/30 dark:text-calm-300 dark:hover:bg-calm-900/50"
        >
          <Plus className="h-4 w-4" />
          New Conversation
        </button>
      </div>

      {/* Search input — appears when 4+ conversations */}
      {conversations.length > 3 && (
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full rounded-lg border border-surface-200 bg-white py-2 pl-9 pr-3 text-xs text-surface-800 placeholder:text-surface-400 focus:border-calm focus:outline-none focus:ring-1 focus:ring-calm/20 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-100 dark:placeholder:text-surface-500"
            />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {conversations.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-surface-400 dark:text-surface-500">
            No conversations yet. Start one!
          </p>
        ) : filteredConversations.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-surface-400 dark:text-surface-500">
            No matches found.
          </p>
        ) : (
          grouped.map((group) => (
            <div key={group.label}>
              {/* Date group header */}
              <p className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500">
                {group.label}
              </p>

              <div className="space-y-0.5">
                {group.conversations.map((conv) => (
                  <div key={conv.id} className="relative" ref={menuOpenId === conv.id ? menuRef : undefined}>
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
                      <div className="flex items-center">
                        <button
                          onClick={() => onSelect(conv.id)}
                          className={clsx(
                            "flex min-w-0 flex-1 items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition-colors",
                            activeId === conv.id
                              ? "bg-calm-100 text-calm-800 dark:bg-calm-900/40 dark:text-calm-200"
                              : "text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800"
                          )}
                        >
                          <MessageCircle className="h-4 w-4 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{conv.title}</p>
                            <p className="truncate text-xs text-surface-400 dark:text-surface-500">
                              {new Date(
                                conv.last_message_at
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </button>

                        {/* Three-dot menu button (always visible, touch-friendly) */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpenId(
                              menuOpenId === conv.id ? null : conv.id
                            );
                          }}
                          className="mr-1 flex-shrink-0 rounded p-1.5 text-surface-300 transition-colors hover:bg-surface-200 hover:text-surface-600 dark:text-surface-600 dark:hover:bg-surface-700 dark:hover:text-surface-300"
                          aria-label="Conversation options"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {/* Dropdown menu */}
                        {menuOpenId === conv.id && (
                          <div className="absolute right-2 top-full z-20 mt-1 w-36 rounded-lg border border-surface-200 bg-white p-1 shadow-lg dark:border-surface-700 dark:bg-surface-800">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditTitle(conv.title);
                                setEditingId(conv.id);
                                setMenuOpenId(null);
                              }}
                              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs text-surface-600 hover:bg-surface-100 dark:text-surface-300 dark:hover:bg-surface-700"
                            >
                              <Pencil className="h-3.5 w-3.5" /> Rename
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmingDeleteId(conv.id);
                                setMenuOpenId(null);
                              }}
                              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs text-warmth-dark hover:bg-warmth-50 dark:text-warmth-300 dark:hover:bg-warmth-dark/10"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
