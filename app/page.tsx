'use client';

import { TextInput } from './components/TextInput';
import { PlaybackControls } from './components/PlaybackControls';
import { VoiceSettings } from './components/VoiceSettings';
import { SentenceHighlight } from './components/SentenceHighlight';
import { useSentenceReader } from './hooks/useSentenceReader';

export default function Home() {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          📖 Leitor de Texto com TTS
        </h1>

        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
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
            <li>Use <strong>Pausar</strong> para salvar o progresso - ao retomar, continua da mesma frase</li>
            <li>Se parar no meio de uma frase, ao dar play volta para o início dessa frase</li>
            <li>Use <strong>Resetar</strong> para voltar ao início do texto</li>
            <li>A frase atual é destacada em amarelo durante a leitura</li>
          </ul>
          <p className="mt-3 text-xs text-gray-600">
            💡 Este leitor usa a Web Speech API nativa do navegador (funciona melhor no Chrome, Edge e Safari)
          </p>
        </div>
      </div>
    </div>
  );
}
