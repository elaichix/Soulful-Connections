import { streamText, createUIMessageStreamResponse, createUIMessageStream } from "ai";
import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getModel } from "@/lib/ai/models";
import { COMPANION_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import { isDemoMode } from "@/lib/demo";

// ─── Mock responses for demo mode ───
const DEMO_RESPONSES = [
  "I hear you, and I'm glad you're sharing that with me. It takes courage to open up, and I want you to know that whatever you're feeling right now is completely valid.\n\nWhat's been on your mind lately? I'm here to listen — no rush, no judgment.",
  "Thank you for trusting me with that. It sounds like you've been carrying a lot, and I really admire your strength in talking about it.\n\nSometimes just putting things into words can help us make sense of them. Would you like to explore that feeling a bit more together?",
  "That's a really thoughtful observation. It's clear you have a lot of self-awareness, which is a beautiful quality.\n\nI'm curious — when you think about what would bring you peace right now, what comes to mind? Even small things count.",
  "I appreciate you being so honest with me. Life can feel overwhelming sometimes, and it's okay to not have all the answers right away.\n\nLet's take a breath together. What's one small thing that brought you even a tiny bit of joy recently?",
  "You're not alone in feeling this way — truly. So many people carry similar feelings, even if it doesn't always seem like it.\n\nI'm right here with you. Would you like to talk more about what's going on, or would it help to focus on something that feels lighter for a moment?",
];

function getDemoResponse(userMessage: string): string {
  let hash = 0;
  for (let i = 0; i < userMessage.length; i++) {
    hash = (hash << 5) - hash + userMessage.charCodeAt(i);
    hash |= 0;
  }
  return DEMO_RESPONSES[Math.abs(hash) % DEMO_RESPONSES.length];
}

export async function POST(request: NextRequest) {
  try {
    // ─── Demo mode: return a mock streaming response ───
    if (isDemoMode()) {
      const { messages } = await request.json();
      const lastMessage = messages?.[messages.length - 1];
      const userText =
        typeof lastMessage?.content === "string"
          ? lastMessage.content
          : "hello";

      const mockText = getDemoResponse(userText);
      const textPartId = "demo-text-" + Date.now();

      const stream = createUIMessageStream({
        execute: async ({ writer }) => {
          const words = mockText.split(" ");
          for (let i = 0; i < words.length; i++) {
            const delta = i === 0 ? words[i] : " " + words[i];
            if (i === 0) {
              writer.write({ type: "text-start", id: textPartId });
            }
            writer.write({ type: "text-delta", id: textPartId, delta });
            await new Promise((r) => setTimeout(r, 30 + Math.random() * 30));
          }
          writer.write({ type: "text-end", id: textPartId });
        },
      });

      return createUIMessageStreamResponse({ stream });
    }

    // ─── Production mode ───

    // 1. Rate limit: 30 messages per 10 minutes per IP
    const ip = getClientIP(request);
    const { allowed } = rateLimit(`chat:${ip}`, {
      max: 30,
      windowMs: 10 * 60 * 1000,
    });
    if (!allowed) {
      return new Response(
        JSON.stringify({
          error: "Please slow down. Try again in a few minutes.",
        }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    // 2. Verify authentication
    const supabase = await createClient();
    if (!supabase) {
      return new Response(JSON.stringify({ error: "Server misconfigured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 3. Parse and validate request
    const { messages, conversationId } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const lastMessage = messages[messages.length - 1];
    if (
      !lastMessage ||
      lastMessage.role !== "user" ||
      typeof lastMessage.content !== "string" ||
      lastMessage.content.trim().length === 0
    ) {
      return new Response(JSON.stringify({ error: "Invalid message" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (lastMessage.content.length > 2000) {
      return new Response(JSON.stringify({ error: "Message too long" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 4. Verify conversation belongs to user (if conversationId provided)
    if (conversationId) {
      const { data: conversation } = await supabase
        .from("conversations")
        .select("id")
        .eq("id", conversationId)
        .eq("user_id", user.id)
        .single();

      if (!conversation) {
        return new Response(
          JSON.stringify({ error: "Conversation not found" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }

      // Save user message to database
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        role: "user",
        content: lastMessage.content.trim(),
      });
    }

    // 5. Trim conversation history to prevent token overflow
    // Keep system prompt + last 20 messages max
    const trimmedMessages = messages.slice(-20);

    // 6. Stream AI response
    const result = streamText({
      model: getModel(),
      system: COMPANION_SYSTEM_PROMPT,
      messages: trimmedMessages,
      temperature: 0.85,
      maxOutputTokens: 1024,
      async onFinish({ text }) {
        // Save AI response to database
        if (conversationId && text) {
          await supabase.from("messages").insert({
            conversation_id: conversationId,
            role: "assistant",
            content: text,
          });

          // Update conversation timestamp
          await supabase
            .from("conversations")
            .update({ last_message_at: new Date().toISOString() })
            .eq("id", conversationId);

          // Auto-generate title after first exchange
          const { count } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("conversation_id", conversationId);

          if (count && count <= 3) {
            const title =
              lastMessage.content.trim().slice(0, 60) +
              (lastMessage.content.length > 60 ? "..." : "");
            await supabase
              .from("conversations")
              .update({ title })
              .eq("id", conversationId);
          }
        }
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: "Something went wrong. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
