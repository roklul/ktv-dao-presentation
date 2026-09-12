import React from 'react';
import { SpeakerSettings } from '../lib/types';
import { Sparkles, Sliders, Edit3, Maximize2, Minimize2, Mic } from 'lucide-react';

interface HeaderNavProps {
  settings: SpeakerSettings;
  onVoiceChange: (voiceId: string) => void;
  onOpenSpeakerSettings: () => void;
  onOpenScriptEditor: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  isGeneratingTts: boolean;
  onGenerateTts: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  settings,
  onVoiceChange,
  onOpenSpeakerSettings,
  onOpenScriptEditor,
  onToggleFullscreen,
  isFullscreen,
  isGeneratingTts,
  onGenerateTts,
}) => {
  return (
    <header className="w-full max-w-6xl mb-3 flex flex-wrap items-center justify-between gap-3 px-2">
      {/* Title & Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-300 shadow-md">
          <svg className="w-5 h-5 animate-spin-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 3v18" />
            <path d="M3 12h18" />
            <path d="m5.6 5.6 12.8 12.8" />
            <path d="m18.4 5.6-12.8 12.8" />
          </svg>
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-amber-200 via-amber-300 to-yellow-100 bg-clip-text text-transparent">
            修行法語 · 濟公活佛 KTV 聲光同步簡報
          </h1>
          <p className="text-[11px] text-stone-400">Self-Cultivation & Dao Practice · Audio-Visual Presentation</p>
        </div>
      </div>

      {/* Clean & Streamlined Actions */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        
        {/* Quick Voice Selector (Male / Female) */}
        <div className="relative inline-flex items-center">
          <span className="absolute left-2.5 text-amber-400 text-xs pointer-events-none">
            <Mic className="w-3.5 h-3.5" />
          </span>
          <select
            value={settings.voiceId}
            onChange={(e) => onVoiceChange(e.target.value)}
            className="appearance-none bg-stone-900/90 text-amber-200 border border-amber-500/40 pl-7 pr-8 py-1.5 rounded-full text-xs font-medium cursor-pointer focus:outline-none focus:border-amber-400 hover:bg-stone-800 transition shadow"
            title="選擇 Gemini 發音音色"
          >
            <optgroup label="── 女聲 (Female) ──" className="bg-stone-900 text-rose-300">
              <option value="Aoede">慈悲空靈女聲 (Aoede)</option>
              <option value="Kore">柔美祥和女聲 (Kore)</option>
              <option value="Achernar">清澈細膩女聲 (Achernar)</option>
              <option value="Autonoe">明亮清朗女聲 (Autonoe)</option>
            </optgroup>
            <optgroup label="── 男聲 (Male) ──" className="bg-stone-900 text-sky-300">
              <option value="Charon">莊嚴厚重男聲 (Charon)</option>
              <option value="Puck">自然溫暖男聲 (Puck)</option>
              <option value="Fenrir">威嚴定靜男聲 (Fenrir)</option>
              <option value="Achird">親切和緩男聲 (Achird)</option>
              <option value="Algieba">圓潤禪意男聲 (Algieba)</option>
              <option value="Algenib">滄桑醇厚男聲 (Algenib)</option>
            </optgroup>
          </select>
          <span className="absolute right-2.5 text-stone-400 text-[10px] pointer-events-none">▼</span>
        </div>

        {/* Generate Gemini 3.1 TTS Button */}
        <button
          onClick={onGenerateTts}
          disabled={isGeneratingTts}
          className="bg-gradient-to-r from-amber-600/30 to-amber-500/20 hover:from-amber-600/50 hover:to-amber-500/40 text-amber-200 border border-amber-500/50 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition text-xs shadow disabled:opacity-50"
          title="透過 Gemini 3.1 Flash TTS 生成語音"
        >
          <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${isGeneratingTts ? 'animate-spin' : ''}`} />
          <span>{isGeneratingTts ? '生成中...' : 'Gemini 3.1 TTS'}</span>
        </button>

        {/* Speaker Settings Button (Google AI Studio Panel) */}
        <button
          onClick={onOpenSpeakerSettings}
          className="bg-stone-900/90 hover:bg-stone-800 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-full text-xs transition flex items-center gap-1.5 shadow"
          title="開啟 Google AI Studio 聲音與導演筆記設定"
        >
          <Sliders className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">發音調校</span>
        </button>

        {/* Edit Script & Markdown Import Button */}
        <button
          onClick={onOpenScriptEditor}
          className="bg-stone-900/90 hover:bg-stone-800 text-stone-200 border border-stone-700 px-3 py-1.5 rounded-full text-xs transition flex items-center gap-1.5 shadow"
          title="自訂法語與 Markdown 匯入"
        >
          <Edit3 className="w-3.5 h-3.5 text-stone-400" />
          <span className="hidden sm:inline">自訂法語</span>
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={onToggleFullscreen}
          className="bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-700 px-3 py-1.5 rounded-full text-xs transition flex items-center gap-1"
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{isFullscreen ? '退出' : '全螢幕'}</span>
        </button>

      </div>
    </header>
  );
};
