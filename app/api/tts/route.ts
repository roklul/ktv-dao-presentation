import { NextRequest, NextResponse } from 'next/server';

// In-Memory Sliding Window Rate Limiter
interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitMap = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_SERVER_KEY = 10;      // 10 requests / min for server fallback key
const MAX_REQUESTS_CLIENT_KEY = 30;      // 30 requests / min for user-provided custom key

function isRateLimited(clientIp: string, isCustomKey: boolean): boolean {
  const now = Date.now();
  const limit = isCustomKey ? MAX_REQUESTS_CLIENT_KEY : MAX_REQUESTS_SERVER_KEY;
  const record = rateLimitMap.get(clientIp) || { timestamps: [] };

  // Filter timestamps within window
  record.timestamps = record.timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);

  if (record.timestamps.length >= limit) {
    return true;
  }

  record.timestamps.push(now);
  rateLimitMap.set(clientIp, record);

  // Periodically clean up stale entries (every 100 entries)
  if (rateLimitMap.size > 200) {
    for (const [ip, data] of rateLimitMap.entries()) {
      if (data.timestamps.every((ts) => now - ts >= RATE_LIMIT_WINDOW_MS)) {
        rateLimitMap.delete(ip);
      }
    }
  }

  return false;
}

// Whitelists
const ALLOWED_MODELS = new Set([
  'gemini-3.1-flash-tts-preview',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
]);

const ALLOWED_VOICES = new Set([
  'Aoede',
  'Kore',
  'Achernar',
  'Autonoe',
  'Charon',
  'Puck',
  'Fenrir',
  'Achird',
  'Algieba',
  'Algenib',
  'Alnilam',
  'Leda',
  'Callisto',
]);

const ALLOWED_STYLES = new Set([
  'whisper',
  'calm',
  'cheerful',
  'dramatic',
  'storyteller',
  'meditative',
]);

const ALLOWED_PACES = new Set(['drift', 'slow', 'medium', 'fast']);
const ALLOWED_ACCENTS = new Set(['en-US', 'en-GB', 'en-AU', 'en-IN']);

const MAX_TEXT_LENGTH = 1500; // Cap input text to prevent resource exhaustion

export async function POST(req: NextRequest) {
  try {
    // 1. IP extraction for rate limiting
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : realIp || '127.0.0.1';

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: '請提供合法的 JSON 請求資料。' }, { status: 400 });
    }

    const {
      text,
      model = 'gemini-3.1-flash-tts-preview',
      voiceId = 'Aoede',
      audioProfile,
      style = 'calm',
      pace = 'drift',
      accent = 'en-US',
      apiKey,
    } = body;

    // 2. Input validation & Whitelisting
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: '請提供要朗讀的英文文字。' }, { status: 400 });
    }

    const sanitizedText = text.trim();
    if (sanitizedText.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        {
          error: `文字長度超過限制（最大支援 ${MAX_TEXT_LENGTH} 個字元，目前長度為 ${sanitizedText.length}）。`,
        },
        { status: 400 }
      );
    }

    const safeModel = ALLOWED_MODELS.has(model) ? model : 'gemini-3.1-flash-tts-preview';
    const safeVoiceId = ALLOWED_VOICES.has(voiceId) ? voiceId : 'Aoede';
    const safeStyle = ALLOWED_STYLES.has(style) ? style : 'calm';
    const safePace = ALLOWED_PACES.has(pace) ? pace : 'drift';
    const safeAccent = ALLOWED_ACCENTS.has(accent) ? accent : 'en-US';

    const isCustomKey = !!(apiKey && typeof apiKey === 'string' && apiKey.trim().length > 0);
    const effectiveApiKey = isCustomKey ? apiKey.trim() : process.env.GEMINI_API_KEY;

    // 3. API Key & Authentication Check
    if (!effectiveApiKey) {
      return NextResponse.json(
        {
          error:
            '未檢測到 Gemini API Key。請在右上角「發音調校」中輸入您的 Google AI Studio API Key，或在部署環境變數中設定 GEMINI_API_KEY。',
        },
        { status: 401 }
      );
    }

    // 4. Rate Limiting Check
    if (isRateLimited(clientIp, isCustomKey)) {
      return NextResponse.json(
        {
          error: '請求次數過於頻繁，請稍候再試（每分鐘請求已達上限）。',
        },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
          },
        }
      );
    }

    // 5. Build prompt instructions safely
    const styleInstructionMap: Record<string, string> = {
      whisper: 'Use a soft, tranquil, whispering breath tone with gentle reverence.',
      calm: 'Use a peaceful, serene, mindful and steady cadence.',
      cheerful: 'Use an uplifting, joyful, and encouraging tone.',
      dramatic: 'Use an authoritative, profound, and deeply resonant delivery.',
      storyteller: 'Use an engaging, wise, and narrative storytelling style.',
      meditative: 'Use a deep meditative, slow-breathing, Zen master cadence.',
    };

    const paceInstructionMap: Record<string, string> = {
      drift: 'Pace: The Drift (very slow, gentle, reflective pauses between phrases).',
      slow: 'Pace: Slow and deliberate with clear articulation.',
      medium: 'Pace: Natural, moderate conversational speed.',
      fast: 'Pace: Fluent and brisk pace.',
    };

    const safeProfile =
      typeof audioProfile === 'string' && audioProfile.trim().length > 0
        ? audioProfile.trim().substring(0, 300)
        : 'A deep, resonant, compassionate Buddhist master and spiritual narrator reciting profound wisdom with tranquility.';

    const directorPrompt = `${safeProfile}
${styleInstructionMap[safeStyle] || styleInstructionMap.calm}
${paceInstructionMap[safePace] || paceInstructionMap.drift}
Accent preference: ${safeAccent}.
IMPORTANT: Recite ONLY the provided English text with supreme clarity, elegance, and spiritual poise. Do not include any commentary.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${safeModel}:generateContent?key=${effectiveApiKey}`;

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Please read and recite the following English text out loud:\n\n"${sanitizedText}"`,
            },
          ],
        },
      ],
      systemInstruction: {
        parts: [
          {
            text: directorPrompt,
          },
        ],
      },
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: safeVoiceId,
            },
          },
        },
      },
    };

    // 6. Network request with 15-second AbortController timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errText = await response.text();
        let errJson: any;
        try {
          errJson = JSON.parse(errText);
        } catch {
          errJson = { message: errText };
        }

        const upstreamErrMsg = errJson?.error?.message || errText;

        // Directly return status code and error message without cascading retries
        if (response.status === 429) {
          return NextResponse.json(
            { error: 'Gemini API 額度或速率已達上限 (429 Too Many Requests)，請稍後再試。' },
            { status: 429 }
          );
        }
        if (response.status === 401 || response.status === 403) {
          return NextResponse.json(
            { error: 'Gemini API Key 無效或權限不足，請檢查您的 API Key。' },
            { status: 403 }
          );
        }

        return NextResponse.json(
          { error: `上游服務回應錯誤 (${response.status}): ${upstreamErrMsg}` },
          { status: response.status }
        );
      }

      const data = await response.json();
      const candidate = data.candidates?.[0];
      const parts = candidate?.content?.parts || [];

      let audioData: { data: string; mimeType: string } | null = null;
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          audioData = {
            data: part.inlineData.data,
            mimeType: part.inlineData.mimeType || 'audio/pcm;rate=24000',
          };
          break;
        }
      }

      if (audioData) {
        return NextResponse.json({
          audioBase64: audioData.data,
          mimeType: audioData.mimeType,
          sampleRate: 24000,
          modelUsed: safeModel,
        });
      }

      return NextResponse.json(
        { error: 'Gemini API 未回傳音訊資料，請確認模型語音支援。' },
        { status: 500 }
      );
    } catch (fetchErr: any) {
      clearTimeout(timeoutId);
      if (fetchErr.name === 'AbortError') {
        return NextResponse.json({ error: 'TTS 請求逾時（超過 15 秒），請重試。' }, { status: 504 });
      }
      throw fetchErr;
    }
  } catch (error: any) {
    console.error('TTS API error:', error);
    return NextResponse.json({ error: error.message || '內部伺服器錯誤' }, { status: 500 });
  }
}
