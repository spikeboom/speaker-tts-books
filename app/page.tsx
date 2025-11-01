'use client';

import { useState } from 'react';
import { TextInput } from './components/TextInput';
import { PlaybackControls } from './components/PlaybackControls';
import { VoiceSettings } from './components/VoiceSettings';
import { SentenceHighlight } from './components/SentenceHighlight';
import { SaveTextModal } from './components/SaveTextModal';
import { SavedTextsList } from './components/SavedTextsList';
import { useSentenceReader } from './hooks/useSentenceReader';
import { useTexts } from './hooks/useTexts';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTextId, setCurrentTextId] = useState<string | undefined>(undefined);

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
  } = useSentenceReader();

  const {
    texts,
    loading: textsLoading,
    error: textsError,
    saveText,
    deleteText,
  } = useTexts();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          📖 Leitor de Texto com TTS
        </h1>

        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              ✏️ Texto para Leitura
            </h2>
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={!text.trim() || (isPlaying && !isPaused)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold shadow-md transition-colors"
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

        <div className="mb-6">
          <SavedTextsList
            texts={texts}
            loading={textsLoading}
            onSelectText={handleSelectText}
            onDeleteText={handleDeleteText}
            currentTextId={currentTextId}
          />
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            📄 Visualização de Leitura
          </h2>
          <div className="mb-2 text-sm text-gray-600">
            <span className="font-semibold">
              Frase {currentSentenceIndex + 1} de {sentences.length}
            </span>
            {isPaused && (
              <span className="ml-4 text-yellow-600 font-semibold">
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

        <div className="bg-white rounded-lg shadow-xl p-6">
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

        <div className="mt-6 bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            ℹ️ Como usar
          </h3>
          <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
            <li>Cole ou digite seu texto no campo acima</li>
            <li>Clique em <strong>Reproduzir</strong> para iniciar a leitura frase por frase</li>
            <li>Use <strong>Pausar</strong> para pausar - ao retomar, volta do início da frase atual</li>
            <li>Use <strong>Parar</strong> para interromper completamente a leitura</li>
            <li>Use <strong>Resetar</strong> para voltar ao início do texto</li>
            <li>A frase atual é destacada em amarelo (tocando) ou laranja (pausado)</li>
            <li>Clique em <strong>💾 Salvar Texto</strong> para guardar o texto no banco de dados</li>
            <li>Na seção <strong>📚 Textos Salvos</strong>, clique em <strong>📖 Carregar</strong> para usar um texto salvo</li>
          </ul>
          <p className="mt-3 text-xs text-gray-600">
            💡 Este leitor usa a Web Speech API nativa do navegador (funciona melhor no Chrome, Edge e Safari)
          </p>
        </div>

        {textsError && (
          <div className="mt-4 bg-red-50 border-2 border-red-300 rounded-lg p-4">
            <p className="text-red-700 text-sm">
              ⚠️ <strong>Erro:</strong> {textsError}
            </p>
            <p className="text-red-600 text-xs mt-2">
              Certifique-se de executar o SQL em <code>supabase/schema.sql</code> no seu projeto Supabase.
            </p>
          </div>
        )}
      </div>

      <SaveTextModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveText}
        currentText={text}
      />
    </div>
  );
}
