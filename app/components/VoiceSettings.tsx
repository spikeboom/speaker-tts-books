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
  return (
    <div className="w-full">
      <h3 className="text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3">⚙️ Voz & Som</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        <div className="col-span-2 md:col-span-1">
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
            Voz
          </label>
          <select
            value={selectedVoice}
            onChange={(e) => onVoiceChange(e.target.value)}
            className="w-full p-1 md:p-2 text-xs md:text-sm border border-gray-300 rounded focus:border-blue-500 focus:outline-none text-gray-700"
          >
            {voices.map((voice) => (
              <option key={voice.name} value={voice.name}>
                {voice.name.split(' ').slice(0, 2).join(' ')} ({voice.lang.slice(0, 2).toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-1">
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
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
            <span className="text-xs text-gray-600 font-semibold min-w-max">{rate.toFixed(1)}x</span>
          </div>
        </div>

        <div className="col-span-1">
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
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
            <span className="text-xs text-gray-600 font-semibold min-w-max">{pitch.toFixed(1)}</span>
          </div>
        </div>

        <div className="col-span-1">
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
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
            <span className="text-xs text-gray-600 font-semibold min-w-max">{Math.round(volume * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
