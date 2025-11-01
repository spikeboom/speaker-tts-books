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
    <div className="flex gap-1.5 items-center">
      <button
        onClick={onPlay}
        disabled={isPlaying && !isPaused}
        className="px-2.5 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold transition-colors"
        title={isPaused ? 'Continuar leitura' : 'Iniciar leitura'}
      >
        {isPaused ? '▶️' : '▶️'}
      </button>

      <button
        onClick={onPause}
        disabled={!isPlaying || isPaused}
        className="px-2.5 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold transition-colors"
        title="Pausar leitura"
      >
        ⏸️
      </button>

      <button
        onClick={onStop}
        disabled={!isPlaying && !isPaused}
        className="px-2.5 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold transition-colors"
        title="Parar leitura"
      >
        ⏹️
      </button>

      {showReset && onReset && (
        <button
          onClick={onReset}
          className="px-2.5 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 font-semibold transition-colors"
          title="Reiniciar do começo"
        >
          🔄
        </button>
      )}
    </div>
  );
}
