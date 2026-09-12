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

export async function POST(req: NextRequest) {
  const controller = new AbortController();
  // 15-second timeout covering the entire request, network, and body parsing lifecycle
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
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

    // 1. Mandatory User API Key Check (Zero Server Key Exposure)
    // Server-side shared key is completely disabled for public callers.
    // Callers MUST provide their own valid Google AI Studio API Key.
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
    // Guaranteed timeout cleanup covering full lifecycle
    clearTimeout(timeoutId);
  }
}
