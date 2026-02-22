"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff, Square, Loader2, Volume2 } from "lucide-react";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { AudioWaveform } from "./AudioWaveform";
import type { VoiceMode } from "@/types/voice";

interface VoiceChatProps {
  voiceMode: VoiceMode;
  onToggleMode: () => void;
  onSendTranscription: (text: string) => void;
  lastAssistantText: string | null;
  isStreaming: boolean;
  autoPlayTTS: boolean;
}

export function VoiceChat({
  onSendTranscription,
  lastAssistantText,
  isStreaming,
  autoPlayTTS,
}: VoiceChatProps) {
  const [statusText, setStatusText] = useState("Tap the mic to speak");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const lastSynthesizedRef = useRef<string | null>(null);
  const autoRecordTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const {
    recordingState,
    startRecording,
    stopRecording,
    cancelRecording,
    duration,
    hasPermission,
    requestPermission,
    error: recorderError,
    micAnalyser,
  } = useAudioRecorder();

  const {
    playbackState,
    play,
    stop: stopPlayback,
    analyser: playerAnalyser,
    isActive: isPlaying,
    error: playerError,
  } = useAudioPlayer();

  const isRecording = recordingState === "recording";
  const isProcessing = recordingState === "processing" || isTranscribing;

  // Format duration as mm:ss
  function formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  // Update status text based on current state
  useEffect(() => {
    if (recorderError) {
      setStatusText(recorderError);
    } else if (playerError) {
      setStatusText(playerError);
    } else if (isTranscribing) {
      setStatusText("Understanding what you said...");
    } else if (isProcessing) {
      setStatusText("Processing...");
    } else if (isRecording) {
      setStatusText(`Listening... ${formatDuration(duration)}`);
    } else if (playbackState === "loading") {
      setStatusText("Preparing voice...");
    } else if (playbackState === "playing") {
      setStatusText("Speaking...");
    } else if (isStreaming) {
      setStatusText("Thinking...");
    } else {
      setStatusText("Tap the mic to speak");
    }
  }, [
    recorderError,
    playerError,
    isTranscribing,
    isProcessing,
    isRecording,
    playbackState,
    isStreaming,
    duration,
  ]);

  // Auto-play TTS when assistant finishes streaming
  useEffect(() => {
    if (
      !autoPlayTTS ||
      isStreaming ||
      !lastAssistantText ||
      lastAssistantText === lastSynthesizedRef.current
    ) {
      return;
    }

    lastSynthesizedRef.current = lastAssistantText;
    synthesizeAndPlay(lastAssistantText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStreaming, lastAssistantText, autoPlayTTS]);

  // Auto-start recording after playback ends (continuous conversation)
  useEffect(() => {
    if (
      playbackState === "idle" &&
      lastSynthesizedRef.current &&
      !isRecording &&
      !isProcessing &&
      !isStreaming
    ) {
      autoRecordTimeoutRef.current = setTimeout(() => {
        handleMicPress();
      }, 500);
    }

    return () => {
      if (autoRecordTimeoutRef.current) {
        clearTimeout(autoRecordTimeoutRef.current);
        autoRecordTimeoutRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playbackState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoRecordTimeoutRef.current) {
        clearTimeout(autoRecordTimeoutRef.current);
      }
    };
  }, []);

  const synthesizeAndPlay = useCallback(
    async (text: string) => {
      try {
        const response = await fetch("/api/speech/synthesize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });

        if (!response.ok) {
          // TTS failure is non-critical — message is already visible as text
          console.warn("TTS synthesis failed:", response.status);
          return;
        }

        const audioBlob = await response.blob();
        await play(audioBlob);
      } catch (err) {
        console.warn("TTS error:", err);
      }
    },
    [play]
  );

  async function handleMicPress() {
    // If currently playing, stop playback first
    if (isPlaying) {
      stopPlayback();
      return;
    }

    // If recording, stop and transcribe
    if (isRecording) {
      await handleStopAndTranscribe();
      return;
    }

    // If processing/transcribing, do nothing
    if (isProcessing || isTranscribing) return;

    // Start recording
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) return;
    }

    await startRecording();
  }

  async function handleStopAndTranscribe() {
    const blob = await stopRecording();
    if (!blob) return;

    setIsTranscribing(true);

    try {
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");

      const response = await fetch("/api/speech/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.error) {
        setStatusText(data.error);
        setIsTranscribing(false);
        return;
      }

      if (data.text) {
        onSendTranscription(data.text);
      }
    } catch {
      setStatusText("Couldn't understand that. Try again or type instead.");
    } finally {
      setIsTranscribing(false);
    }
  }

  function handleCancel() {
    if (isRecording) {
      cancelRecording();
    } else if (isPlaying) {
      stopPlayback();
    }
  }

  // Decide which analyser to show in the waveform
  const activeAnalyser = isRecording ? micAnalyser : playerAnalyser;

  return (
    <div className="border-t border-surface-200 bg-white/80 backdrop-blur-xl dark:border-surface-700 dark:bg-surface-950/80">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-6">
        {/* Waveform visualization */}
        <AudioWaveform
          analyser={activeAnalyser}
          isRecording={isRecording}
          isPlaying={playbackState === "playing"}
          size={140}
        />

        {/* Status text */}
        <p className="text-sm font-medium text-surface-500 dark:text-surface-400">
          {statusText}
        </p>

        {/* Controls */}
        <div className="flex items-center gap-4">
          {/* Cancel button (visible during recording or playback) */}
          {(isRecording || isPlaying) && (
            <button
              onClick={handleCancel}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-surface-200 bg-surface-50 text-surface-500 transition-all hover:bg-surface-100 dark:border-surface-600 dark:bg-surface-800 dark:text-surface-400 dark:hover:bg-surface-700"
              aria-label="Cancel"
            >
              <Square className="h-4 w-4" />
            </button>
          )}

          {/* Main mic button */}
          <button
            onClick={handleMicPress}
            disabled={isProcessing || isTranscribing}
            className={`relative flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              isRecording
                ? "bg-calm text-calm-foreground shadow-calm/40 hover:bg-calm-dark"
                : isPlaying
                  ? "bg-lavender text-white shadow-lavender/40 hover:bg-lavender-dark"
                  : "bg-calm text-calm-foreground shadow-calm/25 hover:bg-calm-dark hover:shadow-calm/40"
            }`}
            aria-label={
              isRecording
                ? "Stop recording"
                : isPlaying
                  ? "Stop playback"
                  : "Start recording"
            }
          >
            {isProcessing || isTranscribing ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : isRecording ? (
              <MicOff className="h-6 w-6" />
            ) : isPlaying ? (
              <Volume2 className="h-6 w-6" />
            ) : (
              <Mic className="h-6 w-6" />
            )}

            {/* Recording pulse ring */}
            {isRecording && (
              <span className="absolute inset-0 animate-[pulse-ring_2s_ease-out_infinite] rounded-full border-2 border-calm" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
