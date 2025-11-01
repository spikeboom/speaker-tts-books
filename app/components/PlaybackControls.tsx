interface PlaybackControlsProps {
  isPlaying: boolean;
  isPaused: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onReset?: () => void;
  showReset?: boolean;
}

export function PlaybackControls({
  isPlaying,
  isPaused,
  onPlay,
  onPause,
  onStop,
  onReset,
  showReset = false,
}: PlaybackControlsProps) {
  return (
    <div className="flex gap-4 justify-center">
      <button
        onClick={onPlay}
        disabled={isPlaying && !isPaused}
        className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold shadow-md transition-colors"
      >
        {isPaused ? '▶️ Continuar' : '▶️ Reproduzir'}
      </button>

      <button
        onClick={onPause}
        disabled={!isPlaying || isPaused}
        className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold shadow-md transition-colors"
      >
        ⏸️ Pausar
      </button>

      <button
        onClick={onStop}
        disabled={!isPlaying && !isPaused}
        className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold shadow-md transition-colors"
      >
        ⏹️ Parar
      </button>

      {showReset && onReset && (
        <button
          onClick={onReset}
          className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-semibold shadow-md transition-colors"
        >
          🔄 Resetar
        </button>
      )}
    </div>
  );
}
