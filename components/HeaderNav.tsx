import React from 'react';
import { SpeakerSettings } from '../lib/types';
import { Sparkles, Sliders, Edit3, Maximize2, Minimize2, UserCheck } from 'lucide-react';

interface HeaderNavProps {
  settings: SpeakerSettings;
  activePreset: 'speaker-1' | 'speaker-2' | 'custom';
  onSelectSpeakerPreset: (preset: 'speaker-1' | 'speaker-2') => void;
  onOpenSpeakerSettings: () => void;
  onOpenScriptEditor: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  isGeneratingTts: boolean;
  onGenerateTts: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  settings,
  activePreset,
  onSelectSpeakerPreset,
  onOpenSpeakerSettings,
  onOpenScriptEditor,
  onToggleFullscreen,
  isFullscreen,
  isGeneratingTts,
  onGenerateTts,
}) => {
  return (
    <header className="w-full max-w-6xl mb-2 sm:mb-3 flex flex-wrap items-center justify-between gap-1.5 sm:gap-2.5 px-1 sm:px-2">
      {/* Minimal Brand Badge */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow">
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 3v18" />
            <path d="M3 12h18" />
            <path d="m5.6 5.6 12.8 12.8" />
            <path d="m18.4 5.6-12.8 12.8" />
          </svg>
        </div>
        <span className="text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-200 to-yellow-100 bg-clip-text text-transparent">
          修行法語
        </span>
      </div>

      {/* Speaker 1 & Speaker 2 Presets + Core Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap text-xs">
        
        {/* Speaker 1 & Speaker 2 Quick Toggle Buttons */}
        <div className="flex items-center bg-stone-900/90 rounded-full p-0.5 sm:p-1 border border-amber-500/30 shadow">
          <button
            onClick={() => onSelectSpeakerPreset('speaker-1')}
            className={`px-2 sm:px-3 py-1 rounded-full font-medium transition flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs ${
              activePreset === 'speaker-1'
                ? 'bg-gradient-to-r from-rose-900/80 to-amber-900/80 text-rose-200 border border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Speaker 1: 慈悲空靈女聲 (Aoede / Calm / Drift 禪意慢速)"
          >
            <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold flex items-center justify-center border border-rose-500/40">
              1
            </span>
            <span><span className="hidden md:inline">Speaker 1 </span>慈悲女聲</span>
          </button>

          <button
            onClick={() => onSelectSpeakerPreset('speaker-2')}
            className={`px-2 sm:px-3 py-1 rounded-full font-medium transition flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs ${
              activePreset === 'speaker-2'
                ? 'bg-gradient-to-r from-purple-900/80 to-amber-900/80 text-purple-200 border border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Speaker 2: 莊嚴祥和女聲 (Kore / Meditative / Slow 沉穩慢速)"
          >
            <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold flex items-center justify-center border border-purple-500/40">
              2
            </span>
            <span><span className="hidden md:inline">Speaker 2 </span>莊嚴女聲</span>
          </button>
        </div>

        {/* Generate Gemini 3.1 TTS Button */}
        <button
          onClick={onGenerateTts}
          disabled={isGeneratingTts}
          className="bg-gradient-to-r from-amber-600/30 to-amber-500/20 hover:from-amber-600/50 hover:to-amber-500/40 text-amber-200 border border-amber-500/50 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full flex items-center gap-1 sm:gap-1.5 transition text-[11px] sm:text-xs shadow disabled:opacity-50"
          title="透過 Gemini 3.1 Flash TTS 生成當前 Speaker 語音"
        >
          <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${isGeneratingTts ? 'animate-spin' : ''}`} />
          <span>{isGeneratingTts ? '生成中...' : 'Gemini 3.1'}<span className="hidden sm:inline"> TTS</span></span>
        </button>

        {/* Speaker Settings Button (Google AI Studio Panel) */}
        <button
          onClick={onOpenSpeakerSettings}
          className="bg-stone-900/90 hover:bg-stone-800 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-full text-xs transition flex items-center gap-1.5 shadow"
          title="開啟 Google AI Studio 聲音、導演筆記與 API Key 設定"
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
