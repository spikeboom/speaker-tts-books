'use client';

import { EpubUpload } from '../components/EpubUpload';
import { EpubsList } from '../components/EpubsList';
import { useEpubs, Epub } from '../hooks/useEpubs';
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              📚 Gerenciador de EPUBs
            </h1>
            <p className="text-gray-600">
              Faça upload e gerencie seus livros digitais
            </p>
          </div>
          <Link
            href="/"
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold shadow-md transition-colors"
          >
            ← Voltar para Leitor TTS
          </Link>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-300 rounded-lg p-4">
            <p className="text-red-700 text-sm">
              ⚠️ <strong>Erro:</strong> {error}
            </p>
            <p className="text-red-600 text-xs mt-2">
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

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            ℹ️ Instruções
          </h3>
          <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
            <li>Arraste e solte ou clique para selecionar um arquivo EPUB</li>
            <li>Insira um título descritivo para o livro</li>
            <li>Clique em "Fazer Upload" para enviar</li>
            <li>Use "Download" para baixar o livro novamente</li>
            <li>Tamanho máximo por arquivo: 50MB</li>
          </ul>
          <p className="mt-3 text-xs text-gray-600">
            💡 Os livros são armazenados com segurança no Supabase Storage
          </p>
        </div>
      </div>
    </div>
  );
}
