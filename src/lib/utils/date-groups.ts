import type { Conversation } from "@/types";

export type DateGroup = "Today" | "Yesterday" | "This Week" | "Older";

export function groupConversationsByDate(
  conversations: Conversation[]
): { label: DateGroup; conversations: Conversation[] }[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const groups: Record<DateGroup, Conversation[]> = {
    Today: [],
    Yesterday: [],
    "This Week": [],
    Older: [],
  };

  for (const conv of conversations) {
    const d = new Date(conv.last_message_at);
    if (d >= today) {
      groups.Today.push(conv);
    } else if (d >= yesterday) {
      groups.Yesterday.push(conv);
    } else if (d >= weekAgo) {
      groups["This Week"].push(conv);
    } else {
      groups.Older.push(conv);
    }
  }

  // Return only non-empty groups, in order
  const order: DateGroup[] = ["Today", "Yesterday", "This Week", "Older"];
  return order
    .filter((label) => groups[label].length > 0)
    .map((label) => ({ label, conversations: groups[label] }));
}
