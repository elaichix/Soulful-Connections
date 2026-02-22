import { NextRequest } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, getClientIP } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // 1. Rate limit: 20 requests per 10 minutes per IP
    const ip = getClientIP(request);
    const { allowed } = rateLimit(`speech-transcribe:${ip}`, {
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

    // 3. Validate API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "Voice transcription is not configured." },
        { status: 503 }
      );
    }

    // 4. Parse multipart form data
    const formData = await request.formData();
    const audioFile = formData.get("audio");

    if (!audioFile || !(audioFile instanceof File)) {
      return Response.json({ error: "No audio file provided." }, { status: 400 });
    }

    // 5. Validate file size (max 25MB - Whisper limit)
    if (audioFile.size > 25 * 1024 * 1024) {
      return Response.json({ error: "Audio file too large." }, { status: 400 });
    }

    // 6. Validate content type
    const validTypes = [
      "audio/webm",
      "audio/mp4",
      "audio/wav",
      "audio/ogg",
      "audio/mpeg",
      "audio/x-m4a",
    ];
    const isValidType = validTypes.some(
      (t) => audioFile.type.startsWith(t) || audioFile.type === ""
    );
    if (!isValidType && audioFile.type !== "") {
      return Response.json(
        { error: "Unsupported audio format." },
        { status: 400 }
      );
    }

    // 7. Call Whisper API
    const openai = new OpenAI({ apiKey });

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      response_format: "json",
    });

    if (!transcription.text || transcription.text.trim().length === 0) {
      return Response.json(
        { error: "Didn't catch that. Could you try again?" },
        { status: 200 }
      );
    }

    return Response.json({ text: transcription.text.trim() });
  } catch (error) {
    console.error("Transcribe API error:", error);
    return Response.json(
      { error: "Couldn't understand that. Try again or switch to text." },
      { status: 500 }
    );
  }
}
