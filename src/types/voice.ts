// === Recording States ===
export type RecordingState = "idle" | "recording" | "processing";

// === Playback States ===
export type PlaybackState = "idle" | "loading" | "playing" | "paused";

// === Voice Mode ===
export type VoiceMode = "text" | "voice";

// === Hook Return Types ===
export interface UseAudioRecorderReturn {
  recordingState: RecordingState;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  cancelRecording: () => void;
  duration: number;
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
  error: string | null;
  /** AnalyserNode connected to mic stream for waveform visualization */
  micAnalyser: AnalyserNode | null;
}

export interface UseAudioPlayerReturn {
  playbackState: PlaybackState;
  play: (source: string | Blob) => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  progress: number;
  /** AnalyserNode for waveform visualization (frequency data) */
  analyser: AnalyserNode | null;
  isActive: boolean;
  error: string | null;
}

// === API Types ===
export interface TranscribeResponse {
  text: string;
  language?: string;
}

export interface SynthesizeRequest {
  text: string;
  voiceId?: string;
}
