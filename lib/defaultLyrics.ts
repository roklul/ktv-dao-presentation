import { PresentationData, VoiceOption, SpeakerSettings } from './types';

export const DEFAULT_PRESENTATION: PresentationData = {
  title: "修行法語 · 濟公活佛 KTV 聲光同步簡報",
  subtitle: "Self-Cultivation & Dao Practice · Audio-Visual Presentation",
  totalDuration: 24.5,
  englishLines: [
    {
      id: "line-1",
      start: 0.0,
      end: 2.2,
      words: [
        { id: "w-1-1", text: "Self-cultivation", start: 0.0, end: 1.0 },
        { id: "w-1-2", text: "is", start: 1.0, end: 1.3 },
        { id: "w-1-3", text: "for", start: 1.3, end: 1.6 },
        { id: "w-1-4", text: "self,", start: 1.6, end: 2.2 },
      ]
    },
    {
      id: "line-2",
      start: 2.3,
      end: 5.2,
      words: [
        { id: "w-2-1", text: "it", start: 2.3, end: 2.5 },
        { id: "w-2-2", text: "does", start: 2.5, end: 2.8 },
        { id: "w-2-3", text: "not", start: 2.8, end: 3.1 },
        { id: "w-2-4", text: "matter", start: 3.1, end: 3.6 },
        { id: "w-2-5", text: "in", start: 3.6, end: 3.8 },
        { id: "w-2-6", text: "society", start: 3.8, end: 4.4 },
        { id: "w-2-7", text: "or", start: 4.4, end: 4.6 },
        { id: "w-2-8", text: "alone.", start: 4.6, end: 5.2 },
      ]
    },
    {
      id: "line-3",
      start: 5.4,
      end: 7.6,
      words: [
        { id: "w-3-1", text: "Cultivation", start: 5.4, end: 6.4 },
        { id: "w-3-2", text: "is", start: 6.4, end: 6.6 },
        { id: "w-3-3", text: "for", start: 6.6, end: 6.8 },
        { id: "w-3-4", text: "a", start: 6.8, end: 7.0 },
        { id: "w-3-5", text: "lifetime,", start: 7.0, end: 7.6 },
      ]
    },
    {
      id: "line-4",
      start: 7.7,
      end: 10.8,
      words: [
        { id: "w-4-1", text: "it", start: 7.7, end: 7.9 },
        { id: "w-4-2", text: "does", start: 7.9, end: 8.1 },
        { id: "w-4-3", text: "not", start: 8.1, end: 8.4 },
        { id: "w-4-4", text: "matter", start: 8.4, end: 8.9 },
        { id: "w-4-5", text: "if", start: 8.9, end: 9.1 },
        { id: "w-4-6", text: "one", start: 9.1, end: 9.4 },
        { id: "w-4-7", text: "is", start: 9.4, end: 9.6 },
        { id: "w-4-8", text: "young", start: 9.6, end: 10.1 },
        { id: "w-4-9", text: "or", start: 10.1, end: 10.3 },
        { id: "w-4-10", text: "old,", start: 10.3, end: 10.8 },
      ]
    },
    {
      id: "line-5",
      start: 10.9,
      end: 13.5,
      words: [
        { id: "w-5-1", text: "new", start: 10.9, end: 11.2 },
        { id: "w-5-2", text: "to", start: 11.2, end: 11.4 },
        { id: "w-5-3", text: "Dao", start: 11.4, end: 12.0, isDao: true },
        { id: "w-5-4", text: "or", start: 12.0, end: 12.3 },
        { id: "w-5-5", text: "been", start: 12.3, end: 12.6 },
        { id: "w-5-6", text: "many", start: 12.6, end: 13.0 },
        { id: "w-5-7", text: "years.", start: 13.0, end: 13.5 },
      ]
    },
    {
      id: "line-6",
      start: 13.8,
      end: 18.9,
      words: [
        { id: "w-6-1", text: "Self", start: 13.8, end: 14.1 },
        { id: "w-6-2", text: "cultivation", start: 14.1, end: 14.9 },
        { id: "w-6-3", text: "does", start: 14.9, end: 15.2 },
        { id: "w-6-4", text: "not", start: 15.2, end: 15.4 },
        { id: "w-6-5", text: "depend", start: 15.4, end: 15.9 },
        { id: "w-6-6", text: "on", start: 15.9, end: 16.1 },
        { id: "w-6-7", text: "being", start: 16.1, end: 16.5 },
        { id: "w-6-8", text: "in", start: 16.5, end: 16.7 },
        { id: "w-6-9", text: "the", start: 16.7, end: 16.9 },
        { id: "w-6-10", text: "Dao", start: 16.9, end: 17.5, isDao: true },
        { id: "w-6-11", text: "environment", start: 17.5, end: 18.3 },
        { id: "w-6-12", text: "or", start: 18.3, end: 18.5 },
        { id: "w-6-13", text: "not.", start: 18.5, end: 18.9 },
      ]
    },
    {
      id: "line-7",
      start: 19.2,
      end: 24.5,
      words: [
        { id: "w-7-1", text: "Therefore,", start: 19.2, end: 19.8 },
        { id: "w-7-2", text: "when", start: 19.8, end: 20.1 },
        { id: "w-7-3", text: "all", start: 20.1, end: 20.4 },
        { id: "w-7-4", text: "is", start: 20.4, end: 20.7 },
        { id: "w-7-5", text: "quiet,", start: 20.7, end: 21.4 },
        { id: "w-7-6", text: "self", start: 21.6, end: 22.0 },
        { id: "w-7-7", text: "cultivation", start: 22.0, end: 22.8 },
        { id: "w-7-8", text: "does", start: 22.8, end: 23.1 },
        { id: "w-7-9", text: "not", start: 23.1, end: 23.4 },
        { id: "w-7-10", text: "stop.", start: 23.4, end: 24.5 },
      ]
    }
  ],
  chineseVerses: [
    {
      id: "cn-1",
      text: "修行是為了自己，與是否身處社會無關。",
      start: 0.0,
      end: 5.2
    },
    {
      id: "cn-2",
      text: "修行是一生的，與年齡、修行經驗無關。",
      start: 5.4,
      end: 13.5
    },
    {
      id: "cn-3",
      text: "修行不依賴是否身處道場。",
      start: 13.8,
      end: 18.9
    },
    {
      id: "cn-4",
      text: "因此，即使萬籟俱寂，修行也不會停止。",
      start: 19.2,
      end: 24.5
    }
  ]
};

export const AVAILABLE_VOICES: VoiceOption[] = [
  // Female Voices
  {
    id: "Aoede",
    name: "Aoede (慈悲空靈女聲)",
    gender: "female",
    description: "Breezy and mindful tone, ideal for meditation and wisdom reading.",
    pitchTag: "Breezy, Middle pitch",
    geminiVoiceName: "Aoede"
  },
  {
    id: "Kore",
    name: "Kore (柔美祥和女聲)",
    gender: "female",
    description: "Serene, warm and gentle spiritual narration.",
    pitchTag: "Gentle, Higher pitch",
    geminiVoiceName: "Kore"
  },
  {
    id: "Achernar",
    name: "Achernar (清澈細膩女聲)",
    gender: "female",
    description: "Soft, tranquil and articulate presentation voice.",
    pitchTag: "Soft, Higher pitch",
    geminiVoiceName: "Achernar"
  },
  {
    id: "Autonoe",
    name: "Autonoe (明亮清朗女聲)",
    gender: "female",
    description: "Bright and inspiring tone with clear pronunciation.",
    pitchTag: "Bright, Middle pitch",
    geminiVoiceName: "Autonoe"
  },
  // Male Voices
  {
    id: "Charon",
    name: "Charon (莊嚴厚重男聲)",
    gender: "male",
    description: "Deep, resonant and authoritative narrator for sacred texts.",
    pitchTag: "Deep, Resonant, Lower pitch",
    geminiVoiceName: "Charon"
  },
  {
    id: "Puck",
    name: "Puck (自然溫暖男聲)",
    gender: "male",
    description: "Balanced, clear and friendly tone for mindful recitation.",
    pitchTag: "Warm, Middle pitch",
    geminiVoiceName: "Puck"
  },
  {
    id: "Fenrir",
    name: "Fenrir (威嚴定靜男聲)",
    gender: "male",
    description: "Powerful and steady delivery with gravitas.",
    pitchTag: "Firm, Authoritative, Lower pitch",
    geminiVoiceName: "Fenrir"
  },
  {
    id: "Achird",
    name: "Achird (親切和緩男聲)",
    gender: "male",
    description: "Friendly and peaceful cadence suitable for Zen teachings.",
    pitchTag: "Friendly, Lower middle pitch",
    geminiVoiceName: "Achird"
  },
  {
    id: "Algieba",
    name: "Algieba (圓潤禪意男聲)",
    gender: "male",
    description: "Smooth and meditative vocal character.",
    pitchTag: "Smooth, Lower pitch",
    geminiVoiceName: "Algieba"
  },
  {
    id: "Algenib",
    name: "Algenib (滄桑醇厚男聲)",
    gender: "male",
    description: "Gravelly and wise tone carrying profound experience.",
    pitchTag: "Gravelly, Lower pitch",
    geminiVoiceName: "Algenib"
  },
  {
    id: "Alnilam",
    name: "Alnilam (堅毅定靜男聲)",
    gender: "male",
    description: "Firm and centered vocal cadence.",
    pitchTag: "Firm, Lower middle pitch",
    geminiVoiceName: "Alnilam"
  }
];

export const DEFAULT_SPEAKER_SETTINGS: SpeakerSettings = {
  model: "gemini-3.1-flash-tts-preview",
  voiceId: "Aoede",
  audioProfile: "A deep, resonant, compassionate Buddhist master and spiritual narrator reciting profound wisdom with tranquility.",
  style: "calm",
  pace: "drift",
  accent: "en-US",
  customApiKey: ""
};
