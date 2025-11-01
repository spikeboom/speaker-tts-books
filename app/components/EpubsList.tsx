import { Epub } from '../hooks/useEpubs';

interface EpubsListProps {
  epubs: Epub[];
  loading: boolean;
  onDownload: (epub: Epub) => void;
  onDelete: (id: string, filePath: string) => void;
  onRead?: (epub: Epub) => void;
  hideTitle?: boolean;
}

export function EpubsList({ epubs, loading, onDownload, onDelete, onRead, hideTitle = false }: EpubsListProps) {
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
      <div>
        {!hideTitle && (
          <h2 className="text-2xl font-semibold mb-4 transition-colors" style={{ color: 'var(--foreground)' }}>
            📚 Biblioteca de EPUBs
          </h2>
        )}
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--blue-light)' }}></div>
          <span className="ml-3 transition-colors" style={{ color: 'var(--text-secondary)' }}>Carregando...</span>
        </div>
      </div>
    );
  }

  if (epubs.length === 0) {
    return (
      <div>
        {!hideTitle && (
          <h2 className="text-2xl font-semibold mb-4 transition-colors" style={{ color: 'var(--foreground)' }}>
            📚 Biblioteca de EPUBs
          </h2>
        )}
        <div className="text-center py-12 transition-colors" style={{ color: 'var(--text-muted)' }}>
          <div className="text-6xl mb-4">📖</div>
          <p className="text-lg mb-2">Nenhum livro ainda</p>
          <p className="text-sm">
            Acesse a página de EPUBs para fazer upload
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {!hideTitle && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold transition-colors" style={{ color: 'var(--foreground)' }}>
            📚 Biblioteca de EPUBs
          </h2>
          <span
            className="text-sm px-3 py-1 rounded-full transition-colors"
            style={{
              color: 'var(--button-text)',
              backgroundColor: 'var(--blue-light)',
            }}
          >
            {epubs.length} {epubs.length === 1 ? 'livro' : 'livros'}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {epubs.map((epub) => (
          <div
            key={epub.id}
            className="border-2 rounded-lg p-4 transition-all"
            style={{
              borderColor: 'var(--border-color)',
              background: `linear-gradient(to bottom right, var(--card-bg), var(--hover-bg))`,
            }}
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
                className="text-sm transition-colors"
                style={{ color: 'var(--red-light)' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = 'var(--red-dark)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = 'var(--red-light)';
                }}
                title="Excluir"
              >
                🗑️
              </button>
            </div>

            {/* Title */}
            <h3 className="font-bold text-lg mb-2 line-clamp-2 min-h-[3.5rem] transition-colors" style={{ color: 'var(--foreground)' }}>
              {epub.title}
            </h3>

            {/* File Info */}
            <div className="text-xs mb-3 space-y-1 transition-colors" style={{ color: 'var(--text-secondary)' }}>
              <p className="truncate" title={epub.file_name}>
                📄 {epub.file_name}
              </p>
              <p>💾 {formatFileSize(epub.file_size)}</p>
              <p>📅 {formatDate(epub.uploaded_at)}</p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              {onRead && (
                <button
                  onClick={() => onRead(epub)}
                  className="w-full px-4 py-2 rounded-lg font-semibold text-sm shadow-sm transition-colors"
                  style={{
                    backgroundColor: 'var(--green-light)',
                    color: 'var(--button-text)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--green-dark)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--green-light)';
                  }}
                >
                  📖 Ler com TTS
                </button>
              )}
              <button
                onClick={() => onDownload(epub)}
                className="w-full px-4 py-2 rounded-lg font-semibold text-sm shadow-sm transition-colors"
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
                📥 Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
