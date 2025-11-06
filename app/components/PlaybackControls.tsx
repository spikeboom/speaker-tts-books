interface PlaybackControlsProps {
  isPlaying: boolean;
  isPaused: boolean;
  onPlay: () => void;
  onPause: () => void;
}

export function PlaybackControls({
  isPlaying,
  isPaused,
  onPlay,
  onPause,
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
    </div>
  );
}
