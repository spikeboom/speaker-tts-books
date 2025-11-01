'use client';

import { useEpubReader } from '../hooks/useEpubReader';
import { useSentenceReader } from '../hooks/useSentenceReader';
import { PlaybackControls } from './PlaybackControls';
import { VoiceSettings } from './VoiceSettings';
import { SentenceHighlight } from './SentenceHighlight';
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mb-4"></div>
            <p className="text-lg font-semibold text-gray-800">Carregando EPUB...</p>
            <p className="text-sm text-gray-600 mt-2">Processando e paginando o livro</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <p className="text-2xl mb-4">⚠️</p>
            <p className="text-lg font-semibold text-gray-800 mb-2">Erro ao carregar EPUB</p>
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-95 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-2 md:p-4 py-4 md:py-8">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl h-screen md:h-auto flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 md:p-6 rounded-t-lg">
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

          {/* Progress Bar */}
          <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Content */}
        <div className="p-2 md:p-4 flex-1 overflow-y-auto">
          {/* Page Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-1.5 md:gap-2 mb-2 md:mb-3">
            <button
              onClick={handlePreviousPage}
              disabled={!hasPreviousPage || isPlaying}
              className="px-2 md:px-4 py-1 md:py-2 bg-gray-500 text-white rounded text-xs md:text-sm hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold transition-colors"
              title="Página anterior"
            >
              ← Ant.
            </button>

            <div className="text-center">
              <input
                type="number"
                min="1"
                max={totalPages}
                value={currentPage + 1}
                onChange={(e) => {
                  const page = parseInt(e.target.value) - 1;
                  if (!isNaN(page)) {
                    goToPage(page);
                  }
                }}
                disabled={isPlaying}
                className="w-14 md:w-16 px-2 py-1 text-center text-xs md:text-sm border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
              />
              <p className="text-xs text-gray-600 mt-0.5">pág</p>
            </div>

            <button
              onClick={handleNextPage}
              disabled={!hasNextPage || isPlaying}
              className="px-2 md:px-4 py-1 md:py-2 bg-gray-500 text-white rounded text-xs md:text-sm hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold transition-colors"
              title="Próxima página"
            >
              Prox. →
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
              className="px-2 md:px-3 py-1 md:py-2 bg-yellow-500 text-white rounded text-xs md:text-sm hover:bg-yellow-600 font-semibold transition-colors whitespace-nowrap"
              title="Salvar progresso"
            >
              🔖
            </button>
          </div>

          {/* Saved Progress Indicator - Compact */}
          {savedProgress && (
            <div className="text-xs md:text-sm text-green-700 bg-green-50 px-2 md:px-3 py-1 md:py-1.5 rounded border border-green-200 mb-2 md:mb-3">
              <span className="block md:inline">
                ✅ Salvo: <span className="md:hidden">P.{savedProgress.current_page + 1} F.{savedProgress.current_sentence + 1}</span>
                <span className="hidden md:inline">Página {savedProgress.current_page + 1}, Frase {savedProgress.current_sentence + 1}</span>
              </span>
              {savedProgress.current_page === currentPage && (
                <span className="ml-1 font-semibold">(agora)</span>
              )}
            </div>
          )}

          {/* Page Content with Sentence Highlighting */}
          <div className="bg-gray-50 rounded-lg p-2 md:p-4 mb-2 md:mb-3 min-h-[250px] md:min-h-[400px] flex flex-col">
            <div className="mb-2 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-1 md:gap-2">
                <button
                  onClick={previousSentence}
                  disabled={currentSentenceIndex === 0}
                  className="px-1.5 md:px-2 py-0.5 md:py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold text-xs transition-colors"
                  title="Frase anterior"
                >
                  ⏪
                </button>
                <span className="text-xs md:text-sm text-gray-600 font-semibold whitespace-nowrap">
                  {currentSentenceIndex + 1}/{sentences.length}
                </span>
                <button
                  onClick={nextSentence}
                  disabled={currentSentenceIndex === sentences.length - 1}
                  className="px-1.5 md:px-2 py-0.5 md:py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold text-xs transition-colors"
                  title="Próxima frase"
                >
                  ⏩
                </button>
              </div>
              {isPaused && (
                <span className="text-yellow-600 font-semibold text-xs md:text-sm">
                  ⏸️ Pausado
                </span>
              )}
            </div>

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
          <div className="bg-gray-50 rounded-lg p-2 md:p-4 flex-shrink-0">
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
