import React, { useState } from 'react';
import { SpeakerSettings, VoiceOption } from '../lib/types';
import { AVAILABLE_VOICES } from '../lib/defaultLyrics';
import { X, Mic, Sparkles, Sliders, Key, Search, Check, Play, Trash2 } from 'lucide-react';

interface SpeakerSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SpeakerSettings;
  onSave: (newSettings: SpeakerSettings) => void;
  onPreviewVoice: (voiceId: string) => void;
  onClearKey?: () => void;
}

export const SpeakerSettingsModal: React.FC<SpeakerSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
  onPreviewVoice,
  onClearKey,
}) => {
  const [localSettings, setLocalSettings] = useState<SpeakerSettings>(settings);
  const [voiceSearch, setVoiceSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'female' | 'male'>('all');
  const [showKey, setShowKey] = useState(false);

  if (!isOpen) return null;

  const filteredVoices = AVAILABLE_VOICES.filter((voice) => {
    const matchesSearch =
      voice.name.toLowerCase().includes(voiceSearch.toLowerCase()) ||
      voice.pitchTag.toLowerCase().includes(voiceSearch.toLowerCase()) ||
      voice.description.toLowerCase().includes(voiceSearch.toLowerCase());
    const matchesGender = genderFilter === 'all' || voice.gender === genderFilter;
    return matchesSearch && matchesGender;
  });

  const handleSave = () => {
    const cleanedKey = localSettings.customApiKey?.trim() || '';
    const updatedSettings = { ...localSettings, customApiKey: cleanedKey };
    onSave(updatedSettings);

    // Securely handle localStorage persistence: remove item if empty
    if (cleanedKey.length > 0) {
      localStorage.setItem('GEMINI_API_KEY', cleanedKey);
    } else {
      localStorage.removeItem('GEMINI_API_KEY');
    }
    onClose();
  };

  const handleClearKey = () => {
    setLocalSettings((prev) => ({ ...prev, customApiKey: '' }));
    localStorage.removeItem('GEMINI_API_KEY');
    if (onClearKey) {
      onClearKey();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-[#1a1714] border border-amber-500/40 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden text-stone-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800 bg-stone-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-amber-100">Speaker settings (AI Studio 聲音設定)</h2>
              <p className="text-xs text-stone-400">自訂 Gemini 3.1 TTS 英文發音、語調與角色人設</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-stone-800 text-stone-400 hover:text-stone-200 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-sm">
          
          {/* API Key Section */}
          <div className="bg-stone-900/70 p-3.5 rounded-xl border border-stone-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5" />
                Google AI Studio API Key (支援安全本機儲存)
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-amber-400 hover:underline"
              >
                獲取免費 API Key →
              </a>
            </div>
            <div className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={localSettings.customApiKey || ''}
                  onChange={(e) => setLocalSettings({ ...localSettings, customApiKey: e.target.value })}
                  placeholder="貼上您的 Gemini API Key (AIzaSy...)"
                  className="w-full bg-stone-950 border border-stone-700 focus:border-amber-400 rounded-lg px-3 py-2 text-xs text-stone-200 pr-16 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-stone-400 hover:text-stone-200 px-1.5 py-0.5 rounded bg-stone-800"
                >
                  {showKey ? '隱藏' : '顯示'}
                </button>
              </div>
              {localSettings.customApiKey && (
                <button
                  type="button"
                  onClick={handleClearKey}
                  className="px-2.5 py-2 rounded-lg bg-stone-800 hover:bg-rose-950 text-stone-400 hover:text-rose-300 text-xs border border-stone-700 flex items-center gap-1 transition"
                  title="清除儲存的 Key"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">清除</span>
                </button>
              )}
            </div>
            <p className="text-[11px] text-stone-400">
              * 您的 API Key 僅安全儲存於個人瀏覽器本機，伺服器不保存亦不提供共用金鑰。若留空儲存或點擊「清除」，將立即安全抹除。
            </p>
          </div>

          {/* Model Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-300">AI TTS 模型 (Model)</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { id: 'gemini-3.1-flash-tts-preview', label: 'gemini-3.1-flash-tts-preview', tag: '最新預覽' },
                { id: 'gemini-2.5-flash', label: 'gemini-2.5-flash', tag: '穩定推薦' },
                { id: 'gemini-2.0-flash', label: 'gemini-2.0-flash', tag: '極速生成' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setLocalSettings({ ...localSettings, model: m.id })}
                  className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                    localSettings.model === m.id
                      ? 'border-amber-400 bg-amber-500/10 text-amber-200'
                      : 'border-stone-800 bg-stone-900/40 text-stone-400 hover:border-stone-700'
                  }`}
                >
                  <span className="text-xs font-mono font-bold truncate">{m.label}</span>
                  <span className="text-[10px] text-amber-400/80 mt-1">{m.tag}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Audio Profile */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Audio Profile (聲音人設 / 靈修意境描述)
              </label>
            </div>
            <textarea
              value={localSettings.audioProfile}
              onChange={(e) => setLocalSettings({ ...localSettings, audioProfile: e.target.value })}
              rows={2}
              maxLength={300}
              className="w-full bg-stone-950 border border-stone-800 focus:border-amber-400 rounded-xl p-3 text-xs text-stone-200 focus:outline-none resize-none"
              placeholder="例如: A deep, resonant narrator of sacred wisdom with serene peace and mindfulness."
            />
          </div>

          {/* Director's Note */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-amber-300">Director&apos;s note (導演筆記與發音風格)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Style */}
              <div>
                <label className="text-[11px] text-stone-400 block mb-1">Style (情感風格)</label>
                <select
                  value={localSettings.style}
                  onChange={(e) => setLocalSettings({ ...localSettings, style: e.target.value as any })}
                  className="w-full bg-stone-950 border border-stone-800 focus:border-amber-400 rounded-lg px-2.5 py-2 text-xs text-amber-200 focus:outline-none"
                >
                  <option value="calm">Calm (寧靜沉穩)</option>
                  <option value="whisper">Whisper (輕柔耳語)</option>
                  <option value="meditative">Meditative (禪修定靜)</option>
                  <option value="storyteller">Storyteller (說書講述)</option>
                  <option value="dramatic">Dramatic (莊嚴深邃)</option>
                  <option value="cheerful">Cheerful (明朗歡喜)</option>
                </select>
              </div>

              {/* Pace */}
              <div>
                <label className="text-[11px] text-stone-400 block mb-1">Pace (語速)</label>
                <select
                  value={localSettings.pace}
                  onChange={(e) => setLocalSettings({ ...localSettings, pace: e.target.value as any })}
                  className="w-full bg-stone-950 border border-stone-800 focus:border-amber-400 rounded-lg px-2.5 py-2 text-xs text-amber-200 focus:outline-none"
                >
                  <option value="drift">The Drift (禪意慢速)</option>
                  <option value="slow">Slow (沉緩清晰)</option>
                  <option value="medium">Medium (自然中速)</option>
                  <option value="fast">Fast (流暢快速)</option>
                </select>
              </div>

              {/* Accent */}
              <div>
                <label className="text-[11px] text-stone-400 block mb-1">Accent (腔調)</label>
                <select
                  value={localSettings.accent}
                  onChange={(e) => setLocalSettings({ ...localSettings, accent: e.target.value as any })}
                  className="w-full bg-stone-950 border border-stone-800 focus:border-amber-400 rounded-lg px-2.5 py-2 text-xs text-amber-200 focus:outline-none"
                >
                  <option value="en-US">American (US)</option>
                  <option value="en-GB">British (GB)</option>
                  <option value="en-AU">Australian (AU)</option>
                  <option value="en-IN">Indian (IN)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Voice Search & Filter */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-amber-400" />
                Voice (音色庫選擇)
              </label>
              <div className="flex items-center bg-stone-950 rounded-lg p-0.5 border border-stone-800 text-[11px]">
                <button
                  type="button"
                  onClick={() => setGenderFilter('all')}
                  className={`px-2 py-1 rounded ${genderFilter === 'all' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-stone-400'}`}
                >
                  全部
                </button>
                <button
                  type="button"
                  onClick={() => setGenderFilter('female')}
                  className={`px-2 py-1 rounded ${genderFilter === 'female' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-stone-400'}`}
                >
                  女聲
                </button>
                <button
                  type="button"
                  onClick={() => setGenderFilter('male')}
                  className={`px-2 py-1 rounded ${genderFilter === 'male' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-stone-400'}`}
                >
                  男聲
                </button>
              </div>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
              <input
                type="text"
                placeholder="搜尋音色 (如 Aoede, Puck, Charon, Soft...)"
                value={voiceSearch}
                onChange={(e) => setVoiceSearch(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 focus:border-amber-400 rounded-lg pl-8 pr-3 py-1.5 text-xs text-stone-200 focus:outline-none"
              />
            </div>

            {/* Voice List */}
            <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
              {filteredVoices.map((voice) => {
                const isSelected = localSettings.voiceId === voice.id;
                return (
                  <div
                    key={voice.id}
                    onClick={() => setLocalSettings({ ...localSettings, voiceId: voice.id })}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500/15 text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                        : 'border-stone-800/80 bg-stone-900/40 text-stone-300 hover:border-stone-700 hover:bg-stone-900/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          voice.gender === 'female'
                            ? 'bg-rose-950/60 text-rose-300 border border-rose-700/50'
                            : 'bg-sky-950/60 text-sky-300 border border-sky-700/50'
                        }`}
                      >
                        {voice.gender === 'female' ? '女' : '男'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs">{voice.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-800 text-stone-400 border border-stone-700">
                            {voice.pitchTag}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-400 line-clamp-1">{voice.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPreviewVoice(voice.id);
                        }}
                        title="試聽音色"
                        className="w-7 h-7 rounded-full bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-stone-300 flex items-center justify-center transition"
                      >
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      </button>
                      {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-5 py-3.5 border-t border-stone-800 bg-stone-900/70">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs text-stone-400 hover:text-stone-200 transition"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 shadow-lg shadow-amber-900/30 transition"
          >
            儲存設定
          </button>
        </div>

      </div>
    </div>
  );
};
