import React, { useState } from 'react';
import { PresentationData } from '../lib/types';
import { alignWordTimings } from '../lib/geminiTts';
import { DEFAULT_PRESENTATION } from '../lib/defaultLyrics';
import { X, Plus, Trash2, Sparkles, BookOpen, RotateCcw, FileText, Check } from 'lucide-react';

interface ScriptEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPresentation: PresentationData;
  onApply: (newPresentation: PresentationData) => void;
  onTriggerTtsGeneration: (text: string) => void;
}

interface ScriptLine {
  en: string;
  cn: string;
}

export const ScriptEditorModal: React.FC<ScriptEditorModalProps> = ({
  isOpen,
  onClose,
  currentPresentation,
  onApply,
  onTriggerTtsGeneration,
}) => {
  // Convert current presentation lines to editable rows
  const [lines, setLines] = useState<ScriptLine[]>(() => {
    return currentPresentation.englishLines.map((enLine, idx) => ({
      en: enLine.words.map((w) => w.text).join(' '),
      cn: currentPresentation.chineseVerses[idx]?.text || '',
    }));
  });

  const [bulkMode, setBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState('');

  if (!isOpen) return null;

  const handleAddLine = () => {
    setLines([...lines, { en: '', cn: '' }]);
  };

  const handleRemoveLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleUpdateLine = (index: number, field: 'en' | 'cn', val: string) => {
    const next = [...lines];
    next[index][field] = val;
    setLines(next);
  };

  const handleLoadPreset = (type: 'jigong' | 'daodejing' | 'heartsutra') => {
    if (type === 'jigong') {
      const defaultLines = DEFAULT_PRESENTATION.englishLines.map((enLine, idx) => ({
        en: enLine.words.map((w) => w.text).join(' '),
        cn: DEFAULT_PRESENTATION.chineseVerses[idx]?.text || '',
      }));
      setLines(defaultLines);
    } else if (type === 'daodejing') {
      setLines([
        {
          en: 'The Dao that can be told is not the eternal Dao.',
          cn: '道可道，非常道。',
        },
        {
          en: 'The name that can be named is not the eternal name.',
          cn: '名可名，非常名。',
        },
        {
          en: 'The nameless is the beginning of heaven and earth.',
          cn: '無名天地之始；有名萬物之母。',
        },
        {
          en: 'Therefore, constantly without desire, one observes its essence.',
          cn: '故常無欲，以觀其妙；常有欲，以觀其徼。',
        },
      ]);
    } else if (type === 'heartsutra') {
      setLines([
        {
          en: 'When practicing the deep Prajna Paramita, one perceives that all five aggregates are empty.',
          cn: '照見五蘊皆空，度一切苦厄。',
        },
        {
          en: 'Form is emptiness, emptiness is form.',
          cn: '色不異空，空不異色，色即是空，空即是色。',
        },
        {
          en: 'Thus, there is no suffering, no cause of suffering, no cessation, and no path.',
          cn: '無苦集滅道，無智亦無得。',
        },
      ]);
    }
  };

  const handleApply = (triggerGenerate: boolean = false) => {
    const validLines = lines.filter((l) => l.en.trim().length > 0);
    if (validLines.length === 0) return;

    const fullEnText = validLines.map((l) => l.en.trim()).join(' ');
    const estimatedSecs = Math.max(12, validLines.length * 4.5);
    const newPres = alignWordTimings(validLines, estimatedSecs);

    const updatedPresentation: PresentationData = {
      ...currentPresentation,
      englishLines: newPres.englishLines,
      chineseVerses: newPres.chineseVerses,
      totalDuration: newPres.totalDuration,
    };

    onApply(updatedPresentation);

    if (triggerGenerate) {
      onTriggerTtsGeneration(fullEnText);
    }
    onClose();
  };

  const handleBulkParse = () => {
    const rawLines = bulkText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    const parsed: ScriptLine[] = [];

    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i];
      if (line.includes('//') || line.includes('——') || line.includes('|')) {
        const parts = line.split(/[/|——]/);
        parsed.push({
          en: parts[0]?.trim() || '',
          cn: parts[1]?.trim() || '',
        });
      } else {
        // If line is english, check if next line is chinese
        const hasChinese = /[\u4e00-\u9fa5]/.test(line);
        if (!hasChinese && i + 1 < rawLines.length && /[\u4e00-\u9fa5]/.test(rawLines[i + 1])) {
          parsed.push({
            en: line,
            cn: rawLines[i + 1],
          });
          i++; // Skip next line
        } else {
          parsed.push({
            en: !hasChinese ? line : '',
            cn: hasChinese ? line : '',
          });
        }
      }
    }

    if (parsed.length > 0) {
      setLines(parsed);
      setBulkMode(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-[#1a1714] border border-amber-500/40 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden text-stone-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800 bg-stone-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-amber-100">自訂英文內容與中文翻譯</h2>
              <p className="text-xs text-stone-400">上方為英文法語 (Gemini TTS 朗讀對象)，下方為對應中文翻譯</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-stone-800 text-stone-400 hover:text-stone-200 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets & Mode Selector */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-2.5 bg-stone-950/60 border-b border-stone-800/80 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-stone-400">快速範例:</span>
            <button
              onClick={() => handleLoadPreset('jigong')}
              className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-amber-950 hover:text-amber-300 text-stone-300 border border-stone-700 transition"
            >
              濟公活佛法語
            </button>
            <button
              onClick={() => handleLoadPreset('daodejing')}
              className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-amber-950 hover:text-amber-300 text-stone-300 border border-stone-700 transition"
            >
              道德經選段
            </button>
            <button
              onClick={() => handleLoadPreset('heartsutra')}
              className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-amber-950 hover:text-amber-300 text-stone-300 border border-stone-700 transition"
            >
              般若波羅蜜多
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setBulkMode(!bulkMode)}
              className="text-amber-400 hover:text-amber-300 text-xs flex items-center gap-1 hover:underline"
            >
              <FileText className="w-3.5 h-3.5" />
              {bulkMode ? '切換逐段編輯' : '批次貼上文字'}
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {bulkMode ? (
            <div className="space-y-3">
              <label className="text-xs text-stone-300 block">
                批次貼上法語（每兩行為一組：第1行英文，第2行中文翻譯，或使用 <code className="text-amber-300">英文 | 中文</code>）：
              </label>
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                rows={10}
                placeholder="Self-cultivation is for self. | 修行是為了自己。&#10;Cultivation is for a lifetime. | 修行是一生的。"
                className="w-full bg-stone-950 border border-stone-800 focus:border-amber-400 rounded-xl p-3 text-xs text-stone-200 font-mono focus:outline-none"
              />
              <button
                onClick={handleBulkParse}
                className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 rounded-xl text-xs font-semibold"
              >
                解析並匯入
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {lines.map((line, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-stone-900/50 rounded-xl border border-stone-800/80 space-y-2 relative group hover:border-stone-700 transition"
                >
                  <div className="flex items-center justify-between text-xs text-stone-400">
                    <span className="font-bold text-amber-400/90">第 {idx + 1} 段 (Verse {idx + 1})</span>
                    {lines.length > 1 && (
                      <button
                        onClick={() => handleRemoveLine(idx)}
                        className="text-stone-500 hover:text-rose-400 transition"
                        title="刪除此段"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* English Input */}
                  <div>
                    <label className="text-[11px] text-amber-300/80 block mb-0.5">英文內容 (Gemini TTS 朗讀對象):</label>
                    <input
                      type="text"
                      value={line.en}
                      onChange={(e) => handleUpdateLine(idx, 'en', e.target.value)}
                      placeholder="輸入英文語句 (例如: Cultivation is for a lifetime...)"
                      className="w-full bg-stone-950 border border-stone-800 focus:border-amber-400 rounded-lg px-3 py-1.5 text-xs text-amber-100 focus:outline-none font-serif-en"
                    />
                  </div>

                  {/* Chinese Input */}
                  <div>
                    <label className="text-[11px] text-stone-400 block mb-0.5">中文對應翻譯 (下方字幕顯示):</label>
                    <input
                      type="text"
                      value={line.cn}
                      onChange={(e) => handleUpdateLine(idx, 'cn', e.target.value)}
                      placeholder="輸入中文翻譯 (例如: 修行是一生的，與年齡無關。)"
                      className="w-full bg-stone-950 border border-stone-800 focus:border-amber-400 rounded-lg px-3 py-1.5 text-xs text-stone-300 focus:outline-none"
                    />
                  </div>
                </div>
              ))}

              <button
                onClick={handleAddLine}
                className="w-full py-2.5 rounded-xl border border-dashed border-stone-700 hover:border-amber-400/60 bg-stone-900/30 hover:bg-stone-900/60 text-stone-400 hover:text-amber-200 text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" />
                新增一段法語
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-t border-stone-800 bg-stone-900/70">
          <div className="text-[11px] text-stone-400">
            * 系統將自動為每個單字分配 KTV 逐字跳動與亮燈時間戳
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleApply(false)}
              className="px-4 py-2 rounded-xl text-xs bg-stone-800 hover:bg-stone-700 text-stone-200 transition"
            >
              僅更新字幕
            </button>
            <button
              onClick={() => handleApply(true)}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 shadow-lg shadow-amber-900/30 flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              套用並生成 Gemini 3.1 語音
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
