import { Epub } from '../hooks/useEpubs';

interface EpubsListProps {
  epubs: Epub[];
  loading: boolean;
  onDownload: (epub: Epub) => void;
  onDelete: (id: string, filePath: string) => void;
}

export function EpubsList({ epubs, loading, onDownload, onDelete }: EpubsListProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && epubs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-xl p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          📚 Biblioteca de EPUBs
        </h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Carregando...</span>
        </div>
      </div>
    );
  }

  if (epubs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-xl p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          📚 Biblioteca de EPUBs
        </h2>
        <div className="text-center py-12 text-gray-500">
          <div className="text-6xl mb-4">📖</div>
          <p className="text-lg mb-2">Nenhum livro ainda</p>
          <p className="text-sm">
            Faça upload do seu primeiro EPUB para começar
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          📚 Biblioteca de EPUBs
        </h2>
        <span className="text-sm text-gray-600 bg-blue-100 px-3 py-1 rounded-full">
          {epubs.length} {epubs.length === 1 ? 'livro' : 'livros'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {epubs.map((epub) => (
          <div
            key={epub.id}
            className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-all bg-gradient-to-br from-white to-gray-50"
          >
            {/* Book Icon */}
            <div className="flex items-start justify-between mb-3">
              <div className="text-4xl">📕</div>
              <button
                onClick={() => {
                  if (confirm(`Deseja realmente excluir "${epub.title}"?`)) {
                    onDelete(epub.id, epub.file_path);
                  }
                }}
                className="text-red-500 hover:text-red-700 text-sm"
                title="Excluir"
              >
                🗑️
              </button>
            </div>

            {/* Title */}
            <h3 className="font-bold text-gray-800 text-lg mb-2 line-clamp-2 min-h-[3.5rem]">
              {epub.title}
            </h3>

            {/* File Info */}
            <div className="text-xs text-gray-600 mb-3 space-y-1">
              <p className="truncate" title={epub.file_name}>
                📄 {epub.file_name}
              </p>
              <p>💾 {formatFileSize(epub.file_size)}</p>
              <p>📅 {formatDate(epub.uploaded_at)}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => onDownload(epub)}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold text-sm shadow-sm transition-colors"
              >
                📥 Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
