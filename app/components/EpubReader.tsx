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
      <div className="min-h-screen flex items-center justify-center p-4 py-8">
        <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">📖 {bookTitle}</h2>
              <div className="flex items-center gap-4 text-sm">
                <span>
                  Página {currentPage + 1} de {totalPages}
                </span>
                <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-black">
                  {progressPercentage}% concluído
                </span>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
              title="Fechar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="p-6">
          {/* Page Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handlePreviousPage}
              disabled={!hasPreviousPage || isPlaying}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold transition-colors"
            >
              ← Página Anterior
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
                className="w-20 px-3 py-2 text-center border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
              <p className="text-xs text-gray-600 mt-1">Ir para página</p>
            </div>

            <button
              onClick={handleNextPage}
              disabled={!hasNextPage || isPlaying}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold transition-colors"
            >
              Próxima Página →
            </button>
          </div>

          {/* TTS Controls and Save Progress */}
          <div className="mb-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
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
                className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-semibold shadow-md transition-colors flex items-center gap-2 whitespace-nowrap"
                title="Salvar onde você parou"
              >
                🔖 Salvar Progresso
              </button>
            </div>

            {/* Saved Progress Indicator */}
            {savedProgress && (
              <div className="mt-3 p-3 bg-green-50 border-2 border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>✅ Última leitura salva:</strong> Página {savedProgress.current_page + 1}, Frase {savedProgress.current_sentence + 1}
                  {savedProgress.current_page === currentPage && (
                    <span className="ml-2 text-green-600 font-semibold">(Esta página)</span>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Page Content with Sentence Highlighting */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6 min-h-[400px]">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={previousSentence}
                  disabled={currentSentenceIndex === 0}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold text-sm transition-colors"
                  title="Frase anterior"
                >
                  ⏪ Anterior
                </button>
                <span className="text-sm text-gray-600 font-semibold">
                  Frase {currentSentenceIndex + 1} de {sentences.length}
                </span>
                <button
                  onClick={nextSentence}
                  disabled={currentSentenceIndex === sentences.length - 1}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold text-sm transition-colors"
                  title="Próxima frase"
                >
                  Próxima ⏩
                </button>
              </div>
              {isPaused && (
                <span className="text-yellow-600 font-semibold text-sm">
                  ⏸️ Pausado - ao retomar, continuará da frase atual
                </span>
              )}
            </div>

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

          {/* Voice Settings */}
          <div className="bg-gray-50 rounded-lg p-6">
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

          {/* Instructions */}
          <div className="mt-6 bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">
              💡 Dicas de uso
            </h3>
            <ul className="text-xs text-gray-700 space-y-1 list-disc list-inside">
              <li>Use os botões de navegação ou digite o número da página para mudar de página</li>
              <li>O TTS será pausado automaticamente ao trocar de página</li>
              <li>A barra de progresso mostra quanto você já leu do livro</li>
              <li>Você pode ajustar voz, velocidade, tom e volume nas configurações</li>
            </ul>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
