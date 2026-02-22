"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { createClient } from "@/lib/supabase/client";
import { Navbar } from "@/components/shared/Navbar";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { VoiceChat } from "@/components/chat/VoiceChat";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { SafetyBanner } from "@/components/chat/SafetyBanner";
import { ScrollAnchor } from "@/components/chat/ScrollAnchor";
import { ConversationList } from "@/components/chat/ConversationList";
import { useScrollAnchor } from "@/hooks/use-scroll-anchor";
import { CRISIS_KEYWORDS } from "@/lib/config";
import { Heart, PanelLeftOpen, PanelLeftClose, Keyboard } from "lucide-react";
import type { Conversation } from "@/types";
import type { VoiceMode } from "@/types/voice";

const isDemo = !process.env.NEXT_PUBLIC_SUPABASE_URL;

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [userEmail, setUserEmail] = useState<string | null>(
    isDemo ? "Demo User" : null
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSafety, setShowSafety] = useState(false);
  const [input, setInput] = useState("");
  const [voiceMode, setVoiceMode] = useState<VoiceMode>("text");
  const [autoPlayTTS, setAutoPlayTTS] = useState(true);

  const supabase = useMemo(() => createClient(), []);

  const { scrollRef, showScrollButton, scrollToBottom, autoScroll } =
    useScrollAnchor();

  // Create transport with dynamic body that includes the active conversation ID
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: () => ({ conversationId: activeConversationId }),
      }),
    [activeConversationId]
  );

  const { messages, status, sendMessage, setMessages } = useChat({
    transport,
    onFinish() {
      autoScroll();
      if (!isDemo) loadConversations();
    },
  });

  const isLoading = status === "submitted" || status === "streaming";
  const isStreaming = status === "streaming";

  // Helper to extract text from a UIMessage (v6 uses parts array)
  function getMessageText(msg: (typeof messages)[number]): string {
    if (msg.parts && msg.parts.length > 0) {
      return msg.parts
        .filter((p): p is { type: "text"; text: string } => p.type === "text")
        .map((p) => p.text)
        .join("");
    }
    return "";
  }

  // Derive last assistant text for TTS
  const lastAssistantText = useMemo(() => {
    const assistantMessages = messages.filter((m) => m.role === "assistant");
    if (assistantMessages.length === 0) return null;
    const lastMsg = assistantMessages[assistantMessages.length - 1];
    const text = getMessageText(lastMsg);
    return text || null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // Check for crisis keywords in user messages
  useEffect(() => {
    const lastUserMessage = [...messages]
      .reverse()
      .find((m) => m.role === "user");
    if (lastUserMessage) {
      const content = getMessageText(lastUserMessage).toLowerCase();
      const hasCrisisKeyword = CRISIS_KEYWORDS.some((keyword) =>
        content.includes(keyword)
      );
      if (hasCrisisKeyword) {
        setShowSafety(true);
      }
    }
  }, [messages]);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    autoScroll();
  }, [messages, autoScroll]);

  // Load user info (skip in demo mode)
  useEffect(() => {
    if (isDemo || !supabase) return;
    async function loadUser() {
      const {
        data: { user },
      } = await supabase!.auth.getUser();
      setUserEmail(user?.email ?? null);
    }
    loadUser();
  }, [supabase]);

  // Load conversations (skip in demo mode)
  const loadConversations = useCallback(async () => {
    if (isDemo || !supabase) return;
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .order("last_message_at", { ascending: false });

    if (data) {
      setConversations(data);
      if (!activeConversationId && data.length > 0) {
        setActiveConversationId(data[0].id);
      }
    }
  }, [supabase, activeConversationId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Load messages when conversation changes (skip in demo mode)
  useEffect(() => {
    if (isDemo) {
      // In demo mode, just clear messages when switching conversations
      setMessages([]);
      return;
    }

    async function loadMessages() {
      if (!activeConversationId || !supabase) {
        setMessages([]);
        return;
      }

      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", activeConversationId)
        .order("created_at", { ascending: true });

      if (data) {
        setMessages(
          data.map((m) => ({
            id: m.id,
            role: m.role as "user" | "assistant",
            content: m.content,
            createdAt: new Date(m.created_at),
            parts: [{ type: "text" as const, text: m.content }],
          }))
        );
      }
    }
    loadMessages();
  }, [activeConversationId, supabase, setMessages]);

  function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    sendMessage({ text: trimmed });
    setInput("");
  }

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
  }

  // Voice transcription handler — sends the transcribed text as a chat message
  function handleVoiceTranscription(text: string) {
    if (!text.trim() || isLoading) return;
    sendMessage({ text: text.trim() });
  }

  function toggleVoiceMode() {
    setVoiceMode((prev) => (prev === "text" ? "voice" : "text"));
  }

  async function handleNewConversation() {
    if (isDemo) {
      // In demo mode, create an in-memory conversation
      const newConvo: Conversation = {
        id: crypto.randomUUID(),
        user_id: "demo-user",
        title: "New Conversation",
        last_message_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };
      setConversations((prev) => [newConvo, ...prev]);
      setActiveConversationId(newConvo.id);
      setMessages([]);
      setShowSafety(false);
      setInput("");
      return;
    }

    if (!supabase) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("conversations")
      .insert({
        user_id: user.id,
        title: "New Conversation",
        last_message_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (data) {
      setConversations((prev) => [data, ...prev]);
      setActiveConversationId(data.id);
      setMessages([]);
      setShowSafety(false);
      setInput("");
    }
  }

  function selectConversation(id: string) {
    setActiveConversationId(id);
    setShowSafety(false);
    setSidebarOpen(false);
    setInput("");
  }

  return (
    <div className="flex h-dvh flex-col bg-surface-50 dark:bg-surface-950">
      <Navbar userEmail={userEmail} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Toggle (Mobile) */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed bottom-24 left-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-surface-200 bg-white shadow-lg md:hidden dark:border-surface-700 dark:bg-surface-800"
        >
          {sidebarOpen ? (
            <PanelLeftClose className="h-4 w-4 text-surface-600 dark:text-surface-300" />
          ) : (
            <PanelLeftOpen className="h-4 w-4 text-surface-600 dark:text-surface-300" />
          )}
        </button>

        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "block" : "hidden"
          } absolute inset-y-16 left-0 z-10 w-72 border-r border-surface-200 bg-surface-50 md:relative md:inset-y-0 md:block dark:border-surface-700 dark:bg-surface-900`}
        >
          <ConversationList
            conversations={conversations}
            activeId={activeConversationId}
            onSelect={selectConversation}
            onNew={handleNewConversation}
          />
        </aside>

        {/* Main Chat Area */}
        <div className="relative flex flex-1 flex-col">
          {activeConversationId ? (
            <>
              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto py-6">
                {messages.length === 0 && (
                  <div className="flex h-full flex-col items-center justify-center px-4 text-center">
                    <Heart className="mb-4 h-12 w-12 text-calm-300 dark:text-calm-700" />
                    <h2 className="mb-2 font-serif text-xl font-semibold text-surface-700 dark:text-surface-300">
                      Start a conversation
                    </h2>
                    <p className="max-w-md text-sm text-surface-400 dark:text-surface-500">
                      Share whatever is on your mind. I&apos;m here to listen,
                      and everything you say stays between us.
                    </p>
                  </div>
                )}

                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}

                {isLoading &&
                  messages[messages.length - 1]?.role === "user" && (
                    <TypingIndicator />
                  )}
              </div>

              <ScrollAnchor
                visible={showScrollButton}
                onClick={scrollToBottom}
              />

              <SafetyBanner visible={showSafety} />

              {/* Voice mode: show VoiceChat + keyboard toggle */}
              {voiceMode === "voice" ? (
                <div className="relative">
                  {/* Keyboard toggle to switch back to text */}
                  <button
                    onClick={toggleVoiceMode}
                    className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-surface-200 bg-surface-50 text-surface-500 transition-all hover:border-calm hover:text-calm dark:border-surface-600 dark:bg-surface-800 dark:text-surface-400 dark:hover:border-calm dark:hover:text-calm"
                    aria-label="Switch to text mode"
                    title="Switch to text mode"
                  >
                    <Keyboard className="h-4 w-4" />
                  </button>
                  <VoiceChat
                    voiceMode={voiceMode}
                    onToggleMode={toggleVoiceMode}
                    onSendTranscription={handleVoiceTranscription}
                    lastAssistantText={lastAssistantText}
                    isStreaming={isStreaming}
                    autoPlayTTS={autoPlayTTS}
                  />
                </div>
              ) : (
                <ChatInput
                  input={input}
                  onChange={handleInputChange}
                  onSubmit={handleSendMessage}
                  isLoading={isLoading}
                  voiceMode={voiceMode}
                  onToggleVoiceMode={toggleVoiceMode}
                />
              )}
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center px-4 text-center">
              <Heart className="mb-4 h-16 w-16 text-calm-300 dark:text-calm-700" />
              <h2 className="mb-2 font-serif text-2xl font-semibold text-surface-700 dark:text-surface-300">
                Welcome to Soulful Connections
              </h2>
              <p className="mb-6 max-w-md text-surface-400 dark:text-surface-500">
                Create a new conversation to begin. Your companion is ready to
                listen.
              </p>
              <button
                onClick={handleNewConversation}
                className="rounded-full bg-calm px-6 py-3 text-sm font-semibold text-calm-foreground shadow-lg shadow-calm/25 transition-all hover:bg-calm-dark hover:shadow-calm/40"
              >
                Start a Conversation
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
