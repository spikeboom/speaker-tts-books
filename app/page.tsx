'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TextInput } from './components/TextInput';
import { SavedTextsList } from './components/SavedTextsList';
import ThemeToggle from './components/ThemeToggle';
import { useTexts } from './hooks/useTexts';
import { useWakeLock } from './hooks/useWakeLock';

export default function Home() {
  // Keep screen on while using the app
  useWakeLock();

  const router = useRouter();
  const [text, setText] = useState('');

  const {
    texts,
    loading: textsLoading,
    error: textsError,
    saveText,
    deleteText,
    deleteAllTexts,
  } = useTexts();

  const handleSaveAndRead = async () => {
    if (!text.trim()) return;
    const title = 'Leitura ' + new Date().toLocaleString('pt-BR');
    const textId = await saveText(title, text);
    if (textId) {
      router.push(`/text/${textId}`);
    } else {
      alert('Erro ao salvar texto. Tente novamente.');
    }
  };

  const handleDeleteText = async (id: string) => {
    const success = await deleteText(id);
    if (success) {
      alert('Texto excluído com sucesso!');
    } else {
      alert('Erro ao excluir texto.');
    }
  };

  const handleDeleteAllTexts = async () => {
    if (!confirm('Tem certeza que deseja apagar TODOS os textos salvos? Esta ação não pode ser desfeita.')) {
      return;
    }
    const success = await deleteAllTexts();
    if (success) {
      alert('Todos os textos foram excluídos!');
    } else {
      alert('Erro ao apagar textos.');
    }
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

        <div className="rounded-lg shadow-xl p-6 mb-6 transition-colors" style={{ backgroundColor: 'var(--card-bg)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold transition-colors" style={{ color: 'var(--foreground)' }}>
              📚 Textos Salvos
            </h2>
            {texts.length > 0 && (
              <button
                onClick={handleDeleteAllTexts}
                className="px-3 py-2 rounded-lg font-semibold text-sm transition-colors"
                style={{
                  backgroundColor: 'var(--red-light)',
                  color: 'var(--button-text)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--red-dark)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--red-light)';
                }}
                title="Apagar TODOS os textos salvos"
              >
                🗑️ Apagar Todos
              </button>
            )}
          </div>

          <SavedTextsList
            texts={texts}
            loading={textsLoading}
            onDeleteText={handleDeleteText}
            hideTitle={true}
          />

          {textsError && (
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
        </div>

        <div className="rounded-lg shadow-xl p-6 mb-6 transition-colors" style={{ backgroundColor: 'var(--card-bg)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
              ✏️ Texto para Leitura
            </h2>
            <button
              onClick={handleSaveAndRead}
              disabled={!text.trim()}
              className="px-4 py-2 rounded-lg font-semibold shadow-md transition-colors"
              style={{
                backgroundColor: !text.trim() ? 'var(--gray-300)' : 'var(--blue-light)',
                color: 'var(--button-text)',
                cursor: !text.trim() ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => {
                if (text.trim()) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--blue-dark)';
                }
              }}
              onMouseLeave={(e) => {
                if (text.trim()) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--blue-light)';
                }
              }}
              title="Salvar e iniciar leitura"
            >
              ▶️ Iniciar
            </button>
          </div>

          <TextInput value={text} onChange={setText} />
        </div>
      </div>
    </div>
  );
}
