"use client";

import { useRef, useEffect } from "react";

interface AudioWaveformProps {
  analyser: AnalyserNode | null;
  isRecording: boolean;
  isPlaying: boolean;
  size?: number;
}

// Calm teal for recording, lavender for playback
const RECORDING_COLOR = { r: 95, g: 158, b: 160 }; // #5F9EA0
const PLAYBACK_COLOR = { r: 150, g: 123, b: 182 }; // #967BB6

export function AudioWaveform({
  analyser,
  isRecording,
  isPlaying,
  size = 140,
}: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);

  const isActive = isRecording || isPlaying;
  const color = isRecording ? RECORDING_COLOR : PLAYBACK_COLOR;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Retina scaling
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const centerX = size / 2;
    const centerY = size / 2;
    const baseRadius = size * 0.22;

    let idlePhase = 0;

    function draw() {
      if (!ctx) return;

      ctx.clearRect(0, 0, size, size);

      let normalizedAverage = 0;
      let bassAverage = 0;

      if (analyser && isActive) {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);

        const average =
          dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        normalizedAverage = average / 255;

        const bassSlice = dataArray.slice(0, Math.floor(dataArray.length / 4));
        bassAverage =
          bassSlice.reduce((a, b) => a + b, 0) / bassSlice.length / 255;
      } else if (isActive) {
        // No analyser yet but mode is active — gentle idle breath
        idlePhase += 0.02;
        normalizedAverage = 0.15 + Math.sin(idlePhase) * 0.1;
        bassAverage = normalizedAverage;
      } else {
        // Fully idle — subtle breathing
        idlePhase += 0.015;
        normalizedAverage = 0.1 + Math.sin(idlePhase) * 0.05;
        bassAverage = normalizedAverage;
      }

      const breathRadius = baseRadius + baseRadius * 0.35 * bassAverage;

      // Layer 1: Outer glow
      const glowRadius = breathRadius * 1.8;
      const glowGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        breathRadius * 0.5,
        centerX,
        centerY,
        glowRadius
      );
      glowGradient.addColorStop(
        0,
        `rgba(${color.r}, ${color.g}, ${color.b}, ${0.18 + normalizedAverage * 0.15})`
      );
      glowGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      // Layer 2: Middle ring (breathing circle)
      ctx.beginPath();
      ctx.arc(centerX, centerY, breathRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${0.35 + normalizedAverage * 0.45})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Layer 3: Inner filled circle
      const innerRadius = breathRadius * 0.6;
      const innerGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        innerRadius
      );
      innerGradient.addColorStop(
        0,
        `rgba(${color.r}, ${color.g}, ${color.b}, ${0.25 + normalizedAverage * 0.3})`
      );
      innerGradient.addColorStop(
        1,
        `rgba(${color.r}, ${color.g}, ${color.b}, 0.05)`
      );
      ctx.fillStyle = innerGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
      ctx.fill();

      animationFrameRef.current = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [analyser, isRecording, isPlaying, isActive, size, color]);

  return (
    <div className="flex items-center justify-center">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={
          isRecording
            ? "Audio visualization — recording your voice"
            : isPlaying
              ? "Audio visualization — playing response"
              : "Audio visualization — waiting"
        }
        className="pointer-events-none"
      />
    </div>
  );
}
