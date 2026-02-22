"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { RecordingState, UseAudioRecorderReturn } from "@/types/voice";

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [duration, setDuration] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [micAnalyser, setMicAnalyser] = useState<AnalyserNode | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const resolveStopRef = useRef<((blob: Blob | null) => void) | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setHasPermission(true);

      // Create AnalyserNode for mic visualization
      const ctx = new AudioContext();
      audioContextRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      setMicAnalyser(analyser);

      return true;
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Microphone access is needed for voice mode. Please allow it in your browser settings."
          : err instanceof DOMException && err.name === "NotFoundError"
            ? "No microphone found. Please connect one or use text mode."
            : "Could not access microphone.";
      setError(message);
      setHasPermission(false);
      return false;
    }
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);

    // Ensure we have mic access
    if (!streamRef.current || !streamRef.current.active) {
      const granted = await requestPermission();
      if (!granted) return;
    }

    const stream = streamRef.current!;

    // Determine best mime type
    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : "";

    try {
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: mimeType || "audio/webm",
        });
        if (resolveStopRef.current) {
          resolveStopRef.current(blob);
          resolveStopRef.current = null;
        }
      };

      recorder.onerror = () => {
        setError("Something went wrong with recording. Try again.");
        setRecordingState("idle");
        if (resolveStopRef.current) {
          resolveStopRef.current(null);
          resolveStopRef.current = null;
        }
      };

      recorder.start(100); // Collect data every 100ms
      setRecordingState("recording");
      setDuration(0);

      // Resume audio context if suspended (Safari)
      if (audioContextRef.current?.state === "suspended") {
        await audioContextRef.current.resume();
      }

      // Start duration timer
      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);

      // Haptic feedback (Android)
      navigator.vibrate?.(50);
    } catch {
      setError("Could not start recording.");
      setRecordingState("idle");
    }
  }, [requestPermission]);

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      setRecordingState("idle");
      return null;
    }

    // Haptic feedback
    navigator.vibrate?.(50);

    return new Promise<Blob | null>((resolve) => {
      resolveStopRef.current = resolve;
      setRecordingState("processing");
      recorder.stop();
    });
  }, []);

  const cancelRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      resolveStopRef.current = null;
      recorder.stop();
    }

    chunksRef.current = [];
    setRecordingState("idle");
    setDuration(0);
  }, []);

  return {
    recordingState,
    startRecording,
    stopRecording,
    cancelRecording,
    duration,
    hasPermission,
    requestPermission,
    error,
    micAnalyser,
  };
}
