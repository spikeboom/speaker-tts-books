'use client';

import { useEpubReader } from '../hooks/useEpubReader';
import { useSentenceReader } from '../hooks/useSentenceReader';
import { PlaybackControls } from './PlaybackControls';
import { VoiceSettings } from './VoiceSettings';
import { SentenceHighlight } from './SentenceHighlight';
import ThemeToggle from './ThemeToggle';
import { useEffect } from 'react';

interface EpubReaderProps {
  epubId: string;
  filePath: string;
  title: string;
  onClose: () => void;
}

export function EpubReader({ epubId, filePath, title, onClose }: EpubReaderProps) {
  const {
    loading,
    error,
    currentPage,
    totalPages,
    bookTitle,
    progressPercentage,
    currentPageContent,
    savedProgress,
    loadEpub,
    nextPage,
    previousPage,
    goToPage,
    reset,
    saveProgress,
    hasNextPage,
    hasPreviousPage,
  } = useEpubReader();

  const {
    text,
    setText,
    sentences,
    currentSentenceIndex,
    isPlaying,
    isPaused,
    voices,
    selectedVoice,
    setSelectedVoice,
    rate,
    setRate,
    pitch,
    setPitch,
    volume,
    setVolume,
    handlePlay,
    handlePause,
    handleStop,
    handleReset,
    setCurrentSentence,
    previousSentence,
    nextSentence,
  } = useSentenceReader();


  // Load EPUB on mount
  useEffect(() => {
    loadEpub(filePath, title, epubId);
  }, [filePath, title, epubId, loadEpub]);

  // Update text when page changes or when content is loaded
  useEffect(() => {
    if (currentPageContent) {
      setText(currentPageContent);
      if (currentPage > 0) {
        handleStop(); // Stop playback when changing pages (but not on initial load)
      }
    }
  }, [currentPageContent, currentPage, totalPages, setText, handleStop]);

  // Load saved sentence position when progress is loaded
  useEffect(() => {
    if (savedProgress && savedProgress.current_page === currentPage && sentences.length > 0) {
      // Set the current sentence to the saved position
      const sentenceIndex = Math.min(savedProgress.current_sentence, sentences.length - 1);
      if (sentenceIndex >= 0) {
        setCurrentSentence(sentenceIndex);
      }
    }
  }, [savedProgress, currentPage, sentences.length, setCurrentSentence]);

  // Handle page navigation
  const handleNextPage = () => {
    if (hasNextPage) {
      handleStop();
      nextPage();
    }
  };

  const handlePreviousPage = () => {
    if (hasPreviousPage) {
      handleStop();
      previousPage();
    }
  };

  const handleSaveProgress = async () => {
    const success = await saveProgress(currentPage, currentSentenceIndex);
    if (success) {
      alert('✅ Progresso salvo com sucesso! Página ' + (currentPage + 1) + ', frase ' + (currentSentenceIndex + 1));
    } else {
      alert('❌ Erro ao salvar progresso.');
    }
  };

  const handleClose = () => {
    handleStop();
    reset();
    onClose();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 transition-colors" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <div className="rounded-lg p-8 max-w-md w-full mx-4 transition-colors" style={{ backgroundColor: 'var(--card-bg)' }}>
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 mb-4" style={{ borderColor: 'var(--blue-light)' }}></div>
            <p className="text-lg font-semibold transition-colors" style={{ color: 'var(--foreground)' }}>Carregando EPUB...</p>
            <p className="text-sm mt-2 transition-colors" style={{ color: 'var(--text-secondary)' }}>Processando e paginando o livro</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 transition-colors" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <div className="rounded-lg p-8 max-w-md w-full mx-4 transition-colors" style={{ backgroundColor: 'var(--card-bg)' }}>
          <div className="text-center">
            <p className="text-2xl mb-4">⚠️</p>
            <p className="text-lg font-semibold mb-2 transition-colors" style={{ color: 'var(--foreground)' }}>Erro ao carregar EPUB</p>
            <p className="text-sm mb-4" style={{ color: 'var(--red-light)' }}>{error}</p>
            <button
              onClick={handleClose}
              className="px-6 py-2 rounded-lg font-semibold transition-colors"
              style={{
                backgroundColor: 'var(--blue-light)',
                color: 'var(--button-text)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--blue-dark)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--blue-light)';
              }}
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 transition-colors" style={{ backgroundColor: 'rgba(0, 0, 0, 0.95)' }}>
      <div className="h-screen flex items-center justify-center p-2 md:p-4">
        <div className="rounded-lg shadow-2xl w-full max-w-5xl h-full flex flex-col transition-colors" style={{ backgroundColor: 'var(--card-bg)' }}>
        {/* Fixed Top Section */}
        <div className="relative z-40">
          {/* Header */}
          <div className="text-white p-3 md:p-6 rounded-t-lg transition-colors" style={{ background: 'linear-gradient(to right, var(--purple-light), var(--blue-light))' }}>
          <div className="flex items-center justify-between gap-2 mb-2 md:mb-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg md:text-2xl font-bold mb-1 md:mb-2 truncate">📖 {bookTitle}</h2>
              <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm flex-wrap">
                <span className="whitespace-nowrap">
                  P. {currentPage + 1}/{totalPages}
                </span>
                <span className="bg-white bg-opacity-20 px-2 md:px-3 py-0.5 md:py-1 rounded-full text-black text-xs">
                  {progressPercentage}%
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
              <ThemeToggle />
              <button
                onClick={handleClose}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1 md:p-2 transition-colors flex-shrink-0"
                title="Fechar"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Page Navigation */}
        <div className="bg-opacity-95 backdrop-blur-sm flex items-center justify-between gap-1.5 md:gap-2 mb-2 md:mb-3 p-2 md:p-3 rounded transition-colors" style={{ backgroundColor: 'var(--card-bg)' }}>
          <button
            onClick={handlePreviousPage}
            disabled={!hasPreviousPage || isPlaying}
            className="p-1.5 md:p-2 rounded transition-colors"
            style={{
              backgroundColor: !hasPreviousPage || isPlaying ? 'var(--gray-300)' : 'var(--gray-600)',
              color: 'var(--button-text)',
              cursor: !hasPreviousPage || isPlaying ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (hasPreviousPage && !isPlaying) {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--gray-700)';
              }
            }}
            onMouseLeave={(e) => {
              if (hasPreviousPage && !isPlaying) {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--gray-600)';
              }
            }}
            title="Página anterior"
          >
            ⏪
          </button>

          <span className="text-xs md:text-sm font-semibold transition-colors" style={{ color: 'var(--text-secondary)' }}>
            {currentPage + 1}/{totalPages}
          </span>

          <button
            onClick={handleNextPage}
            disabled={!hasNextPage || isPlaying}
            className="p-1.5 md:p-2 rounded transition-colors"
            style={{
              backgroundColor: !hasNextPage || isPlaying ? 'var(--gray-300)' : 'var(--gray-600)',
              color: 'var(--button-text)',
              cursor: !hasNextPage || isPlaying ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (hasNextPage && !isPlaying) {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--gray-700)';
              }
            }}
            onMouseLeave={(e) => {
              if (hasNextPage && !isPlaying) {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--gray-600)';
              }
            }}
            title="Próxima página"
          >
            ⏩
          </button>

          {/* TTS Controls */}
          <div className="flex items-center gap-1">
            <PlaybackControls
              isPlaying={isPlaying}
              isPaused={isPaused}
              onPlay={handlePlay}
              onPause={handlePause}
              onStop={handleStop}
              onReset={handleReset}
              showReset={true}
            />
          </div>

          <button
            onClick={handleSaveProgress}
            className="px-2 md:px-3 py-1 md:py-2 rounded text-xs md:text-sm font-semibold transition-colors whitespace-nowrap"
            style={{
              backgroundColor: 'var(--yellow-light)',
              color: 'var(--button-text)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--yellow-dark)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--yellow-light)';
            }}
            title="Salvar progresso"
          >
            🔖
          </button>
        </div>

        {/* Sentence Navigation */}
        <div className="mb-2 flex items-center justify-between flex-shrink-0 px-2 md:px-3 py-1 md:py-2">
          <div className="flex items-center gap-1 md:gap-2">
            <button
              onClick={previousSentence}
              disabled={currentSentenceIndex === 0}
              className="px-1.5 md:px-2 py-0.5 md:py-1 rounded font-semibold text-xs transition-colors"
              style={{
                backgroundColor: currentSentenceIndex === 0 ? 'var(--gray-300)' : 'var(--blue-light)',
                color: 'var(--button-text)',
                cursor: currentSentenceIndex === 0 ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => {
                if (currentSentenceIndex !== 0) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--blue-dark)';
                }
              }}
              onMouseLeave={(e) => {
                if (currentSentenceIndex !== 0) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--blue-light)';
                }
              }}
              title="Frase anterior"
            >
              ⏪
            </button>
            <span className="text-xs md:text-sm font-semibold whitespace-nowrap transition-colors" style={{ color: 'var(--text-secondary)' }}>
              {currentSentenceIndex + 1}/{sentences.length}
            </span>
            <button
              onClick={nextSentence}
              disabled={currentSentenceIndex === sentences.length - 1}
              className="px-1.5 md:px-2 py-0.5 md:py-1 rounded font-semibold text-xs transition-colors"
              style={{
                backgroundColor: currentSentenceIndex === sentences.length - 1 ? 'var(--gray-300)' : 'var(--blue-light)',
                color: 'var(--button-text)',
                cursor: currentSentenceIndex === sentences.length - 1 ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => {
                if (currentSentenceIndex !== sentences.length - 1) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--blue-dark)';
                }
              }}
              onMouseLeave={(e) => {
                if (currentSentenceIndex !== sentences.length - 1) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--blue-light)';
                }
              }}
              title="Próxima frase"
            >
              ⏩
            </button>
          </div>
          {isPaused && (
            <span className="font-semibold text-xs md:text-sm transition-colors" style={{ color: 'var(--yellow-dark)' }}>
              ⏸️ Pausado
            </span>
          )}
        </div>

        {/* Saved Progress Indicator - Compact */}
        {savedProgress && (
          <div
            className="text-xs md:text-sm px-2 md:px-3 py-1 md:py-1.5 rounded border mb-2 md:mb-3 transition-colors"
            style={{
              backgroundColor: 'var(--green-bg)',
              borderColor: 'var(--green-light)',
              color: 'var(--green-dark)',
            }}
          >
            <span className="block md:inline">
              ✅ Salvo: <span className="md:hidden">P.{savedProgress.current_page + 1} F.{savedProgress.current_sentence + 1}</span>
              <span className="hidden md:inline">Página {savedProgress.current_page + 1}, Frase {savedProgress.current_sentence + 1}</span>

              {savedProgress.current_page === currentPage && (
                <span className="ml-1 font-semibold">(agora)</span>
              )}
            </span>
          </div>
        )}
        </div>

        {/* Content */}
        <div className="p-2 md:p-4 flex-1 overflow-y-auto">
          {/* Page Content with Sentence Highlighting */}
          <div className="rounded-lg p-2 md:p-4 mb-2 md:mb-3 min-h-[250px] md:min-h-[400px] flex flex-col transition-colors" style={{ backgroundColor: 'var(--hover-bg)' }}>
            <div className="flex-1 overflow-hidden">
              <SentenceHighlight
                sentences={sentences}
                currentSentenceIndex={currentSentenceIndex}
                isPlaying={isPlaying}
                isPaused={isPaused}
                savedSentenceIndex={
                  savedProgress && savedProgress.current_page === currentPage
                    ? savedProgress.current_sentence
                    : undefined
                }
              />
            </div>
          </div>

          {/* Voice Settings */}
          <div className="rounded-lg p-2 md:p-4 flex-shrink-0 transition-colors" style={{ backgroundColor: 'var(--hover-bg)' }}>
            <VoiceSettings
              voices={voices}
              selectedVoice={selectedVoice}
              onVoiceChange={setSelectedVoice}
              rate={rate}
              onRateChange={setRate}
              pitch={pitch}
              onPitchChange={setPitch}
              volume={volume}
              onVolumeChange={setVolume}
            />
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
