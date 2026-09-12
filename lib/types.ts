export interface KtvWord {
  id: string;
  text: string;
  start: number; // in seconds
  end: number;   // in seconds
  isDao?: boolean;
}

export interface KtvLine {
  id: string;
  words: KtvWord[];
  start: number;
  end: number;
}

export interface ChineseVerse {
  id: string;
  text: string;
  start: number;
  end: number;
}

export type BackgroundStyle = 'realistic-photo' | 'dark-svg' | 'custom-image';

export interface PresentationData {
  title: string;
  subtitle: string;
  englishLines: KtvLine[];
  chineseVerses: ChineseVerse[];
  totalDuration: number;
  backgroundStyle: BackgroundStyle;
  customBackgroundUrl?: string;
  overlayOpacity: number; // 0 to 1
}

export type VoiceGender = 'female' | 'male';

export interface VoiceOption {
  id: string;
  name: string;
  gender: VoiceGender;
  description: string;
  pitchTag: string; // e.g., 'Soft, Higher pitch', 'Deep, Resonant'
  geminiVoiceName: string; // Puck, Charon, Kore, Fenrir, Aoede, etc.
}

export interface SpeakerSettings {
  model: string; // 'gemini-3.1-flash-tts-preview' | 'gemini-2.5-flash' | 'gemini-2.0-flash'
  voiceId: string; // e.g. 'Aoede'
  audioProfile: string; // e.g. 'A compassionate and serene spiritual teacher reciting ancient Dao wisdom.'
  style: 'whisper' | 'calm' | 'cheerful' | 'dramatic' | 'storyteller' | 'meditative';
  pace: 'drift' | 'slow' | 'medium' | 'fast';
  accent: 'en-US' | 'en-GB' | 'en-AU' | 'en-IN';
  customApiKey?: string;
}
