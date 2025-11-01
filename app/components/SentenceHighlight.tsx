import { useEffect, useRef } from 'react';

interface SentenceHighlightProps {
  sentences: string[];
  currentSentenceIndex: number;
  isPlaying: boolean;
  isPaused: boolean;
  savedSentenceIndex?: number;
}

export function SentenceHighlight({
  sentences,
  currentSentenceIndex,
  isPlaying,
  isPaused,
  savedSentenceIndex,
}: SentenceHighlightProps) {
  const sentenceRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to center current sentence within text container only
  useEffect(() => {
    if (currentSentenceIndex >= 0 && currentSentenceIndex < sentenceRefs.current.length) {
      const currentSentenceElement = sentenceRefs.current[currentSentenceIndex];
      const container = containerRef.current;

      if (currentSentenceElement && container) {
        // Get positions relative to container
        const sentenceOffsetTop = currentSentenceElement.offsetTop;
        const containerHeight = container.clientHeight;
        const sentenceHeight = currentSentenceElement.clientHeight;

        // Position the sentence in the lower third of the container for better mobile readability
        // This keeps more text visible below the active sentence
        const scrollPosition = sentenceOffsetTop - (containerHeight * 0.75) + (sentenceHeight / 2);

        container.scrollTo({
          top: scrollPosition,
          behavior: 'smooth',
        });
      }
    }
  }, [currentSentenceIndex, isPlaying]);

  if (sentences.length === 0) {
    return (
      <div
        className="w-full min-h-[300px] p-6 border-2 rounded-lg flex items-center justify-center transition-colors"
        style={{
          borderColor: 'var(--border-color)',
          backgroundColor: 'var(--gray-100)',
          color: 'var(--text-muted)',
        }}
      >
        <p className="text-center">
          Digite ou cole um texto acima para começar a leitura
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full min-h-[300px] p-6 border-2 rounded-lg overflow-y-auto max-h-[500px] transition-colors"
      style={{
        borderColor: 'var(--border-color)',
        backgroundColor: 'var(--card-bg)',
      }}
    >
      <div className="text-lg leading-relaxed" style={{ whiteSpace: 'pre-wrap', color: 'var(--input-text)' }}>
        {sentences.map((sentence, index) => {
          const isCurrentSentence = index === currentSentenceIndex;
          const isSavedSentence = savedSentenceIndex !== undefined && index === savedSentenceIndex && !isPlaying && !isPaused && index !== currentSentenceIndex;

          let bgColor = 'transparent';
          let textColor = isCurrentSentence || isSavedSentence ? 'var(--foreground)' : 'var(--input-text)';
          let shadowColor = '';

          if (isCurrentSentence && isPlaying) {
            bgColor = 'var(--highlight-yellow)';
            textColor = 'var(--foreground)';
            shadowColor = 'var(--yellow-light)';
          } else if (isCurrentSentence && isPaused) {
            bgColor = 'var(--highlight-orange)';
            textColor = 'var(--foreground)';
            shadowColor = 'var(--highlight-orange)';
          } else if (isCurrentSentence && !isPlaying && !isPaused) {
            bgColor = 'var(--blue-bg)';
            textColor = 'var(--foreground)';
            shadowColor = 'var(--blue-light)';
          } else if (isSavedSentence) {
            bgColor = 'var(--green-bg)';
            textColor = 'var(--foreground)';
            shadowColor = 'var(--green-light)';
          } else if (index < currentSentenceIndex && (isPlaying || isPaused)) {
            textColor = 'var(--text-muted)';
          }

          return (
            <span
              key={index}
              ref={(el) => {
                sentenceRefs.current[index] = el;
              }}
              className="transition-all duration-300 rounded"
              style={{
                whiteSpace: 'pre-wrap',
                backgroundColor: bgColor,
                color: textColor,
                fontWeight: isCurrentSentence || isSavedSentence ? 'bold' : 'normal',
                boxShadow: shadowColor ? `0 0 0 2px ${shadowColor}` : 'none',
              }}
            >
              {sentence}{' '}
            </span>
          );
        })}
      </div>
    </div>
  );
}
