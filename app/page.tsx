'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TextInput } from './components/TextInput';
import { PlaybackControls } from './components/PlaybackControls';
import { VoiceSettings } from './components/VoiceSettings';
import { SentenceHighlight } from './components/SentenceHighlight';
import { SaveTextModal } from './components/SaveTextModal';
import { SavedTextsList } from './components/SavedTextsList';
import { EpubsList } from './components/EpubsList';
import { EpubReader } from './components/EpubReader';
import ThemeToggle from './components/ThemeToggle';
import { useSentenceReader } from './hooks/useSentenceReader';
import { useTexts } from './hooks/useTexts';
import { useEpubs, Epub } from './hooks/useEpubs';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTextId, setCurrentTextId] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'texts' | 'epubs'>('texts');
  const [selectedEpub, setSelectedEpub] = useState<Epub | null>(null);

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
    previousSentence,
    nextSentence,
  } = useSentenceReader();

  const {
    texts,
    loading: textsLoading,
    error: textsError,
    saveText,
    deleteText,
  } = useTexts();

  const {
    epubs,
    loading: epubsLoading,
    error: epubsError,
    downloadEpub,
    deleteEpub,
  } = useEpubs();

  const handleSaveText = async (title: string) => {
    const success = await saveText(title, text);
    if (success) {
      alert('Texto salvo com sucesso!');
    } else {
      alert('Erro ao salvar texto. Verifique se a tabela foi criada no Supabase.');
    }
  };

  const handleSelectText = (savedText: { id: string; title: string; content: string }) => {
    setText(savedText.content);
    setCurrentTextId(savedText.id);
    handleStop(); // Stop any current playback
  };

  const handleDeleteText = async (id: string) => {
    const success = await deleteText(id);
    if (success) {
      if (currentTextId === id) {
        setCurrentTextId(undefined);
      }
      alert('Texto excluído com sucesso!');
    } else {
      alert('Erro ao excluir texto.');
    }
  };

  const handleDeleteEpub = async (id: string, filePath: string) => {
    const success = await deleteEpub(id, filePath);
    if (success) {
      alert('EPUB excluído com sucesso!');
    } else {
      alert('Erro ao excluir EPUB.');
    }
  };

  const handleReadEpub = async (epub: Epub) => {
    setSelectedEpub(epub);
  };

  const handleCloseEpubReader = () => {
    setSelectedEpub(null);
  };

  return (
    <div
      className="min-h-screen p-8 transition-colors"
      style={{
        background: `linear-gradient(to right, var(--blue-bg), var(--purple-bg))`,
        color: 'var(--foreground)',
      }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold" style={{ color: 'var(--foreground)' }}>
            📖 Leitor de Texto com TTS
          </h1>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/epubs"
              className="px-4 py-2 font-semibold shadow-md transition-colors flex items-center gap-2 rounded-lg"
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
            >
              📚 EPUBs
            </Link>
          </div>
        </div>

        <div className="mb-6">
          {/* Tabs */}
          <div className="rounded-t-lg shadow-xl p-2 flex gap-2 transition-colors" style={{ backgroundColor: 'var(--card-bg)' }}>
            <button
              onClick={() => setActiveTab('texts')}
              className="flex-1 px-4 py-3 rounded-lg font-semibold transition-colors"
              style={{
                backgroundColor: activeTab === 'texts' ? 'var(--blue-light)' : 'var(--gray-100)',
                color: activeTab === 'texts' ? 'var(--button-text)' : 'var(--text-secondary)',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'texts') {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--hover-bg)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'texts') {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--gray-100)';
                }
              }}
            >
              📝 Textos Salvos ({texts.length})
            </button>
            <button
              onClick={() => setActiveTab('epubs')}
              className="flex-1 px-4 py-3 rounded-lg font-semibold transition-colors"
              style={{
                backgroundColor: activeTab === 'epubs' ? 'var(--purple-light)' : 'var(--gray-100)',
                color: activeTab === 'epubs' ? 'var(--button-text)' : 'var(--text-secondary)',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'epubs') {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--hover-bg)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'epubs') {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--gray-100)';
                }
              }}
            >
              📚 EPUBs ({epubs.length})
            </button>
          </div>

          {/* Tab Content */}
          <div className="rounded-b-lg shadow-xl transition-colors" style={{ backgroundColor: 'var(--card-bg)' }}>
            {activeTab === 'texts' ? (
              <div className="p-6">
                <SavedTextsList
                  texts={texts}
                  loading={textsLoading}
                  onSelectText={handleSelectText}
                  onDeleteText={handleDeleteText}
                  currentTextId={currentTextId}
                  hideTitle={true}
                />
              </div>
            ) : (
              <div className="p-6">
                <EpubsList
                  epubs={epubs}
                  loading={epubsLoading}
                  onDownload={downloadEpub}
                  onDelete={handleDeleteEpub}
                  onRead={handleReadEpub}
                  hideTitle={true}
                />
              </div>
            )}
          </div>

          {/* Error Messages */}
          {activeTab === 'texts' && textsError && (
            <div
              className="mt-4 border-2 rounded-lg p-4 transition-colors"
              style={{
                backgroundColor: 'var(--red-bg)',
                borderColor: 'var(--red-light)',
              }}
            >
              <p className="text-sm" style={{ color: 'var(--red-dark)' }}>
                ⚠️ <strong>Erro:</strong> {textsError}
              </p>
            </div>
          )}
          {activeTab === 'epubs' && epubsError && (
            <div
              className="mt-4 border-2 rounded-lg p-4 transition-colors"
              style={{
                backgroundColor: 'var(--red-bg)',
                borderColor: 'var(--red-light)',
              }}
            >
              <p className="text-sm" style={{ color: 'var(--red-dark)' }}>
                ⚠️ <strong>Erro:</strong> {epubsError}
              </p>
            </div>
          )}
        </div>

        <div className="rounded-lg shadow-xl p-6 mb-6 transition-colors" style={{ backgroundColor: 'var(--card-bg)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
              ✏️ Texto para Leitura
            </h2>
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={!text.trim() || (isPlaying && !isPaused)}
              className="px-4 py-2 rounded-lg font-semibold shadow-md transition-colors"
              style={{
                backgroundColor: !text.trim() || (isPlaying && !isPaused) ? 'var(--gray-300)' : 'var(--green-light)',
                color: 'var(--button-text)',
                cursor: !text.trim() || (isPlaying && !isPaused) ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => {
                if (text.trim() && !(isPlaying && !isPaused)) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--green-dark)';
                }
              }}
              onMouseLeave={(e) => {
                if (text.trim() && !(isPlaying && !isPaused)) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--green-light)';
                }
              }}
            >
              💾 Salvar Texto
            </button>
          </div>

          <TextInput value={text} onChange={setText} disabled={isPlaying && !isPaused} />

          <div className="mt-6">
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
        </div>

        <div className="rounded-lg shadow-xl p-6 mb-6 transition-colors" style={{ backgroundColor: 'var(--card-bg)' }}>
          <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
            📄 Visualização de Leitura
          </h2>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={previousSentence}
                disabled={currentSentenceIndex === 0}
                className="px-3 py-1 rounded font-semibold text-sm transition-colors"
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
                ⏪ Anterior
              </button>
              <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                Frase {currentSentenceIndex + 1} de {sentences.length}
              </span>
              <button
                onClick={nextSentence}
                disabled={currentSentenceIndex === sentences.length - 1}
                className="px-3 py-1 rounded font-semibold text-sm transition-colors"
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
                Próxima ⏩
              </button>
            </div>
            {isPaused && (
              <span className="font-semibold text-sm" style={{ color: 'var(--yellow-dark)' }}>
                ⏸️ Pausado - ao retomar, continuará da frase atual
              </span>
            )}
          </div>
          <SentenceHighlight
            sentences={sentences}
            currentSentenceIndex={currentSentenceIndex}
            isPlaying={isPlaying}
            isPaused={isPaused}
          />
        </div>

        <div className="rounded-lg shadow-xl p-6 transition-colors" style={{ backgroundColor: 'var(--card-bg)' }}>
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

        <div
          className="mt-6 rounded-lg p-4 border-2 transition-colors"
          style={{
            backgroundColor: 'var(--blue-bg)',
            borderColor: 'var(--blue-light)',
          }}
        >
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
            ℹ️ Como usar
          </h3>
          <ul className="text-sm space-y-1 list-disc list-inside" style={{ color: 'var(--text-secondary)' }}>
            <li>Cole ou digite seu texto no campo acima</li>
            <li>Clique em <strong>Reproduzir</strong> para iniciar a leitura frase por frase</li>
            <li>Use <strong>Pausar</strong> para pausar - ao retomar, volta do início da frase atual</li>
            <li>Use <strong>Parar</strong> para interromper completamente a leitura</li>
            <li>Use <strong>Resetar</strong> para voltar ao início do texto</li>
            <li>A frase atual é destacada em amarelo (tocando) ou laranja (pausado)</li>
            <li>Clique em <strong>💾 Salvar Texto</strong> para guardar o texto no banco de dados</li>
            <li>Na seção <strong>📚 Textos Salvos</strong>, clique em <strong>📖 Carregar</strong> para usar um texto salvo</li>
          </ul>
          <p className="mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
            💡 Este leitor usa a Web Speech API nativa do navegador (funciona melhor no Chrome, Edge e Safari)
          </p>
        </div>
      </div>

      <SaveTextModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveText}
        currentText={text}
      />

      {selectedEpub && (
        <EpubReader
          epubId={selectedEpub.id}
          filePath={selectedEpub.file_path}
          title={selectedEpub.title}
          onClose={handleCloseEpubReader}
        />
      )}
    </div>
  );
}
