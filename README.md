# Soulful Connections

An AI-powered companionship platform that provides warm, empathetic conversations through text and voice. Built for emotional support, mindful reflection, and meaningful human-AI interaction.

## Features

- **Real-time AI Chat** — Streaming responses powered by Google Gemini via Vercel AI SDK
- **Voice Mode** — Speech-to-text (OpenAI Whisper) and text-to-speech (ElevenLabs) with a breathing circle waveform visualization
- **Conversation History** — Persistent conversations stored in Supabase with sidebar navigation
- **Auth System** — Email/password and Google OAuth via Supabase Auth
- **Dark Mode** — Full theme support with system preference detection
- **Demo Mode** — Try the full UI without any API keys or account setup
- **Responsive Design** — Mobile-friendly layout with Tailwind CSS

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **AI:** Vercel AI SDK v6, Google Gemini
- **Voice:** OpenAI Whisper (STT), ElevenLabs (TTS), Web Audio API
- **Database & Auth:** Supabase (PostgreSQL + Auth)
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
git clone https://github.com/elaichix/Soulful-Connections.git
cd Soulful-Connections
npm install
```

### Environment Variables

Copy the example env file and fill in your keys:

```bash
cp .env.example .env.local
```

See `.env.example` for all required variables:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google AI API key (for Gemini) |
| `OPENAI_API_KEY` | OpenAI API key (for Whisper STT) |
| `ELEVENLABS_API_KEY` | ElevenLabs API key (for TTS) |
| `ELEVENLABS_VOICE_ID` | ElevenLabs voice ID |

### Demo Mode

Don't have API keys yet? No problem! Leave all env variables empty and the app automatically enters **demo mode**:

- Full UI is navigable (landing page, chat, profile)
- Mock AI streams warm, empathetic responses
- Conversations are stored in-memory
- No account or database required

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
  app/
    (auth)/          # Login & signup pages
    (main)/          # Chat & profile pages
    api/             # API routes (chat, speech, auth)
  components/
    chat/            # ChatInput, ChatMessage, VoiceChat, AudioWaveform
    shared/          # Navbar, AuthForm, ThemeProvider
  hooks/             # useAudioRecorder, useAudioPlayer, useScrollAnchor
  lib/
    ai/              # AI model config & system prompt
    supabase/        # Database client (server & browser)
    demo.ts          # Demo mode utilities
  types/             # TypeScript type definitions
supabase/
  migration.sql      # Database schema
```

## License

MIT
