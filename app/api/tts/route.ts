import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      text,
      model = 'gemini-3.1-flash-tts-preview',
      voiceId = 'Aoede',
      audioProfile = 'A deep, resonant, compassionate Buddhist master and spiritual narrator reciting profound wisdom with tranquility.',
      style = 'calm',
      pace = 'drift',
      accent = 'en-US',
      apiKey,
    } = body;

    const effectiveApiKey = apiKey || process.env.GEMINI_API_KEY;

    if (!effectiveApiKey) {
      return NextResponse.json(
        {
          error:
            '未檢測到 Gemini API Key。請在右上角設定中輸入您的 Google AI Studio API Key，或在 Vercel 環境變數中設定 GEMINI_API_KEY。',
        },
        { status: 400 }
      );
    }

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: '請提供要朗讀的英文文字。' }, { status: 400 });
    }

    // Build director style prompt instructions
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

    const directorPrompt = `${audioProfile}
${styleInstructionMap[style] || styleInstructionMap.calm}
${paceInstructionMap[pace] || paceInstructionMap.drift}
Accent preference: ${accent}.
IMPORTANT: Recite ONLY the provided English text with supreme clarity, elegance, and spiritual poise. Do not include any introductory, concluding remarks, or markdown.`;

    // Try selected model, with fallback models if preview is rate-limited or unavailable
    const candidateModels = [
      model,
      'gemini-2.5-flash',
      'gemini-2.0-flash',
    ].filter((m, idx, arr) => arr.indexOf(m) === idx);

    let lastError: any = null;
    let audioData: { data: string; mimeType: string } | null = null;

    for (const targetModel of candidateModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${effectiveApiKey}`;

        const payload = {
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `Please read and recite the following English text out loud:\n\n"${text.trim()}"`,
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
                  voiceName: voiceId,
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
        });

        if (!response.ok) {
          const errText = await response.text();
          let errJson;
          try {
            errJson = JSON.parse(errText);
          } catch {
            errJson = { message: errText };
          }
          lastError = errJson?.error?.message || errText;
          console.warn(`Model ${targetModel} returned status ${response.status}:`, lastError);
          continue; // Try next candidate model
        }

        const data = await response.json();
        const candidate = data.candidates?.[0];
        const parts = candidate?.content?.parts || [];

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
            modelUsed: targetModel,
          });
        }
      } catch (err: any) {
        lastError = err.message;
        console.warn(`Error calling model ${targetModel}:`, err);
      }
    }

    return NextResponse.json(
      {
        error: lastError || 'Gemini API 未回傳音訊資料，請確認 API Key 權限與模型設定。',
      },
      { status: 500 }
    );
  } catch (error: any) {
    console.error('TTS API error:', error);
    return NextResponse.json(
      { error: error.message || '內部伺服器錯誤' },
      { status: 500 }
    );
  }
}
