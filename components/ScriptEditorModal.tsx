import React, { useState, useRef, useEffect } from 'react';
import { PresentationData } from '../lib/types';
import { alignWordTimings } from '../lib/geminiTts';
import { DEFAULT_PRESENTATION } from '../lib/defaultLyrics';
import {
  X,
  Plus,
  Trash2,
  Sparkles,
  BookOpen,
  FileText,
  Upload,
  Download,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  FileCode,
} from 'lucide-react';

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

const SAMPLE_MD_TEMPLATE = `# 修行法語 · 濟公活佛 (Self-Cultivation Verses)
# 格式說明：每組法語由兩行組成，上行為【英文朗讀】，下行為【中文對照翻譯】。

Self-cultivation is for self, it does not matter in society or alone.
修行是為了自己，與是否身處社會無關。

Cultivation is for a lifetime, it does not matter if one is young or old, new to Dao or been many years.
修行是一生的，與年齡、修行經驗無關。

Self cultivation does not depend on being in the Dao environment or not.
修行不依賴是否身處道場。

Therefore, when all is quiet, self cultivation does not stop.
因此，即使萬籟俱寂，修行也不會停止。
`;

export const ScriptEditorModal: React.FC<ScriptEditorModalProps> = ({
  isOpen,
  onClose,
  currentPresentation,
  onApply,
  onTriggerTtsGeneration,
}) => {
  const [activeTab, setActiveTab] = useState<'markdown' | 'cards'>('markdown');
  const [mdContent, setMdContent] = useState('');
  const [lines, setLines] = useState<ScriptLine[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize from current presentation on open
  useEffect(() => {
    if (isOpen) {
      const currentLines: ScriptLine[] = currentPresentation.englishLines.map((enLine, idx) => ({
        en: enLine.words.map((w) => w.text).join(' '),
        cn: currentPresentation.chineseVerses[idx]?.text || '',
      }));
      setLines(currentLines);

      // Generate Markdown representation
      const initialMd = currentLines
        .map((l) => `${l.en}\n${l.cn}`)
        .join('\n\n');
      setMdContent(initialMd);
    }
  }, [isOpen, currentPresentation]);

  if (!isOpen) return null;

  // Robust Markdown Parser for "上英下中" format
  const parseMarkdownText = (text: string): ScriptLine[] => {
    const rawLines = text
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('#') && !s.startsWith('//') && !s.startsWith('<!--'));

    const parsed: ScriptLine[] = [];

    for (let i = 0; i < rawLines.length; i++) {
      let line = rawLines[i];

      // Clean markdown bullets / bold labels
      line = line
        .replace(/^[-*+]\s+/, '')
        .replace(/^\d+\.\s+/, '')
        .replace(/^\*\*EN:\*\*\s*/i, '')
        .replace(/^EN:\s*/i, '')
        .trim();

      // Check pipe format: "English | 中文"
      if (line.includes('|') || line.includes('——') || line.includes('//')) {
        const parts = line.split(/[|——//]/);
        if (parts.length >= 2) {
          parsed.push({
            en: parts[0].trim(),
            cn: parts[1].trim(),
          });
          continue;
        }
      }

      // Check if current line is English and next line is Chinese
      const isEnglish = /^[a-zA-Z0-9\s,.'":;!?-]+$/.test(line) || !/[\u4e00-\u9fa5]/.test(line);

      if (isEnglish) {
        let cnText = '';
        if (i + 1 < rawLines.length) {
          let nextLine = rawLines[i + 1]
            .replace(/^[-*+]\s+/, '')
            .replace(/^\d+\.\s+/, '')
            .replace(/^\*\*CN:\*\*\s*/i, '')
            .replace(/^CN:\s*/i, '')
            .trim();

          // If next line contains Chinese characters
          if (/[\u4e00-\u9fa5]/.test(nextLine)) {
            cnText = nextLine;
            i++; // consume next line
          }
        }
        parsed.push({
          en: line,
          cn: cnText,
        });
      } else {
        // Line has Chinese, fallback as standalone
        parsed.push({
          en: '',
          cn: line,
        });
      }
    }

    return parsed.filter((p) => p.en.length > 0 || p.cn.length > 0);
  };

  const handleMdChange = (val: string) => {
    setMdContent(val);
    const parsed = parseMarkdownText(val);
    setLines(parsed);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          setMdContent(content);
          const parsed = parseMarkdownText(content);
          setLines(parsed);
          setActiveTab('markdown');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([SAMPLE_MD_TEMPLATE], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dharma-script-template.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCurrentMd = () => {
    const exportText = `# 修行法語 · 匯出檔\n\n` + lines.map((l) => `${l.en}\n${l.cn}`).join('\n\n');
    const blob = new Blob([exportText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-dharma-script.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadPreset = (type: 'jigong' | 'daodejing' | 'heartsutra') => {
    if (type === 'jigong') {
      const defaultLines = DEFAULT_PRESENTATION.englishLines.map((enLine, idx) => ({
        en: enLine.words.map((w) => w.text).join(' '),
        cn: DEFAULT_PRESENTATION.chineseVerses[idx]?.text || '',
      }));
      setLines(defaultLines);
      setMdContent(defaultLines.map((l) => `${l.en}\n${l.cn}`).join('\n\n'));
    } else if (type === 'daodejing') {
      const ddjLines = [
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
          en: 'Therefore, constantly without desire, one observes its profound mystery.',
          cn: '故常無欲，以觀其妙；常有欲，以觀其徼。',
        },
      ];
      setLines(ddjLines);
      setMdContent(ddjLines.map((l) => `${l.en}\n${l.cn}`).join('\n\n'));
    } else if (type === 'heartsutra') {
      const hsLines = [
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
      ];
      setLines(hsLines);
      setMdContent(hsLines.map((l) => `${l.en}\n${l.cn}`).join('\n\n'));
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-[#1a1714] border border-amber-500/40 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden text-stone-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800 bg-stone-900/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-amber-100">自訂法語與 Markdown 匯入</h2>
              <p className="text-xs text-stone-400">支援 .md 檔案匯入，採用「上行英文、下行中文翻譯」標準格式</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-stone-800 text-stone-400 hover:text-stone-200 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prominent Format Reminder Banner */}
        <div className="mx-5 mt-4 p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-200">
          <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-amber-300">
              💡 Markdown 格式規範：上英下中（每兩行為一組）
            </div>
            <p className="text-stone-300 text-[11px] leading-relaxed">
              第 1 行：<strong>英文法語</strong>（Gemini TTS 發音朗讀對象）<br />
              第 2 行：<strong>中文翻譯</strong>（下方字幕同步對照顯示）<br />
              段落之間請保留一個空行。
            </p>
          </div>
        </div>

        {/* Toolbar: Actions & Presets */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 border-b border-stone-800/80 text-xs">
          {/* Presets */}
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

          {/* Import / Export / Tab Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/30 flex items-center gap-1 transition shadow"
            >
              <Upload className="w-3 h-3" />
              匯入 .md 檔
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.markdown,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />

            <button
              onClick={handleDownloadTemplate}
              className="px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 flex items-center gap-1 transition"
              title="下載 Markdown 範本檔"
            >
              <Download className="w-3 h-3" />
              下載範本
            </button>

            <button
              onClick={handleExportCurrentMd}
              className="px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 flex items-center gap-1 transition"
              title="匯出當前法語為 .md"
            >
              <FileText className="w-3 h-3" />
              匯出 .md
            </button>

            <div className="flex items-center bg-stone-950 rounded-lg p-0.5 border border-stone-800 text-[11px] ml-1">
              <button
                onClick={() => setActiveTab('markdown')}
                className={`px-2.5 py-0.5 rounded ${
                  activeTab === 'markdown' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-stone-400'
                }`}
              >
                Markdown 編輯
              </button>
              <button
                onClick={() => setActiveTab('cards')}
                className={`px-2.5 py-0.5 rounded ${
                  activeTab === 'cards' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-stone-400'
                }`}
              >
                逐段預覽 ({lines.length}段)
              </button>
            </div>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {activeTab === 'markdown' ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-400">
                <span>編輯或貼上您的 Markdown 內容：</span>
                <span className="text-amber-400 font-mono">
                  已解析 {lines.length} 組「上英下中」法語
                </span>
              </div>
              <textarea
                value={mdContent}
                onChange={(e) => handleMdChange(e.target.value)}
                rows={11}
                placeholder={SAMPLE_MD_TEMPLATE}
                className="w-full bg-stone-950 border border-stone-800 focus:border-amber-400 rounded-xl p-3.5 text-xs text-stone-100 font-mono leading-relaxed focus:outline-none resize-none"
              />
            </div>
          ) : (
            <div className="space-y-3">
              {lines.map((line, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-stone-900/60 rounded-xl border border-stone-800/80 space-y-2 relative group hover:border-stone-700 transition"
                >
                  <div className="flex items-center justify-between text-xs text-stone-400">
                    <span className="font-bold text-amber-400">第 {idx + 1} 段 (Verse {idx + 1})</span>
                    {lines.length > 1 && (
                      <button
                        onClick={() => {
                          const next = lines.filter((_, i) => i !== idx);
                          setLines(next);
                          setMdContent(next.map((l) => `${l.en}\n${l.cn}`).join('\n\n'));
                        }}
                        className="text-stone-500 hover:text-rose-400 transition"
                        title="刪除此段"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* English Line */}
                  <div>
                    <label className="text-[11px] text-amber-300/90 block mb-0.5">英文內容 (Gemini TTS 朗讀對象):</label>
                    <input
                      type="text"
                      value={line.en}
                      onChange={(e) => {
                        const next = [...lines];
                        next[idx].en = e.target.value;
                        setLines(next);
                        setMdContent(next.map((l) => `${l.en}\n${l.cn}`).join('\n\n'));
                      }}
                      className="w-full bg-stone-950 border border-stone-800 focus:border-amber-400 rounded-lg px-3 py-1.5 text-xs text-amber-100 focus:outline-none font-serif-en"
                    />
                  </div>

                  {/* Chinese Line */}
                  <div>
                    <label className="text-[11px] text-stone-400 block mb-0.5">中文對應翻譯 (下方字幕顯示):</label>
                    <input
                      type="text"
                      value={line.cn}
                      onChange={(e) => {
                        const next = [...lines];
                        next[idx].cn = e.target.value;
                        setLines(next);
                        setMdContent(next.map((l) => `${l.en}\n${l.cn}`).join('\n\n'));
                      }}
                      className="w-full bg-stone-950 border border-stone-800 focus:border-amber-400 rounded-lg px-3 py-1.5 text-xs text-stone-300 focus:outline-none"
                    />
                  </div>
                </div>
              ))}

              <button
                onClick={() => {
                  const next = [...lines, { en: '', cn: '' }];
                  setLines(next);
                  setMdContent(next.map((l) => `${l.en}\n${l.cn}`).join('\n\n'));
                }}
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
            * 系統將自動為每個英文單字分配 KTV 逐字跳動時間戳
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
