import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, getClientIP } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // 1. Rate limit: 20 requests per 10 minutes per IP
    const ip = getClientIP(request);
    const { allowed } = rateLimit(`speech-synthesize:${ip}`, {
      max: 20,
      windowMs: 10 * 60 * 1000,
    });
    if (!allowed) {
      return Response.json(
        { error: "Voice is taking a breather. You can type your message instead." },
        { status: 429 }
      );
    }

    // 2. Verify authentication
    const supabase = await createClient();
    if (!supabase) {
      return Response.json({ error: "Auth not configured" }, { status: 503 });
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 3. Validate API keys
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const defaultVoiceId = process.env.ELEVENLABS_VOICE_ID;
    if (!apiKey || !defaultVoiceId) {
      return Response.json(
        { error: "Voice synthesis is not configured." },
        { status: 503 }
      );
    }

    // 4. Parse and validate request body
    const body = await request.json();
    const { text, voiceId } = body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return Response.json({ error: "No text provided." }, { status: 400 });
    }

    if (text.length > 5000) {
      return Response.json({ error: "Text too long for synthesis." }, { status: 400 });
    }

    // 5. Call ElevenLabs Text-to-Speech streaming API
    const selectedVoiceId = voiceId || defaultVoiceId;

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}/stream`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: text.trim(),
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.75,
            similarity_boost: 0.75,
            style: 0.35,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs API error:", response.status, errorText);
      return Response.json(
        { error: "Voice synthesis failed." },
        { status: 500 }
      );
    }

    // 6. Stream audio response back to client
    return new Response(response.body, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Synthesize API error:", error);
    return Response.json(
      { error: "Voice synthesis failed. Please try again." },
      { status: 500 }
    );
  }
}
