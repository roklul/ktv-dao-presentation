import React from 'react';
import { PresentationData } from '../lib/types';
import { Play, Pause, RotateCcw, Info } from 'lucide-react';

interface ControllerBarProps {
  presentation: PresentationData;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  showLotusMarker: boolean;
  onPlayToggle: () => void;
  onReset: () => void;
  onSeek: (time: number) => void;
  onSpeedChange: (speed: number) => void;
  onToggleLotus: () => void;
  statusText: string;
}

export const ControllerBar: React.FC<ControllerBarProps> = ({
  presentation,
  isPlaying,
  currentTime,
  duration,
  playbackRate,
  showLotusMarker,
  onPlayToggle,
  onReset,
  onSeek,
  onSpeedChange,
  onToggleLotus,
  statusText,
}) => {
  const maxDuration = Math.max(1, duration || presentation.totalDuration || 24.5);
  const progressPercent = Math.min(100, (currentTime / maxDuration) * 100);

  const formatClock = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickPos = (e.clientX - rect.left) / rect.width;
    const targetTime = Math.max(0, Math.min(maxDuration, clickPos * maxDuration));
    onSeek(targetTime);
  };

  return (
    <footer className="w-full max-w-6xl mt-3 bg-stone-900/85 border border-stone-800 backdrop-blur rounded-xl p-3 sm:p-4 flex flex-col gap-3 shadow-xl">
      
      {/* Timeline Bar */}
      <div className="flex items-center gap-3 w-full">
        <span className="text-xs font-mono text-amber-400 w-12 text-right">
          {formatClock(currentTime)}
        </span>
        <div
          className="relative flex-1 group cursor-pointer py-1"
          onClick={handleProgressClick}
        >
          <div className="h-2 w-full bg-stone-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 relative transition-all duration-75"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute right-0 top-0 bottom-0 w-2 bg-white shadow-[0_0_8px_#ffffff]"></div>
            </div>
          </div>
        </div>
        <span className="text-xs font-mono text-stone-400 w-12">
          {formatClock(maxDuration)}
        </span>
      </div>

      {/* Controller Action Area */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        
        {/* Play & Speed Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={onPlayToggle}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 hover:from-amber-400 hover:to-amber-200 text-stone-950 flex items-center justify-center text-lg font-bold shadow-lg shadow-amber-900/40 transform hover:scale-105 active:scale-95 transition"
            title={isPlaying ? '暫停' : '播放'}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          <button
            onClick={onReset}
            className="w-10 h-10 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition"
            title="重播起始"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Speed Selector */}
          <div className="flex items-center bg-stone-800 rounded-lg p-1 border border-stone-700 text-xs text-stone-300">
            {[0.8, 1.0, 1.2].map((s) => (
              <button
                key={s}
                onClick={() => onSpeedChange(s)}
                className={`px-2 py-0.5 rounded transition ${
                  playbackRate === s ? 'bg-amber-500/20 text-amber-300 font-bold' : 'hover:text-amber-300'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* KTV Features */}
        <div className="flex items-center gap-4 text-xs text-stone-300">
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-amber-300 transition">
            <input
              type="checkbox"
              checked={showLotusMarker}
              onChange={onToggleLotus}
              className="rounded border-stone-700 text-amber-500 focus:ring-0 bg-stone-800"
            />
            <span>KTV 蓮花跳動導唱</span>
          </label>
        </div>

        {/* Jump to Section */}
        <div className="flex items-center gap-1.5 text-xs flex-wrap">
          <span className="text-stone-400 hidden sm:inline">跳句:</span>
          {presentation.chineseVerses.map((verse, idx) => (
            <button
              key={verse.id || idx}
              onClick={() => onSeek(verse.start)}
              className="px-2 py-1 rounded bg-stone-800 hover:bg-amber-950 text-stone-300 hover:text-amber-200 border border-stone-700 transition text-[11px]"
            >
              第{['一', '二', '三', '四', '五', '六', '七', '八'][idx] || idx + 1}段
            </button>
          ))}
        </div>
      </div>

      {/* Live Status */}
      <div className="text-[11px] text-stone-400 flex items-center justify-between border-t border-stone-800 pt-2">
        <span className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{statusText}</span>
        </span>
        <span className="text-stone-400 shrink-0">時長: ~{maxDuration.toFixed(1)} 秒</span>
      </div>
    </footer>
  );
};
