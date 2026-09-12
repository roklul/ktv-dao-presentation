import React, { useRef } from 'react';
import { SpeakerSettings, BackgroundStyle } from '../lib/types';
import { AVAILABLE_VOICES, PRESET_AUDIO_TRACKS } from '../lib/defaultLyrics';
import { Sparkles, Sliders, Edit3, Upload, Maximize2, Minimize2, Mic, Image, Music } from 'lucide-react';

interface HeaderNavProps {
  settings: SpeakerSettings;
  backgroundStyle: BackgroundStyle;
  onBackgroundStyleChange: (style: BackgroundStyle) => void;
  onCustomImageUpload: (file: File) => void;
  selectedAudioTrack: string;
  onAudioTrackSelect: (trackId: string) => void;
  onVoiceChange: (voiceId: string) => void;
  onOpenSpeakerSettings: () => void;
  onOpenScriptEditor: () => void;
  onAudioFileUpload: (file: File) => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  isGeneratingTts: boolean;
  onGenerateTts: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  settings,
  backgroundStyle,
  onBackgroundStyleChange,
  onCustomImageUpload,
  selectedAudioTrack,
  onAudioTrackSelect,
  onVoiceChange,
  onOpenSpeakerSettings,
  onOpenScriptEditor,
  onAudioFileUpload,
  onToggleFullscreen,
  isFullscreen,
  isGeneratingTts,
  onGenerateTts,
}) => {
  const audioFileInputRef = useRef<HTMLInputElement>(null);
  const imgFileInputRef = useRef<HTMLInputElement>(null);

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onAudioFileUpload(file);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onCustomImageUpload(file);
    }
  };

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

      {/* Actions & Voice Controls */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        
        {/* Background Style Switcher */}
        <div className="relative inline-flex items-center">
          <span className="absolute left-2.5 text-amber-400 text-xs pointer-events-none">
            <Image className="w-3.5 h-3.5" />
          </span>
          <select
            value={backgroundStyle}
            onChange={(e) => {
              const val = e.target.value as BackgroundStyle;
              if (val === 'custom-image') {
                imgFileInputRef.current?.click();
              } else {
                onBackgroundStyleChange(val);
              }
            }}
            className="appearance-none bg-stone-900/90 text-amber-200 border border-amber-500/40 pl-7 pr-7 py-1.5 rounded-full text-xs font-medium cursor-pointer focus:outline-none focus:border-amber-400 hover:bg-stone-800 transition shadow"
            title="切換背景風格"
          >
            <option value="realistic-photo">典雅名畫背景 (Realistic)</option>
            <option value="dark-svg">暗黑禪意向量風 (Vector SVG)</option>
            <option value="custom-image">自訂背景圖 (Upload Image...)</option>
          </select>
          <span className="absolute right-2 text-stone-400 text-[10px] pointer-events-none">▼</span>
          <input
            ref={imgFileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageFileChange}
            className="hidden"
          />
        </div>

        {/* Audio Track / Source Preset Selector */}
        <div className="relative inline-flex items-center">
          <span className="absolute left-2.5 text-amber-400 text-xs pointer-events-none">
            <Music className="w-3.5 h-3.5" />
          </span>
          <select
            value={selectedAudioTrack}
            onChange={(e) => onAudioTrackSelect(e.target.value)}
            className="appearance-none bg-stone-900/90 text-amber-200 border border-amber-500/40 pl-7 pr-7 py-1.5 rounded-full text-xs font-medium cursor-pointer focus:outline-none focus:border-amber-400 hover:bg-stone-800 transition shadow"
            title="切換音訊來源"
          >
            {PRESET_AUDIO_TRACKS.map((track) => (
              <option key={track.id} value={track.id}>
                {track.name}
              </option>
            ))}
          </select>
          <span className="absolute right-2 text-stone-400 text-[10px] pointer-events-none">▼</span>
        </div>

        {/* Voice Selector for TTS */}
        <div className="relative inline-flex items-center">
          <span className="absolute left-2.5 text-amber-400 text-xs pointer-events-none">
            <Mic className="w-3.5 h-3.5" />
          </span>
          <select
            value={settings.voiceId}
            onChange={(e) => onVoiceChange(e.target.value)}
            className="appearance-none bg-stone-900/90 text-amber-200 border border-amber-500/40 pl-7 pr-7 py-1.5 rounded-full text-xs font-medium cursor-pointer focus:outline-none focus:border-amber-400 hover:bg-stone-800 transition shadow"
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
          <span className="absolute right-2 text-stone-400 text-[10px] pointer-events-none">▼</span>
        </div>

        {/* Generate Gemini 3.1 TTS Button */}
        <button
          onClick={onGenerateTts}
          disabled={isGeneratingTts}
          className="bg-gradient-to-r from-amber-600/30 to-amber-500/20 hover:from-amber-600/50 hover:to-amber-500/40 text-amber-200 border border-amber-500/50 px-3 py-1.5 rounded-full flex items-center gap-1.5 transition text-xs shadow disabled:opacity-50"
          title="透過 Gemini 3.1 Flash TTS 生成語音"
        >
          <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${isGeneratingTts ? 'animate-spin' : ''}`} />
          <span>{isGeneratingTts ? '生成中...' : 'Gemini 3.1 TTS'}</span>
        </button>

        {/* Speaker Settings Button */}
        <button
          onClick={onOpenSpeakerSettings}
          className="bg-stone-900/90 hover:bg-stone-800 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-full text-xs transition flex items-center gap-1.5 shadow"
          title="開啟 Google AI Studio 聲音與導演筆記設定"
        >
          <Sliders className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">發音調校</span>
        </button>

        {/* Edit Script & Translations Button */}
        <button
          onClick={onOpenScriptEditor}
          className="bg-stone-900/90 hover:bg-stone-800 text-stone-300 border border-stone-700 px-3 py-1.5 rounded-full text-xs transition flex items-center gap-1.5"
          title="自訂英文法語與中文翻譯"
        >
          <Edit3 className="w-3.5 h-3.5 text-stone-400" />
          <span className="hidden sm:inline">自訂法語</span>
        </button>

        {/* Upload Audio File */}
        <label className="cursor-pointer bg-stone-900/90 hover:bg-stone-800 text-stone-300 border border-stone-700 px-3 py-1.5 rounded-full flex items-center gap-1.5 transition text-xs shadow">
          <Upload className="w-3.5 h-3.5 text-amber-400" />
          <span>載入音檔</span>
          <input
            ref={audioFileInputRef}
            type="file"
            accept="audio/*,.wav,.mp3,.aac,.m4a"
            onChange={handleAudioFileChange}
            className="hidden"
          />
        </label>

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
