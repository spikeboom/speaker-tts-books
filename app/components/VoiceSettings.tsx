'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

interface VoiceSettingsProps {
  voices: SpeechSynthesisVoice[];
  selectedVoice: string;
  onVoiceChange: (voiceName: string) => void;
  rate: number;
  onRateChange: (rate: number) => void;
  pitch: number;
  onPitchChange: (pitch: number) => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
  meditationMode: boolean;
  onMeditationModeChange: (enabled: boolean) => void;
  meditationPause: number;
  onMeditationPauseChange: (pause: number) => void;
  youtubeUrl: string;
  onYoutubeUrlChange: (url: string) => void;
  currentSentence?: string;
}

function extractYoutubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function VoiceSettings({
  voices,
  selectedVoice,
  onVoiceChange,
  rate,
  onRateChange,
  pitch,
  onPitchChange,
  volume,
  onVolumeChange,
  meditationMode,
  onMeditationModeChange,
  meditationPause,
  onMeditationPauseChange,
  youtubeUrl,
  onYoutubeUrlChange,
  currentSentence,
}: VoiceSettingsProps) {
  const isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);
  const youtubeId = extractYoutubeId(youtubeUrl);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(() => {
    if (!videoContainerRef.current) return;

    if (!document.fullscreenElement) {
      videoContainerRef.current.requestFullscreen().catch(err => {
        console.error('Error entering fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="w-full">
      <h3 className="text-xs md:text-sm font-semibold mb-2 md:mb-3 transition-colors" style={{ color: 'var(--label-text)' }}>⚙️ Voz & Som</h3>

      {isAndroid && (
        <div
          className="mb-3 border rounded-lg p-3 transition-colors"
          style={{
            backgroundColor: 'var(--yellow-bg)',
            borderColor: 'var(--yellow-light)',
          }}
        >
          <p className="text-xs font-semibold mb-1 transition-colors" style={{ color: 'var(--yellow-dark)' }}>
            📱 Android - Importante:
          </p>
          <p className="text-xs transition-colors" style={{ color: 'var(--yellow-dark)' }}>
            Se a voz não mudar, desmarque <strong>"Sempre usar minhas configurações"</strong> em:<br />
            <span className="text-xs italic">Configurações → Idioma e entrada → Opções de texto para fala → Configurações do Google Text-to-speech</span>
          </p>
          <p className="text-xs mt-1 transition-colors" style={{ color: 'var(--yellow-dark)' }}>
            Abra o Console do navegador (DevTools) para ver logs de debug das vozes disponíveis.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
        <div className="col-span-1">
          <label className="block text-xs md:text-sm font-medium mb-1 transition-colors" style={{ color: 'var(--label-text)' }}>
            Voz
          </label>
          <select
            value={selectedVoice}
            onChange={(e) => onVoiceChange(e.target.value)}
            className="w-full p-1 md:p-2 text-xs md:text-sm border rounded transition-colors focus:outline-none"
            style={{
              backgroundColor: 'var(--input-bg)',
              borderColor: 'var(--input-border)',
              color: 'var(--input-text)',
            }}
          >
            {voices.map((voice) => (
              <option key={voice.name} value={voice.name}>
                {voice.name.split(' ').slice(0, 2).join(' ')} ({voice.lang.slice(0, 2).toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-1">
          <label className="block text-xs md:text-sm font-medium mb-1 transition-colors" style={{ color: 'var(--label-text)' }}>
            Vel.
          </label>
          <div className="flex items-center gap-1">
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={rate}
              onChange={(e) => onRateChange(parseFloat(e.target.value))}
              className="flex-1"
            />
            <span className="text-xs font-semibold min-w-max transition-colors" style={{ color: 'var(--text-secondary)' }}>{rate.toFixed(1)}x</span>
          </div>
        </div>

        <div className="col-span-1">
          <label className="block text-xs md:text-sm font-medium mb-1 transition-colors" style={{ color: 'var(--label-text)' }}>
            Tom
          </label>
          <div className="flex items-center gap-1">
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={pitch}
              onChange={(e) => onPitchChange(parseFloat(e.target.value))}
              className="flex-1"
            />
            <span className="text-xs font-semibold min-w-max transition-colors" style={{ color: 'var(--text-secondary)' }}>{pitch.toFixed(1)}</span>
          </div>
        </div>

        <div className="col-span-1">
          <label className="block text-xs md:text-sm font-medium mb-1 transition-colors" style={{ color: 'var(--label-text)' }}>
            Vol.
          </label>
          <div className="flex items-center gap-1">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="flex-1"
            />
            <span className="text-xs font-semibold min-w-max transition-colors" style={{ color: 'var(--text-secondary)' }}>{Math.round(volume * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Meditation Mode */}
      <div className="mt-3 pt-3 border-t transition-colors" style={{ borderColor: 'var(--input-border)' }}>
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={meditationMode}
              onChange={(e) => onMeditationModeChange(e.target.checked)}
              className="w-4 h-4 rounded cursor-pointer"
            />
            <span className="text-xs md:text-sm font-medium transition-colors" style={{ color: 'var(--label-text)' }}>
              🧘 Modo Meditação
            </span>
          </label>
          {meditationMode && (
            <div className="flex items-center gap-2 flex-1 max-w-xs">
              <span className="text-xs transition-colors whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>Pausa:</span>
              <input
                type="range"
                min="0.5"
                max="30"
                step="0.5"
                value={meditationPause}
                onChange={(e) => onMeditationPauseChange(parseFloat(e.target.value))}
                className="flex-1"
              />
              <span className="text-xs font-semibold min-w-max transition-colors" style={{ color: 'var(--text-secondary)' }}>{meditationPause.toFixed(1)}s</span>
            </div>
          )}
        </div>
        {meditationMode && (
          <p className="text-xs mt-1 transition-colors" style={{ color: 'var(--text-secondary)' }}>
            Pausa de {meditationPause.toFixed(1)} segundos entre cada frase
          </p>
        )}

        {/* YouTube URL Input */}
        {meditationMode && (
          <div className="mt-3">
            <label className="block text-xs md:text-sm font-medium mb-1 transition-colors" style={{ color: 'var(--label-text)' }}>
              🎬 Vídeo de fundo (YouTube)
            </label>
            <input
              type="text"
              value={youtubeUrl}
              onChange={(e) => onYoutubeUrlChange(e.target.value)}
              placeholder="Cole o link do YouTube aqui..."
              className="w-full p-2 text-xs md:text-sm border rounded transition-colors focus:outline-none"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--input-border)',
                color: 'var(--input-text)',
              }}
            />
            {youtubeId && (
              <div
                ref={videoContainerRef}
                className={`mt-2 relative ${isFullscreen ? 'flex items-center justify-center' : ''}`}
                style={{
                  paddingBottom: isFullscreen ? 0 : '56.25%',
                  height: isFullscreen ? '100vh' : 0,
                  backgroundColor: isFullscreen ? '#000' : 'transparent',
                }}
              >
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&loop=1&playlist=${youtubeId}`}
                  title="YouTube video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  className={`${isFullscreen ? 'w-full h-full' : 'absolute top-0 left-0 w-full h-full rounded'}`}
                  style={{ border: 'none' }}
                />
                {/* Sentence overlay - centered */}
                {currentSentence && (
                  <div
                    className="absolute inset-0 flex items-center justify-center p-4"
                    style={{ pointerEvents: 'none' }}
                  >
                    <p
                      className={`text-white font-medium text-center max-w-4xl ${isFullscreen ? 'text-2xl md:text-4xl' : 'text-sm md:text-base'}`}
                      style={{
                        textShadow: '2px 2px 8px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.8)',
                        lineHeight: 1.5,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        padding: isFullscreen ? '1.5rem 2rem' : '0.5rem 1rem',
                        borderRadius: '0.5rem',
                      }}
                    >
                      {currentSentence}
                    </p>
                  </div>
                )}
                {/* Fullscreen button */}
                <button
                  onClick={toggleFullscreen}
                  className="absolute top-2 right-2 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                  title={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
                >
                  {isFullscreen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                    </svg>
                  )}
                </button>
                {/* Exit fullscreen hint */}
                {isFullscreen && (
                  <div className="absolute top-2 left-2 text-white/50 text-xs">
                    ESC para sair
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="h-8 md:h-4"></div>
    </div>
  );
}
