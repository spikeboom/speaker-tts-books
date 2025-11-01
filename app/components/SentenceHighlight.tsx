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
    <div className="w-full min-h-[300px] p-6 border-2 border-gray-300 rounded-lg bg-white overflow-y-auto max-h-[500px]">
      <div className="text-lg leading-relaxed text-gray-800" style={{ whiteSpace: 'pre-wrap' }}>
        {sentences.map((sentence, index) => {
          const isCurrentSentence = index === currentSentenceIndex;
          const isSavedSentence = savedSentenceIndex !== undefined && index === savedSentenceIndex && !isPlaying && !isPaused && index !== currentSentenceIndex;

          return (
            <span
              key={index}
              className={`
                transition-all duration-300
                ${isCurrentSentence && isPlaying
                  ? 'bg-yellow-200 font-semibold text-gray-900 px-1 rounded'
                  : ''
                }
                ${isCurrentSentence && isPaused
                  ? 'bg-orange-200 font-semibold text-gray-900 px-1 rounded border-2 border-orange-400'
                  : ''
                }
                ${isCurrentSentence && !isPlaying && !isPaused
                  ? 'bg-blue-100 font-semibold text-gray-900 px-1 rounded border-2 border-blue-400'
                  : ''
                }
                ${isSavedSentence
                  ? 'bg-green-100 font-semibold text-gray-900 px-1 rounded border-2 border-green-400'
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
              style={{ whiteSpace: 'pre-wrap' }}
            >
              {sentence}{' '}
            </span>
          );
        })}
      </div>
    </div>
  );
}
