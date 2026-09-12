import { SpeakerSettings, KtvLine, ChineseVerse } from './types';
import { pcmToWavBlob, base64ToArrayBuffer } from './audioSynthesizer';

export interface TTSResult {
  audioUrl: string;
  duration?: number;
  format: 'wav' | 'mp3' | 'aac' | 'speechSynthesis';
}

export async function generateGeminiSpeech(
  text: string,
  settings: SpeakerSettings
): Promise<TTSResult> {
  const apiKey = settings.customApiKey?.trim() || '';

  const response = await fetch('/api/tts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model: settings.model || 'gemini-3.1-flash-tts-preview',
      voiceId: settings.voiceId || 'Aoede',
      audioProfile: settings.audioProfile,
      style: settings.style,
      pace: settings.pace,
      accent: settings.accent,
      apiKey: apiKey,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `TTS Request failed with status ${response.status}`);
  }

  const data = await response.json();

  if (data.audioBase64) {
    const pcmBuffer = base64ToArrayBuffer(data.audioBase64);
    let blob: Blob;

    if (data.mimeType && data.mimeType.includes('wav')) {
      blob = new Blob([pcmBuffer], { type: 'audio/wav' });
    } else if (data.mimeType && data.mimeType.includes('mp3')) {
      blob = new Blob([pcmBuffer], { type: 'audio/mp3' });
    } else if (data.mimeType && (data.mimeType.includes('aac') || data.mimeType.includes('audio/x-m4a'))) {
      blob = new Blob([pcmBuffer], { type: 'audio/aac' });
    } else {
      // Default Gemini Audio PCM (24000Hz, 16bit, mono) -> convert to WAV Blob
      blob = pcmToWavBlob(pcmBuffer, data.sampleRate || 24000, 1);
    }

    const audioUrl = URL.createObjectURL(blob);
    return {
      audioUrl,
      duration: data.duration,
      format: 'wav',
    };
  }

  throw new Error('No audio content returned from Gemini API');
}

// Automatically recalculate word-level timestamps when user customizes English lines
export function alignWordTimings(
  rawLines: { en: string; cn?: string }[],
  estimatedDuration: number = 24.5
): { englishLines: KtvLine[]; chineseVerses: ChineseVerse[]; totalDuration: number } {
  // Count total words
  const parsedLines = rawLines.map((line, lineIdx) => {
    const words = line.en
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0);
    return {
      id: `line-${lineIdx + 1}`,
      rawWords: words,
      cn: line.cn || '',
    };
  });

  const totalWords = parsedLines.reduce((acc, l) => acc + l.rawWords.length, 0);
  if (totalWords === 0) {
    return { englishLines: [], chineseVerses: [], totalDuration: estimatedDuration };
  }

  // Weight word duration by syllable / character length
  let currentTime = 0.0;
  const englishLines: KtvLine[] = [];
  const chineseVerses: ChineseVerse[] = [];

  const timePerWord = estimatedDuration / (totalWords + parsedLines.length * 0.5);

  parsedLines.forEach((line, lineIdx) => {
    const lineStart = currentTime;
    const words = line.rawWords.map((wordStr, wordIdx) => {
      const wordLen = Math.max(2, wordStr.replace(/[^a-zA-Z]/g, '').length);
      const duration = Math.max(0.25, timePerWord * (wordLen / 4.5));
      const wStart = currentTime;
      const wEnd = currentTime + duration;
      currentTime = wEnd;

      const cleanWord = wordStr.toLowerCase().replace(/[^a-z]/g, '');
      const isDao = cleanWord === 'dao' || cleanWord === 'tao';

      return {
        id: `w-${lineIdx + 1}-${wordIdx + 1}`,
        text: wordStr,
        start: parseFloat(wStart.toFixed(2)),
        end: parseFloat(wEnd.toFixed(2)),
        isDao,
      };
    });

    const lineEnd = currentTime;
    // Add brief pause between lines
    currentTime += 0.35;

    englishLines.push({
      id: line.id,
      start: parseFloat(lineStart.toFixed(2)),
      end: parseFloat(lineEnd.toFixed(2)),
      words,
    });

    if (line.cn.trim()) {
      chineseVerses.push({
        id: `cn-${lineIdx + 1}`,
        text: line.cn.trim(),
        start: parseFloat(lineStart.toFixed(2)),
        end: parseFloat(lineEnd.toFixed(2)),
      });
    }
  });

  return {
    englishLines,
    chineseVerses,
    totalDuration: parseFloat(currentTime.toFixed(2)),
  };
}
