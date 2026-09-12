'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PresentationData, SpeakerSettings, BackgroundStyle } from '../lib/types';
import { DEFAULT_PRESENTATION, DEFAULT_SPEAKER_SETTINGS, AVAILABLE_VOICES, PRESET_AUDIO_TRACKS } from '../lib/defaultLyrics';
import { HeaderNav } from '../components/HeaderNav';
import { KtvPresentation } from '../components/KtvPresentation';
import { ControllerBar } from '../components/ControllerBar';
import { SpeakerSettingsModal } from '../components/SpeakerSettingsModal';
import { ScriptEditorModal } from '../components/ScriptEditorModal';
import { playTibetanSingingBowl } from '../lib/audioSynthesizer';
import { generateGeminiSpeech } from '../lib/geminiTts';
import { Bell } from 'lucide-react';

export default function Home() {
  const [presentation, setPresentation] = useState<PresentationData>(DEFAULT_PRESENTATION);
  const [speakerSettings, setSpeakerSettings] = useState<SpeakerSettings>(DEFAULT_SPEAKER_SETTINGS);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(DEFAULT_PRESENTATION.totalDuration);
  const [playbackRate, setPlaybackRate] = useState(1.0);

  const [showLotusMarker, setShowLotusMarker] = useState(true);
  const [enableDaoChime, setEnableDaoChime] = useState(true);
  const [customAudioLoaded, setCustomAudioLoaded] = useState(true);
  const [selectedAudioTrack, setSelectedAudioTrack] = useState('original-1');

  const [isSpeakerModalOpen, setIsSpeakerModalOpen] = useState(false);
  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [isGeneratingTts, setIsGeneratingTts] = useState(false);
  const [statusText, setStatusText] = useState('已載入濟公活佛修行法語 (20260912-2.m4a)。點擊播放即可沉浸朗讀。');
  const [toast, setToast] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);
  const lastDaoWordRef = useRef<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 3200);
  }, []);

  // Load initial preset audio on mount
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = '/audio/20260912-2.m4a';
      audioRef.current.onloadedmetadata = () => {
        if (audioRef.current?.duration && !isNaN(audioRef.current.duration)) {
          setDuration(audioRef.current.duration);
        }
      };
    }
  }, []);

  // Load saved API key and settings from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('GEMINI_API_KEY');
      if (savedKey) {
        setSpeakerSettings((prev) => ({ ...prev, customApiKey: savedKey }));
      }
    }
  }, []);

  // Init AudioContext on user gesture
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioContextRef.current = new AudioCtx();
      }
    }
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, []);

  // Dao chime trigger check
  useEffect(() => {
    let activeDaoId: string | null = null;

    for (const line of presentation.englishLines) {
      if (currentTime >= line.start && currentTime <= line.end) {
        for (const word of line.words) {
          if (currentTime >= word.start && currentTime <= word.end) {
            if (word.isDao || word.text.toLowerCase().includes('dao')) {
              activeDaoId = word.id;
            }
            break;
          }
        }
      }
    }

    if (activeDaoId && activeDaoId !== lastDaoWordRef.current) {
      if (enableDaoChime) {
        playTibetanSingingBowl(audioContextRef.current);
      }
    }
    lastDaoWordRef.current = activeDaoId;
  }, [currentTime, presentation, enableDaoChime]);

  // Fallback Web Speech Synthesis
  const playWebSpeech = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      return;
    }

    window.speechSynthesis.cancel();
    const fullText = presentation.englishLines
      .map((l) => l.words.map((w) => w.text).join(' '))
      .join(' ');

    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.lang = 'en-US';

    const voice = AVAILABLE_VOICES.find((v) => v.id === speakerSettings.voiceId);
    if (voice?.gender === 'male') {
      utterance.pitch = 0.82;
      utterance.rate = 0.9 * playbackRate;
    } else {
      utterance.pitch = 1.08;
      utterance.rate = 0.92 * playbackRate;
    }

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const matched = voices.find((v) => v.lang.startsWith('en'));
      if (matched) utterance.voice = matched;
    }

    window.speechSynthesis.speak(utterance);
  }, [presentation, speakerSettings, playbackRate]);

  // Animation Loop for smooth playback timing
  const startAnimation = useCallback(() => {
    lastTickRef.current = performance.now();

    const loop = (now: number) => {
      if (!isPlaying) return;

      if (customAudioLoaded && audioRef.current && !audioRef.current.paused) {
        const audioCur = audioRef.current.currentTime;
        setCurrentTime(audioCur);
        const maxD = audioRef.current.duration || duration;
        if (audioCur >= maxD) {
          pauseAudio();
          setCurrentTime(0);
          showToast('法語朗讀圓滿完畢');
          return;
        }
      } else {
        const dt = (now - lastTickRef.current) / 1000;
        setCurrentTime((prev) => {
          const next = prev + dt * playbackRate;
          if (next >= duration) {
            pauseAudio();
            showToast('法語朗讀圓滿完畢');
            return 0;
          }
          return next;
        });
      }

      lastTickRef.current = now;
      animFrameRef.current = requestAnimationFrame(loop);
    };

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(loop);
  }, [isPlaying, customAudioLoaded, duration, playbackRate, showToast]);

  useEffect(() => {
    if (isPlaying) {
      startAnimation();
    } else {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, startAnimation]);

  const playAudio = useCallback(() => {
    initAudioContext();
    setIsPlaying(true);

    if (customAudioLoaded && audioRef.current && audioRef.current.src) {
      audioRef.current.currentTime = currentTime;
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.play().catch((e) => console.warn('Audio play failed:', e));
    } else {
      playWebSpeech();
    }
  }, [initAudioContext, customAudioLoaded, currentTime, playbackRate, playWebSpeech]);

  const pauseAudio = useCallback(() => {
    setIsPlaying(false);
    if (customAudioLoaded && audioRef.current) {
      audioRef.current.pause();
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
  }, [customAudioLoaded]);

  const handlePlayToggle = useCallback(() => {
    if (isPlaying) {
      pauseAudio();
    } else {
      if (currentTime >= duration) {
        setCurrentTime(0);
      }
      playAudio();
    }
  }, [isPlaying, currentTime, duration, playAudio, pauseAudio]);

  const handleReset = useCallback(() => {
    pauseAudio();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setCurrentTime(0);
    if (audioRef.current) audioRef.current.currentTime = 0;
    showToast('已重置至起始段落');
  }, [pauseAudio, showToast]);

  const handleSeek = useCallback(
    (targetTime: number) => {
      setCurrentTime(targetTime);
      if (customAudioLoaded && audioRef.current) {
        audioRef.current.currentTime = targetTime;
      } else if (isPlaying) {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          playWebSpeech();
        }
      }
    },
    [customAudioLoaded, isPlaying, playWebSpeech]
  );

  const handleSpeedChange = useCallback(
    (newSpeed: number) => {
      setPlaybackRate(newSpeed);
      if (audioRef.current) audioRef.current.playbackRate = newSpeed;
      showToast(`播放速度: ${newSpeed}x`);
    },
    [showToast]
  );

  // Switch Audio Source from dropdown
  const handleAudioTrackSelect = useCallback(
    (trackId: string) => {
      setSelectedAudioTrack(trackId);
      const track = PRESET_AUDIO_TRACKS.find((t) => t.id === trackId);
      if (track && track.url) {
        if (audioRef.current) {
          audioRef.current.src = track.url;
          audioRef.current.playbackRate = playbackRate;
          audioRef.current.onloadedmetadata = () => {
            if (audioRef.current?.duration && !isNaN(audioRef.current.duration)) {
              setDuration(audioRef.current.duration);
            }
          };
        }
        setCustomAudioLoaded(true);
        setCurrentTime(0);
        pauseAudio();
        setStatusText(`已切換至音檔: ${track.name}`);
        showToast(`已載入: ${track.name}`);
      }
    },
    [playbackRate, pauseAudio, showToast]
  );

  // Handle Custom Audio File Upload
  const handleAudioFileUpload = useCallback(
    (file: File) => {
      const url = URL.createObjectURL(file);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.playbackRate = playbackRate;
        audioRef.current.onloadedmetadata = () => {
          if (audioRef.current?.duration && !isNaN(audioRef.current.duration)) {
            setDuration(audioRef.current.duration);
          }
        };
      }
      setCustomAudioLoaded(true);
      setCurrentTime(0);
      pauseAudio();
      const shortName = file.name.length > 20 ? file.name.substring(0, 18) + '...' : file.name;
      setStatusText(`已載入自訂音檔: ${shortName}`);
      showToast(`已載入音檔: ${file.name}`);
    },
    [playbackRate, pauseAudio, showToast]
  );

  // Switch Background Style
  const handleBackgroundStyleChange = (style: BackgroundStyle) => {
    setPresentation((prev) => ({
      ...prev,
      backgroundStyle: style,
      customBackgroundUrl: style === 'realistic-photo' ? '/images/jigong-bg.jpg' : prev.customBackgroundUrl,
    }));
    showToast(`背景風格切換為: ${style === 'realistic-photo' ? '典雅名畫背景' : '暗黑禪意向量風'}`);
  };

  // Upload Custom Background Image
  const handleCustomImageUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    setPresentation((prev) => ({
      ...prev,
      backgroundStyle: 'custom-image',
      customBackgroundUrl: url,
    }));
    showToast(`已更新自訂背景圖片: ${file.name}`);
  };

  // Trigger Gemini TTS generation
  const handleGenerateTts = useCallback(
    async (textOverride?: string) => {
      const englishText =
        textOverride ||
        presentation.englishLines
          .map((l) => l.words.map((w) => w.text).join(' '))
          .join(' ');

      if (!englishText.trim()) {
        showToast('請先輸入要朗讀的英文法語');
        return;
      }

      setIsGeneratingTts(true);
      setStatusText(`正在呼叫 Gemini (${speakerSettings.model}) 生成英文語音...`);
      showToast('正在透過 Gemini 3.1 Flash TTS 生成語音...');

      try {
        const result = await generateGeminiSpeech(englishText, speakerSettings);

        if (audioRef.current) {
          audioRef.current.src = result.audioUrl;
          audioRef.current.playbackRate = playbackRate;
          audioRef.current.onloadedmetadata = () => {
            if (audioRef.current?.duration && !isNaN(audioRef.current.duration)) {
              setDuration(audioRef.current.duration);
            }
          };
        }

        setCustomAudioLoaded(true);
        setSelectedAudioTrack('custom');
        setCurrentTime(0);
        setStatusText(`Gemini TTS 生成完畢 (${speakerSettings.voiceId})，點擊播放沉浸朗讀。`);
        showToast(`Gemini TTS 生成成功 (${speakerSettings.voiceId})！`);
      } catch (err: any) {
        console.error('Gemini TTS error:', err);
        setStatusText(`TTS 生成提示: ${err.message}`);
        showToast(`生成失敗: ${err.message}`);
      } finally {
        setIsGeneratingTts(false);
      }
    },
    [presentation, speakerSettings, playbackRate, showToast]
  );

  // Quick Voice Change from Navbar
  const handleVoiceChange = (newVoiceId: string) => {
    setSpeakerSettings((prev) => ({ ...prev, voiceId: newVoiceId }));
    const voiceObj = AVAILABLE_VOICES.find((v) => v.id === newVoiceId);
    showToast(`已切換音色: ${voiceObj?.name || newVoiceId}`);
  };

  // Preview Voice handler
  const handlePreviewVoice = (voiceId: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const sampleText = 'Self-cultivation is for self, it does not matter in society or alone.';
      const utt = new SpeechSynthesisUtterance(sampleText);
      utt.lang = 'en-US';
      const voice = AVAILABLE_VOICES.find((v) => v.id === voiceId);
      if (voice?.gender === 'male') {
        utt.pitch = 0.8;
      } else {
        utt.pitch = 1.1;
      }
      window.speechSynthesis.speak(utt);
    }
  };

  // Toggle Fullscreen
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      viewportRef.current?.requestFullscreen().catch(() => showToast('無法開啟全螢幕'));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {/* Hidden Audio Element */}
      <audio ref={audioRef} preload="auto" className="hidden" />

      {/* Top Navigation & Controls */}
      <HeaderNav
        settings={speakerSettings}
        backgroundStyle={presentation.backgroundStyle}
        onBackgroundStyleChange={handleBackgroundStyleChange}
        onCustomImageUpload={handleCustomImageUpload}
        selectedAudioTrack={selectedAudioTrack}
        onAudioTrackSelect={handleAudioTrackSelect}
        onVoiceChange={handleVoiceChange}
        onOpenSpeakerSettings={() => setIsSpeakerModalOpen(true)}
        onOpenScriptEditor={() => setIsScriptModalOpen(true)}
        onAudioFileUpload={handleAudioFileUpload}
        onToggleFullscreen={handleToggleFullscreen}
        isFullscreen={isFullscreen}
        isGeneratingTts={isGeneratingTts}
        onGenerateTts={() => handleGenerateTts()}
      />

      {/* Main KTV Presentation Viewport */}
      <KtvPresentation
        presentation={presentation}
        currentTime={currentTime}
        showLotusMarker={showLotusMarker}
        viewportRef={viewportRef}
      />

      {/* Controller Action Bar */}
      <ControllerBar
        presentation={presentation}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        playbackRate={playbackRate}
        showLotusMarker={showLotusMarker}
        enableDaoChime={enableDaoChime}
        onPlayToggle={handlePlayToggle}
        onReset={handleReset}
        onSeek={handleSeek}
        onSpeedChange={handleSpeedChange}
        onToggleLotus={() => setShowLotusMarker(!showLotusMarker)}
        onToggleDaoChime={() => setEnableDaoChime(!enableDaoChime)}
        statusText={statusText}
      />

      {/* Google AI Studio Style Speaker Settings Modal */}
      <SpeakerSettingsModal
        isOpen={isSpeakerModalOpen}
        onClose={() => setIsSpeakerModalOpen(false)}
        settings={speakerSettings}
        onSave={(newSettings) => {
          setSpeakerSettings(newSettings);
          showToast('已儲存 Speaker 設定');
        }}
        onPreviewVoice={handlePreviewVoice}
      />

      {/* Custom English Verse & Chinese Translation Script Modal */}
      <ScriptEditorModal
        isOpen={isScriptModalOpen}
        onClose={() => setIsScriptModalOpen(false)}
        currentPresentation={presentation}
        onApply={(newPres) => {
          setPresentation(newPres);
          setDuration(newPres.totalDuration);
          setCurrentTime(0);
          showToast('已更新法語與翻譯內容');
        }}
        onTriggerTtsGeneration={(text) => handleGenerateTts(text)}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-stone-900/95 border border-amber-500/50 text-amber-200 text-xs shadow-2xl backdrop-blur transition-all duration-300 z-50 flex items-center gap-2 animate-fadeIn">
          <Bell className="w-3.5 h-3.5 text-amber-400" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
