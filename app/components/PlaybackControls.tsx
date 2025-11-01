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
        className="px-2.5 py-1 rounded text-xs font-semibold transition-colors"
        style={{
          backgroundColor: isPlaying && !isPaused ? 'var(--gray-300)' : 'var(--green-light)',
          color: 'var(--button-text)',
          cursor: isPlaying && !isPaused ? 'not-allowed' : 'pointer',
        }}
        onMouseEnter={(e) => {
          if (!(isPlaying && !isPaused)) {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--green-dark)';
          }
        }}
        onMouseLeave={(e) => {
          if (!(isPlaying && !isPaused)) {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--green-light)';
          }
        }}
        title={isPaused ? 'Continuar leitura' : 'Iniciar leitura'}
      >
        {isPaused ? '▶️' : '▶️'}
      </button>

      <button
        onClick={onPause}
        disabled={!isPlaying || isPaused}
        className="px-2.5 py-1 rounded text-xs font-semibold transition-colors"
        style={{
          backgroundColor: !isPlaying || isPaused ? 'var(--gray-300)' : 'var(--yellow-light)',
          color: 'var(--button-text)',
          cursor: !isPlaying || isPaused ? 'not-allowed' : 'pointer',
        }}
        onMouseEnter={(e) => {
          if (isPlaying && !isPaused) {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--yellow-dark)';
          }
        }}
        onMouseLeave={(e) => {
          if (isPlaying && !isPaused) {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--yellow-light)';
          }
        }}
        title="Pausar leitura"
      >
        ⏸️
      </button>

      <button
        onClick={onStop}
        disabled={!isPlaying && !isPaused}
        className="px-2.5 py-1 rounded text-xs font-semibold transition-colors"
        style={{
          backgroundColor: !isPlaying && !isPaused ? 'var(--gray-300)' : 'var(--red-light)',
          color: 'var(--button-text)',
          cursor: !isPlaying && !isPaused ? 'not-allowed' : 'pointer',
        }}
        onMouseEnter={(e) => {
          if (isPlaying || isPaused) {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--red-dark)';
          }
        }}
        onMouseLeave={(e) => {
          if (isPlaying || isPaused) {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--red-light)';
          }
        }}
        title="Parar leitura"
      >
        ⏹️
      </button>

      {showReset && onReset && (
        <button
          onClick={onReset}
          className="px-2.5 py-1 rounded text-xs font-semibold transition-colors"
          style={{
            backgroundColor: 'var(--purple-light)',
            color: 'var(--button-text)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--purple-dark)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--purple-light)';
          }}
          title="Reiniciar do começo"
        >
          🔄
        </button>
      )}
    </div>
  );
}
