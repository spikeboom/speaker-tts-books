'use client';

import { EpubUpload } from '../components/EpubUpload';
import { EpubsList } from '../components/EpubsList';
import { useEpubs, Epub } from '../hooks/useEpubs';
import ThemeToggle from '../components/ThemeToggle';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function EpubsPage() {
  const router = useRouter();
  const {
    epubs,
    loading,
    error,
    uploadProgress,
    uploadEpub,
    downloadEpub,
    deleteEpub,
  } = useEpubs();

  const handleUpload = async (file: File, title: string) => {
    const success = await uploadEpub(file, title);
    if (success) {
      alert('EPUB enviado com sucesso!');
    } else {
      alert('Erro ao enviar EPUB. Verifique se o bucket foi criado no Supabase.');
    }
    return success;
  };

  const handleDelete = async (id: string, filePath: string) => {
    const success = await deleteEpub(id, filePath);
    if (success) {
      alert('EPUB excluído com sucesso!');
    } else {
      alert('Erro ao excluir EPUB.');
    }
  };

  const handleRead = (epub: Epub) => {
    router.push(`/epub/${epub.id}`);
  };

  return (
    <div
      className="min-h-screen p-8 transition-colors"
      style={{
        background: `linear-gradient(to right, var(--purple-bg), var(--pink-bg))`,
        color: 'var(--foreground)',
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 transition-colors" style={{ color: 'var(--foreground)' }}>
              📚 Gerenciador de EPUBs
            </h1>
            <p className="transition-colors" style={{ color: 'var(--text-secondary)' }}>
              Faça upload e gerencie seus livros digitais
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/"
              className="px-6 py-3 rounded-lg font-semibold shadow-md transition-colors"
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
              ← Início
            </Link>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div
            className="mb-6 border-2 rounded-lg p-4 transition-colors"
            style={{
              backgroundColor: 'var(--red-bg)',
              borderColor: 'var(--red-light)',
            }}
          >
            <p className="text-sm transition-colors" style={{ color: 'var(--red-dark)' }}>
              ⚠️ <strong>Erro:</strong> {error}
            </p>
            <p className="text-xs mt-2 transition-colors" style={{ color: 'var(--red-dark)' }}>
              Certifique-se de:
              <br />
              1. Executar o SQL em <code>supabase/schema.sql</code>
              <br />
              2. Criar o bucket "epubs" seguindo <code>supabase/storage-setup.md</code>
            </p>
          </div>
        )}

        {/* Upload Section */}
        <div className="mb-8">
          <EpubUpload
            onUpload={handleUpload}
            loading={loading}
            uploadProgress={uploadProgress}
          />
        </div>

        {/* List Section */}
        <div>
          <EpubsList
            epubs={epubs}
            loading={loading}
            onDownload={downloadEpub}
            onDelete={handleDelete}
            onRead={handleRead}
          />
        </div>
      </div>
    </div>
  );
}
