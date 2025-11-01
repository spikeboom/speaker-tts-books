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
        const containerRect = container.getBoundingClientRect();
        const sentenceRect = currentSentenceElement.getBoundingClientRect();

        // Calculate the offset needed to center the sentence in the container
        const sentenceOffsetTop = currentSentenceElement.offsetTop;
        const containerHeight = container.clientHeight;
        const sentenceHeight = sentenceRect.height;

        // Center the sentence
        const scrollPosition = sentenceOffsetTop - (containerHeight / 2) + (sentenceHeight / 2);

        container.scrollTo({
          top: scrollPosition,
          behavior: 'smooth',
        });
      }
    }
  }, [currentSentenceIndex]);

  if (sentences.length === 0) {
    return (
      <div className="w-full min-h-[300px] p-6 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center">
        <p className="text-center">
          Digite ou cole um texto acima para começar a leitura
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full min-h-[300px] p-6 border-2 border-gray-300 rounded-lg bg-white overflow-y-auto max-h-[500px]"
    >
      <div className="text-lg leading-relaxed text-gray-800" style={{ whiteSpace: 'pre-wrap' }}>
        {sentences.map((sentence, index) => {
          const isCurrentSentence = index === currentSentenceIndex;
          const isSavedSentence = savedSentenceIndex !== undefined && index === savedSentenceIndex && !isPlaying && !isPaused && index !== currentSentenceIndex;

          return (
            <span
              key={index}
              ref={(el) => {
                sentenceRefs.current[index] = el;
              }}
              className={`
                transition-all duration-300
                ${isCurrentSentence && isPlaying
                  ? 'bg-yellow-200 font-semibold text-gray-900 rounded'
                  : ''
                }
                ${isCurrentSentence && isPaused
                  ? 'bg-orange-200 font-semibold text-gray-900 rounded'
                  : ''
                }
                ${isCurrentSentence && !isPlaying && !isPaused
                  ? 'bg-blue-100 font-semibold text-gray-900 rounded'
                  : ''
                }
                ${isSavedSentence
                  ? 'bg-green-100 font-semibold text-gray-900 rounded'
                  : ''
                }
                ${!isCurrentSentence && !isSavedSentence
                  ? 'text-gray-700'
                  : ''
                }
                ${index < currentSentenceIndex && (isPlaying || isPaused)
                  ? 'text-gray-400'
                  : ''
                }
              `}
              style={{
                whiteSpace: 'pre-wrap',
                ...(isCurrentSentence && isPaused ? {
                  boxShadow: '0 0 0 2px #fb923c'
                } : {}),
                ...(isCurrentSentence && !isPlaying && !isPaused ? {
                  boxShadow: '0 0 0 2px #60a5fa'
                } : {}),
                ...(isSavedSentence ? {
                  boxShadow: '0 0 0 2px #4ade80'
                } : {})
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
