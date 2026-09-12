export interface KtvWord {
  id: string;
  text: string;
  start: number; // in seconds
  end: number;   // in seconds
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

export interface PresentationData {
  title: string;
  subtitle: string;
  englishLines: KtvLine[];
  chineseVerses: ChineseVerse[];
  totalDuration: number;
}

export type VoiceGender = 'female' | 'male';

export interface VoiceOption {
  id: string;
  name: string;
  gender: VoiceGender;
  description: string;
  pitchTag: string;
  geminiVoiceName: string;
}

export interface SpeakerSettings {
  model: string;
  voiceId: string;
  audioProfile: string;
  style: 'whisper' | 'calm' | 'cheerful' | 'dramatic' | 'storyteller' | 'meditative';
  pace: 'drift' | 'slow' | 'medium' | 'fast';
  accent: 'en-US' | 'en-GB' | 'en-AU' | 'en-IN';
  customApiKey?: string;
  activePreset?: 'speaker-1' | 'speaker-2' | 'custom';
}
