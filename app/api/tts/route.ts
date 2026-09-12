import { NextRequest, NextResponse } from 'next/server';

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

const MAX_TEXT_LENGTH = 1500;
const MAX_PAYLOAD_BYTES = 16 * 1024; // 16 KB max for request body
const BODY_READ_TIMEOUT_MS = 3000; // 3 seconds timeout for uploading/reading body

// Google AI Studio API Key format: 'AIzaSy' followed by 33 characters (39 chars total)
const GOOGLE_API_KEY_REGEX = /^AIzaSy[A-Za-z0-9_-]{33}$/;

// -------------------------------------------------------------
// Rate Limiter: In-memory sliding window with memory cap protection
// -------------------------------------------------------------
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 10; // Max 10 requests per minute per IP
const MAX_MAP_ENTRIES = 5000; // LRU/Cap protection against memory inflation

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; retryAfterSec: number } {
  const now = Date.now();

  // Periodic pruning if map grows large
  if (rateLimitMap.size > MAX_MAP_ENTRIES) {
    for (const [key, record] of rateLimitMap.entries()) {
      if (now > record.resetTime) {
        rateLimitMap.delete(key);
      }
    }
    if (rateLimitMap.size > MAX_MAP_ENTRIES) {
      let count = 0;
      for (const key of rateLimitMap.keys()) {
        rateLimitMap.delete(key);
        count++;
        if (count >= MAX_MAP_ENTRIES / 2) break;
      }
    }
  }

  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, retryAfterSec: 0 };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfterSec = Math.max(1, Math.ceil((record.resetTime - now) / 1000));
    return { allowed: false, remaining: 0, retryAfterSec };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: MAX_REQUESTS_PER_WINDOW - record.count,
    retryAfterSec: 0,
  };
}

function getClientIp(req: NextRequest): string {
  const cfConnectingIp = req.headers.get('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp.trim();

  const vercelRealIp = req.headers.get('x-vercel-forwarded-for') || req.headers.get('x-real-ip');
  if (vercelRealIp) return vercelRealIp.trim();

  const xForwardedFor = req.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    const firstIp = xForwardedFor.split(',')[0].trim();
    if (firstIp) return firstIp;
  }

  return (req as any).ip || '127.0.0.1';
}

// -------------------------------------------------------------
// Safe Body Reader with Size & Timeout Limit
// -------------------------------------------------------------
async function readJsonWithLimit<T = any>(
  req: NextRequest,
  maxBytes: number = MAX_PAYLOAD_BYTES,
  timeoutMs: number = BODY_READ_TIMEOUT_MS
): Promise<{ data?: T; errorResponse?: NextResponse }> {
  const contentType = req.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return {
      errorResponse: NextResponse.json(
        { error: '請求格式錯誤，請使用 Content-Type: application/json。' },
        { status: 415 }
      ),
    };
  }

  const contentLengthHeader = req.headers.get('content-length');
  if (contentLengthHeader) {
    const contentLength = parseInt(contentLengthHeader, 10);
    if (!isNaN(contentLength) && contentLength > maxBytes) {
      return {
        errorResponse: NextResponse.json(
          { error: `請求資料量過大（超過 ${maxBytes / 1024} KB 限制）。` },
          { status: 413 }
        ),
      };
    }
  }

  if (!req.body) {
    return {
      errorResponse: NextResponse.json(
        { error: '請求內容為空，請提供 JSON 資料。' },
        { status: 400 }
      ),
    };
  }

  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  const readPromise = (async () => {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        totalBytes += value.length;
        if (totalBytes > maxBytes) {
          try {
            await reader.cancel();
          } catch {}
          throw new Error('PAYLOAD_TOO_LARGE');
        }
        chunks.push(value);
      }
    }
    const combined = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of chunks) {
      combined.set(chunk, offset);
      offset += chunk.length;
    }
    const text = new TextDecoder('utf-8').decode(combined);
    return JSON.parse(text);
  })();

  const timeoutPromise = new Promise<never>((_, reject) => {
    const timer = setTimeout(() => {
      try {
        reader.cancel();
      } catch {}
      reject(new Error('READ_TIMEOUT'));
    }, timeoutMs);
    readPromise.finally(() => clearTimeout(timer));
  });

  try {
    const parsed = await Promise.race([readPromise, timeoutPromise]);
    return { data: parsed as T };
  } catch (err: any) {
    if (err?.message === 'PAYLOAD_TOO_LARGE') {
      return {
        errorResponse: NextResponse.json(
          { error: `請求資料量過大（超過 ${maxBytes / 1024} KB 限制）。` },
          { status: 413 }
        ),
      };
    }
    if (err?.message === 'READ_TIMEOUT') {
      return {
        errorResponse: NextResponse.json(
          { error: '讀取請求資料逾時，請檢查連線狀態。' },
          { status: 408 }
        ),
      };
    }
    return {
      errorResponse: NextResponse.json(
        { error: '無法解析 JSON 請求資料，請確認格式正確。' },
        { status: 400 }
      ),
    };
  }
}

export async function POST(req: NextRequest) {
  // 1. Rate Limiting Check (protect compute & prevent upstream flood)
  const clientIp = getClientIp(req);
  const rateLimitResult = checkRateLimit(clientIp);
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        error: `請求過於頻繁，已觸發速率限制（每分鐘上限 ${MAX_REQUESTS_PER_WINDOW} 次）。請稍候 ${rateLimitResult.retryAfterSec} 秒後再試。`,
        code: 'RATE_LIMIT_EXCEEDED',
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateLimitResult.retryAfterSec),
          'X-RateLimit-Limit': String(MAX_REQUESTS_PER_WINDOW),
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  // 2. Safe JSON Body Parsing with Size & Timeout Limits
  const { data: body, errorResponse } = await readJsonWithLimit(req);
  if (errorResponse) {
    return errorResponse;
  }

  const controller = new AbortController();
  // 15-second total lifecycle timeout covering upstream fetch and serialization
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
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

    // 3. Mandatory User API Key Check & Fast Format Validation (Zero Upstream Flood)
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
      return NextResponse.json(
        {
          error:
            '基於資安保護與額度安全，本服務不開放匿名共用 Key。請在右上角「發音調校」輸入您的 Google AI Studio API Key 即可自訂生成，或直接使用預載之高品質錄音。',
          code: 'API_KEY_REQUIRED',
        },
        { status: 401 }
      );
    }

    const userApiKey = apiKey.trim();
    if (!GOOGLE_API_KEY_REGEX.test(userApiKey)) {
      return NextResponse.json(
        {
          error:
            '提供的 Gemini API Key 格式無效（Google AI Studio 金鑰應以 AIzaSy 開頭，長度為 39 碼）。請確認後重試。',
          code: 'INVALID_API_KEY_FORMAT',
        },
        { status: 400 }
      );
    }

    // 4. Input validation & Whitelisting
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

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${safeModel}:generateContent?key=${encodeURIComponent(
      userApiKey
    )}`;

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

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errText = await response.text();
      let errJson: any;
      try {
        errJson = JSON.parse(errText);
      } catch {
        errJson = { message: errText };
      }

      const upstreamErrMsg = errJson?.error?.message || errText;

      // Stop cascading retries immediately on Client / Auth / Quota errors
      if (response.status === 429) {
        return NextResponse.json(
          { error: '您的 Gemini API 額度或請求速率已達上限 (429 Too Many Requests)，請稍後再試。' },
          { status: 429 }
        );
      }
      if (response.status === 401 || response.status === 403) {
        return NextResponse.json(
          { error: '提供的 Gemini API Key 無效或未開通權限，請檢查您的 Google AI Studio 金鑰。' },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { error: `Gemini API 回應錯誤 (${response.status}): ${upstreamErrMsg}` },
        { status: response.status }
      );
    }

    // response.json() is safely encompassed within the 15-second AbortController timeout
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
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return NextResponse.json({ error: 'TTS 請求逾時（超過 15 秒），請重試。' }, { status: 504 });
    }
    console.error('TTS API error:', error);
    return NextResponse.json({ error: error.message || '內部伺服器錯誤' }, { status: 500 });
  } finally {
    clearTimeout(timeoutId);
  }
}

