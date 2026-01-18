"use client";

import { useEpubReader } from "../hooks/useEpubReader";
import { useSentenceReader } from "../hooks/useSentenceReader";
import { useWakeLock } from "../hooks/useWakeLock";
import { PlaybackControls } from "./PlaybackControls";
import { VoiceSettings } from "./VoiceSettings";
import { SentenceHighlight } from "./SentenceHighlight";
import ThemeToggle from "./ThemeToggle";
import { useEffect, useState, useCallback, useRef } from "react";

interface EpubReaderProps {
  epubId: string;
  filePath?: string;
  title: string;
  onClose: () => void;
  mode?: 'epub' | 'text';
  directText?: string;
}

export function EpubReader({
  epubId,
  filePath,
  title,
  onClose,
  mode = 'epub',
  directText,
}: EpubReaderProps) {
  // Keep screen on while reading
  useWakeLock();

  // Toggle between fraction and percentage for chapter progress
  const [showChapterPercentage, setShowChapterPercentage] = useState(false);

  // Interactive mode toggle (for Google Translate compatibility)
  const [isInteractive, setIsInteractive] = useState(true);

  // Auto-save state
  const [lastAutoSave, setLastAutoSave] = useState<{page: number, sentence: number} | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    loading,
    error,
    currentPage,
    totalPages,
    bookTitle,
    progressPercentage,
    currentPageContent,
    savedProgress,
    chapters,
    currentChapter,
    chapterProgress,
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
    spokenSentenceIndex,
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
    meditationMode,
    setMeditationMode,
    meditationPause,
    setMeditationPause,
    youtubeUrl,
    setYoutubeUrl,
  } = useSentenceReader();

  // Silent auto-save function
  const autoSaveProgress = useCallback(async () => {
    if (mode !== 'epub') return; // Only auto-save for EPUB mode

    // Check if progress has changed
    if (lastAutoSave?.page === currentPage && lastAutoSave?.sentence === currentSentenceIndex) {
      return; // No change, don't save again
    }

    setAutoSaveStatus('saving');
    const success = await saveProgress(currentPage, currentSentenceIndex);

    if (success) {
      setLastAutoSave({ page: currentPage, sentence: currentSentenceIndex });
      setAutoSaveStatus('saved');
    } else {
      setAutoSaveStatus('idle');
    }
  }, [mode, currentPage, currentSentenceIndex, lastAutoSave, saveProgress]);

  // Load EPUB or direct text on mount
  useEffect(() => {
    if (mode === 'epub' && filePath) {
      loadEpub(filePath, title, epubId);
    } else if (mode === 'text' && directText) {
      // For direct text mode, set the text directly
      setText(directText);
    }
  }, [mode, filePath, directText, title, epubId, loadEpub, setText]);

  // Update text when page changes or when content is loaded (EPUB mode only)
  useEffect(() => {
    if (mode === 'epub' && currentPageContent) {
      setText(currentPageContent);
      // Reset loaded sentence ref when page changes
      loadedSavedSentenceRef.current = null;
      if (currentPage > 0) {
        handleStop(); // Stop playback when changing pages (but not on initial load)
      }
    }
  }, [mode, currentPageContent, currentPage, totalPages, setText, handleStop]);

  // Track if we've already loaded the saved sentence position for this page
  const loadedSavedSentenceRef = useRef<number | null>(null);
  const setCurrentSentenceRef = useRef(setCurrentSentence);

  // Keep the ref updated
  useEffect(() => {
    setCurrentSentenceRef.current = setCurrentSentence;
  }, [setCurrentSentence]);

  // Load saved sentence position when progress is loaded (only once per page)
  useEffect(() => {
    if (
      savedProgress &&
      savedProgress.current_page === currentPage &&
      sentences.length > 0
    ) {
      // Check if we already loaded for this page
      if (loadedSavedSentenceRef.current === currentPage) {
        return; // Already loaded for this page, skip
      }

      // Set the current sentence to the saved position
      const sentenceIndex = Math.min(
        savedProgress.current_sentence,
        sentences.length - 1
      );
      if (sentenceIndex >= 0) {
        loadedSavedSentenceRef.current = currentPage;
        setCurrentSentenceRef.current(sentenceIndex, false); // Don't autoplay when loading saved position
      }
    }
  }, [savedProgress, currentPage, sentences.length]);

  // Auto-save with 10 second debounce when sentence changes
  useEffect(() => {
    if (mode !== 'epub' || !sentences.length) return;

    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set new timer for 10 seconds
    autoSaveTimerRef.current = setTimeout(() => {
      autoSaveProgress();
    }, 10000);

    // Cleanup on unmount or when dependencies change
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [mode, currentPage, currentSentenceIndex, sentences.length, autoSaveProgress]);

  // Save when page loses focus (user switches app/tab)
  useEffect(() => {
    if (mode !== 'epub') return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, save immediately
        autoSaveProgress();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [mode, autoSaveProgress]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

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
      alert(
        "✅ Progresso salvo com sucesso! Página " +
          (currentPage + 1) +
          ", frase " +
          (currentSentenceIndex + 1)
      );
    } else {
      alert("❌ Erro ao salvar progresso.");
    }
  };

  // Wrapper for handlePause to auto-save
  const handlePauseWithSave = () => {
    autoSaveProgress();
    handlePause();
  };

  // Wrapper for handleStop to auto-save
  const handleStopWithSave = () => {
    autoSaveProgress();
    handleStop();
  };

  const handleClose = () => {
    autoSaveProgress(); // Save before closing
    handleStop();
    reset();
    onClose();
  };

  if (loading) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center z-50 transition-colors"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      >
        <div
          className="rounded-lg p-8 max-w-md w-full mx-4 transition-colors"
          style={{ backgroundColor: "var(--card-bg)" }}
        >
          <div className="flex flex-col items-center">
            <div
              className="animate-spin rounded-full h-16 w-16 border-b-4 mb-4"
              style={{ borderColor: "var(--blue-light)" }}
            ></div>
            <p
              className="text-lg font-semibold transition-colors"
              style={{ color: "var(--foreground)" }}
            >
              {mode === 'epub' ? 'Carregando EPUB...' : 'Carregando texto...'}
            </p>
            <p
              className="text-sm mt-2 transition-colors"
              style={{ color: "var(--text-secondary)" }}
            >
              {mode === 'epub' ? 'Processando e paginando o livro' : 'Preparando texto para leitura'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center z-50 transition-colors"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      >
        <div
          className="rounded-lg p-8 max-w-md w-full mx-4 transition-colors"
          style={{ backgroundColor: "var(--card-bg)" }}
        >
          <div className="text-center">
            <p className="text-2xl mb-4">⚠️</p>
            <p
              className="text-lg font-semibold mb-2 transition-colors"
              style={{ color: "var(--foreground)" }}
            >
              {mode === 'epub' ? 'Erro ao carregar EPUB' : 'Erro ao carregar texto'}
            </p>
            <p className="text-sm mb-4" style={{ color: "var(--red-light)" }}>
              {error}
            </p>
            <button
              onClick={handleClose}
              className="px-6 py-2 rounded-lg font-semibold transition-colors"
              style={{
                backgroundColor: "var(--blue-light)",
                color: "var(--button-text)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor =
                  "var(--blue-dark)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor =
                  "var(--blue-light)";
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
    <div
      className="min-h-screen transition-colors"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.95)" }}
    >
      <div className="min-h-screen flex items-start justify-center p-2 md:p-4">
        <div
          className="rounded-lg shadow-2xl w-full max-w-5xl flex flex-col transition-colors"
          style={{ backgroundColor: "var(--card-bg)" }}
        >
          {/* Header */}
          <div
            className="text-white p-3 md:p-6 rounded-t-lg transition-colors flex-shrink-0 mb-2 md:mb-3"
            style={{
              background:
                "linear-gradient(to right, var(--purple-light), var(--blue-light))",
            }}
          >
            <div className="flex items-center justify-between gap-2 mb-2 md:mb-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg md:text-2xl font-bold mb-1 md:mb-2 truncate">
                  {mode === 'epub' ? '📖' : '📝'} {bookTitle}
                </h2>
                {mode === 'epub' && (
                  <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm flex-wrap">
                    <span className="whitespace-nowrap">
                      P. {currentPage + 1}/{totalPages}
                    </span>
                    <span className="bg-white bg-opacity-20 px-2 md:px-3 py-0.5 md:py-1 rounded-full text-black text-xs">
                      {progressPercentage}%
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                <ThemeToggle />
                <button
                  onClick={handleClose}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1 md:p-2 transition-colors flex-shrink-0"
                  title="Fechar"
                >
                  <svg
                    className="w-5 h-5 md:w-6 md:h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Progress Bar (EPUB mode only) */}
            {mode === 'epub' && (
              <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
                <div
                  className="bg-white h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            )}
          </div>

          {/* Saved Progress Indicator (EPUB mode only) */}
          {mode === 'epub' && autoSaveStatus === 'saving' && (
            <div
              className="text-xs md:text-sm px-2 md:px-3 py-1 md:py-1.5 rounded border mb-2 md:mb-3 transition-colors"
              style={{
                backgroundColor: "var(--yellow-bg)",
                borderColor: "var(--yellow-light)",
                color: "var(--yellow-dark)",
              }}
            >
              💾 Salvando...
            </div>
          )}
          {mode === 'epub' && autoSaveStatus === 'saved' && (
            <div
              className="text-xs md:text-sm px-2 md:px-3 py-1 md:py-1.5 rounded border mb-2 md:mb-3 transition-colors"
              style={{
                backgroundColor: "var(--green-bg)",
                borderColor: "var(--green-light)",
                color: "var(--green-dark)",
              }}
            >
              <span className="block md:inline">
                ✅ Salvo:
                <span className="md:hidden">
                  {" "}P.{currentPage + 1} F.
                  {currentSentenceIndex + 1} (agora)
                </span>
                <span className="hidden md:inline">
                  {" "}Página {currentPage + 1}, Frase{" "}
                  {currentSentenceIndex + 1} (agora)
                </span>
              </span>
            </div>
          )}

          {/* Page Navigation & Controls */}
          <div
            className="bg-opacity-95 backdrop-blur-sm flex items-center justify-between gap-1.5 md:gap-2 pb-2 md:pb-3 rounded transition-colors"
            style={{ backgroundColor: "var(--card-bg)" }}
          >
            {mode === 'epub' && (
              <>
                <button
                  onClick={handlePreviousPage}
                  disabled={!hasPreviousPage || isPlaying}
                  className="p-1.5 md:p-2 rounded transition-colors"
                  style={{
                    backgroundColor:
                      !hasPreviousPage || isPlaying
                        ? "var(--gray-300)"
                        : "var(--gray-600)",
                    color: "var(--button-text)",
                    cursor:
                      !hasPreviousPage || isPlaying ? "not-allowed" : "pointer",
                  }}
                  onMouseEnter={(e) => {
                    if (hasPreviousPage && !isPlaying) {
                      (e.currentTarget as HTMLElement).style.backgroundColor =
                        "var(--gray-700)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (hasPreviousPage && !isPlaying) {
                      (e.currentTarget as HTMLElement).style.backgroundColor =
                        "var(--gray-600)";
                    }
                  }}
                  title="Página anterior"
                >
                  ⏪
                </button>

                <span
                  className="text-xs md:text-sm font-semibold transition-colors"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {currentPage + 1}/{totalPages}
                </span>

                <button
                  onClick={handleNextPage}
                  disabled={!hasNextPage || isPlaying}
                  className="p-1.5 md:p-2 rounded transition-colors"
                  style={{
                    backgroundColor:
                      !hasNextPage || isPlaying
                        ? "var(--gray-300)"
                        : "var(--gray-600)",
                    color: "var(--button-text)",
                    cursor: !hasNextPage || isPlaying ? "not-allowed" : "pointer",
                  }}
                  onMouseEnter={(e) => {
                    if (hasNextPage && !isPlaying) {
                      (e.currentTarget as HTMLElement).style.backgroundColor =
                        "var(--gray-700)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (hasNextPage && !isPlaying) {
                      (e.currentTarget as HTMLElement).style.backgroundColor =
                        "var(--gray-600)";
                    }
                  }}
                  title="Próxima página"
                >
                  ⏩
                </button>
              </>
            )}

            {/* TTS Controls */}
            <div className={`flex items-center gap-2 ${mode === 'text' ? 'flex-1 justify-center' : ''}`}>
              <PlaybackControls
                isPlaying={isPlaying}
                isPaused={isPaused}
                onPlay={handlePlay}
                onPause={handlePauseWithSave}
              />

              {/* Interactive mode toggle */}
              <button
                onClick={() => setIsInteractive(!isInteractive)}
                className="px-2.5 py-1 rounded text-xs font-semibold transition-colors"
                style={{
                  backgroundColor: isInteractive ? 'var(--blue-light)' : 'var(--gray-300)',
                  color: 'var(--button-text)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = isInteractive ? 'var(--blue-dark)' : 'var(--gray-400)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = isInteractive ? 'var(--blue-light)' : 'var(--gray-300)';
                }}
                title={isInteractive ? 'Desativar clique nas frases (para usar Google Translate)' : 'Ativar clique nas frases'}
              >
                {isInteractive ? '🖱️' : '🚫'}
              </button>
            </div>

            {mode === 'epub' && (
              <>
                <button
                  onClick={handleSaveProgress}
                  className="px-2 md:px-3 py-1 md:py-2 rounded text-xs md:text-sm font-semibold transition-colors whitespace-nowrap"
                  style={{
                    backgroundColor: "var(--yellow-light)",
                    color: "var(--button-text)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                      "var(--yellow-dark)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                      "var(--yellow-light)";
                  }}
                  title="Salvar progresso manualmente"
                >
                  🔖
                </button>
              </>
            )}
          </div>

          {/* Chapter Progress (EPUB mode only) */}
          {mode === 'epub' && currentChapter && (
            <div className="px-2 md:px-3">
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() =>
                  setShowChapterPercentage(!showChapterPercentage)
                }
                title="Clique para alternar entre fração e porcentagem"
              >
                <div
                  className="flex-1 bg-opacity-30 rounded-full h-2 transition-colors"
                  style={{ backgroundColor: "var(--gray-300)" }}
                >
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${chapterProgress}%`,
                      backgroundColor: "var(--blue-light)",
                    }}
                  ></div>
                </div>
                <span
                  className="text-xs font-semibold whitespace-nowrap transition-colors"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {showChapterPercentage
                    ? `${chapterProgress}%`
                    : `${currentPage - currentChapter.startPage + 1}/${
                        currentChapter.endPage - currentChapter.startPage + 1
                      }`}
                </span>
              </div>
            </div>
          )}

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-2 md:p-4">
            {/* Page Content with Sentence Highlighting */}
            <div
              className="rounded-lg p-1 md:p-4 mb-2 md:mb-3 flex flex-col transition-colors"
              style={{ backgroundColor: "var(--hover-bg)" }}
            >
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
                  onSentenceClick={(index) => setCurrentSentence(index, true)}
                  isInteractive={isInteractive}
                />
              </div>
            </div>

            {/* Voice Settings */}
            <div
              className="rounded-lg p-2 md:p-4 flex-shrink-0 transition-colors"
              style={{ backgroundColor: "var(--hover-bg)" }}
            >
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
                meditationMode={meditationMode}
                onMeditationModeChange={setMeditationMode}
                meditationPause={meditationPause}
                onMeditationPauseChange={setMeditationPause}
                youtubeUrl={youtubeUrl}
                onYoutubeUrlChange={setYoutubeUrl}
                currentSentence={sentences[spokenSentenceIndex]}
                isPlaying={isPlaying}
                onPlay={handlePlay}
                onPause={handlePause}
                onPreviousSentence={previousSentence}
                onNextSentence={nextSentence}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
