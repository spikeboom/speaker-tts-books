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
}: VoiceSettingsProps) {
  const isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);

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
      <div className="h-8 md:h-4"></div>
    </div>
  );
}
