"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { PlaybackState, UseAudioPlayerReturn } from "@/types/voice";

export function useAudioPlayer(): UseAudioPlayerReturn {
  const [playbackState, setPlaybackState] = useState<PlaybackState>("idle");
  const [progress, setProgress] = useState(0);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function cleanup() {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.removeAttribute("src");
      audioElementRef.current = null;
    }
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.disconnect();
      } catch {
        // already disconnected
      }
      sourceNodeRef.current = null;
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setAnalyser(null);
    setIsActive(false);
    setProgress(0);
  }

  const play = useCallback(async (source: string | Blob) => {
    try {
      setError(null);
      cleanup();
      setPlaybackState("loading");

      // Create or reuse AudioContext
      if (!audioContextRef.current || audioContextRef.current.state === "closed") {
        audioContextRef.current = new AudioContext();
      }
      const ctx = audioContextRef.current;

      // Resume if suspended (Safari autoplay policy)
      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      // Create audio element
      const audio = new Audio();
      audioElementRef.current = audio;
      audio.crossOrigin = "anonymous";

      // Set source
      if (source instanceof Blob) {
        const url = URL.createObjectURL(source);
        objectUrlRef.current = url;
        audio.src = url;
      } else {
        audio.src = source;
      }

      // Wait for audio to be ready
      await new Promise<void>((resolve, reject) => {
        audio.oncanplaythrough = () => resolve();
        audio.onerror = () => reject(new Error("Failed to load audio"));
        audio.load();
      });

      // Connect audio graph: element -> source -> analyser -> destination
      const sourceNode = ctx.createMediaElementSource(audio);
      sourceNodeRef.current = sourceNode;

      const analyserNode = ctx.createAnalyser();
      analyserNode.fftSize = 256;
      analyserNode.smoothingTimeConstant = 0.8;

      sourceNode.connect(analyserNode);
      analyserNode.connect(ctx.destination);

      setAnalyser(analyserNode);

      // Track progress
      audio.ontimeupdate = () => {
        if (audio.duration) {
          setProgress(audio.currentTime / audio.duration);
        }
      };

      // Handle end
      audio.onended = () => {
        setPlaybackState("idle");
        setIsActive(false);
        setProgress(1);
      };

      // Play
      await audio.play();
      setPlaybackState("playing");
      setIsActive(true);
    } catch (err) {
      console.error("Audio playback error:", err);
      setError("Could not play audio.");
      setPlaybackState("idle");
      setIsActive(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pause = useCallback(() => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      setPlaybackState("paused");
      setIsActive(false);
    }
  }, []);

  const resume = useCallback(async () => {
    if (audioElementRef.current) {
      await audioElementRef.current.play();
      setPlaybackState("playing");
      setIsActive(true);
    }
  }, []);

  const stop = useCallback(() => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
    }
    setPlaybackState("idle");
    setIsActive(false);
    setProgress(0);
  }, []);

  return {
    playbackState,
    play,
    pause,
    resume,
    stop,
    progress,
    analyser,
    isActive,
    error,
  };
}
