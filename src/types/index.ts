export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  companion_name: string | null;
  mood_pref: string | null;
  theme: "light" | "dark" | "system";
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  last_message_at: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}
