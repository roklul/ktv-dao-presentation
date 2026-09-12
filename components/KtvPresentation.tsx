import React, { useEffect, useRef, useState } from 'react';
import { PresentationData } from '../lib/types';

interface KtvPresentationProps {
  presentation: PresentationData;
  currentTime: number;
  showLotusMarker: boolean;
  viewportRef: React.RefObject<HTMLDivElement>;
}

export const KtvPresentation: React.FC<KtvPresentationProps> = ({
  presentation,
  currentTime,
  showLotusMarker,
  viewportRef,
}) => {
  const [lotusPos, setLotusPos] = useState<{ left: number; top: number; visible: boolean }>({
    left: 0,
    top: 0,
    visible: false,
  });

  const activeWordRef = useRef<HTMLSpanElement | null>(null);

  // Update active word positions for bouncing lotus ball smoothly
  useEffect(() => {
    if (!showLotusMarker || !activeWordRef.current || !viewportRef.current) {
      setLotusPos((prev) => ({ ...prev, visible: false }));
      return;
    }

    const rect = activeWordRef.current.getBoundingClientRect();
    const viewportRect = viewportRef.current.getBoundingClientRect();

    const relativeLeft = rect.left - viewportRect.left + rect.width / 2 - 8;
    const relativeTop = rect.top - viewportRect.top - 24;

    setLotusPos({
      left: relativeLeft,
      top: relativeTop,
      visible: true,
    });
  }, [currentTime, showLotusMarker, viewportRef]);

  return (
    <main
      ref={viewportRef}
      id="presentation-viewport"
      className="relative w-full max-w-6xl min-h-[540px] sm:min-h-0 sm:aspect-[16/9] bg-[#1a140e] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-amber-800/40 select-none flex flex-col justify-between"
    >
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="/images/jigong-bg.jpg"
          alt="濟公活佛修行法語"
          className="w-full h-full object-cover object-left sm:object-center"
        />
        {/* Soft Warm Dawn Atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#f8f1e7]/70 to-[#f8f1e7]/85" />
      </div>

      {/* Floating Bouncing Golden Lotus Marker */}
      <div
        id="ktv-lotus-marker"
        className="bounce-lotus pointer-events-none absolute z-40"
        style={{
          left: `${lotusPos.left}px`,
          top: `${lotusPos.top}px`,
          opacity: lotusPos.visible ? 1 : 0,
        }}
      >
        <div className="relative flex items-center justify-center">
          <svg className="w-5 h-5 text-amber-600 drop-shadow-[0_0_8px_#f59e0b]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C12 2 7 8 7 13C7 17.5 12 22 12 22C12 22 17 17.5 17 13C17 8 12 2 12 2Z" opacity="0.95" />
          </svg>
          <div className="absolute -inset-1 rounded-full bg-amber-400/50 blur-xs animate-ping pointer-events-none"></div>
        </div>
      </div>

      {/* Presentation Central Content Box */}
      <div className="relative z-20 w-full h-full flex flex-col justify-center pl-[28%] sm:pl-[34%] md:pl-[36%] pr-3 sm:pr-8 py-3 sm:py-5">
        
        {/* English Verses (EB Garamond / Classic Book Serif) */}
        <div
          id="english-lyrics-box"
          className="space-y-1 sm:space-y-1.5 font-en-classic text-[14px] sm:text-[18px] md:text-[22px] lg:text-[24px] leading-snug tracking-wide"
        >
          {presentation.englishLines.map((line, lineIdx) => {
            const isRowActive = currentTime >= line.start && currentTime <= line.end;

            return (
              <div
                key={line.id || lineIdx}
                className={`lyrics-row ${isRowActive ? 'active-row' : ''}`}
              >
                {line.words.map((word, wordIdx) => {
                  const isWordActive = currentTime >= word.start && currentTime <= word.end;
                  const isPast = currentTime > word.end;

                  return (
                    <span
                      key={word.id || wordIdx}
                      ref={(el) => {
                        if (isWordActive) {
                          activeWordRef.current = el;
                        }
                      }}
                      className={`ktv-word ${
                        isWordActive
                          ? 'active-word'
                          : isPast
                          ? 'past-word'
                          : ''
                      }`}
                    >
                      {word.text}
                    </span>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Golden Lotus Center Ornament (Exact Replica from Reference Art) */}
        <div className="my-1.5 sm:my-3.5 flex items-center justify-center gap-3 w-full max-w-xl">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-amber-600/70 to-amber-500"></div>
          <div className="text-amber-600 flex items-center px-1">
            <svg
              className="w-6 h-6 sm:w-9 sm:h-9 text-amber-600 drop-shadow-[0_0_8px_#f59e0b]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                d="M12 3C12 3 8 8 8 13C8 17 12 21 12 21C12 21 16 17 16 13C16 8 12 3 12 3Z"
                fill="rgba(245, 158, 11, 0.35)"
              />
              <path d="M12 21C7 21 3 17 3 13C3 9 7 7 7 7C7 7 6 12 12 16" />
              <path d="M12 21C17 21 21 17 21 13C21 9 17 7 17 7C17 7 18 12 12 16" />
            </svg>
          </div>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-amber-600/70 to-amber-500"></div>
        </div>

        {/* Traditional Chinese Calligraphy Verses (LXGW WenKai TC / 標楷體) */}
        <div
          id="chinese-lyrics-box"
          className="space-y-1 font-cn-kaiti text-[14px] sm:text-[18px] md:text-[22px] lg:text-[25px] leading-snug tracking-wider"
        >
          {presentation.chineseVerses.map((verse, idx) => {
            const isCnActive = currentTime >= verse.start && currentTime <= verse.end;

            return (
              <div
                key={verse.id || idx}
                className={`chinese-row ${isCnActive ? 'active-cn' : ''}`}
              >
                {verse.text}
              </div>
            );
          })}
        </div>

      </div>
    </main>
  );
};
