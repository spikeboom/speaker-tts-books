import { SavedText } from '../hooks/useTexts';
import Link from 'next/link';

interface SavedTextsListProps {
  texts: SavedText[];
  loading: boolean;
  onSelectText: (text: SavedText) => void;
  onDeleteText: (id: string) => void;
  currentTextId?: string;
  hideTitle?: boolean;
}

export function SavedTextsList({
  texts,
  loading,
  onSelectText,
  onDeleteText,
  currentTextId,
  hideTitle = false,
}: SavedTextsListProps) {
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

  if (loading && texts.length === 0) {
    return (
      <div>
        {!hideTitle && (
          <h2 className="text-2xl font-semibold mb-4 transition-colors" style={{ color: 'var(--foreground)' }}>
            📚 Textos Salvos
          </h2>
        )}
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--blue-light)' }}></div>
          <span className="ml-3 transition-colors" style={{ color: 'var(--text-secondary)' }}>Carregando...</span>
        </div>
      </div>
    );
  }

  if (texts.length === 0) {
    return (
      <div>
        {!hideTitle && (
          <h2 className="text-2xl font-semibold mb-4 transition-colors" style={{ color: 'var(--foreground)' }}>
            📚 Textos Salvos
          </h2>
        )}
        <div className="text-center py-8 transition-colors" style={{ color: 'var(--text-muted)' }}>
          <p className="text-lg mb-2">Nenhum texto salvo ainda</p>
          <p className="text-sm">
            Clique no botão "💾 Salvar Texto" para guardar seus textos
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
            📚 Textos Salvos
          </h2>
          <span
            className="text-sm px-3 py-1 rounded-full transition-colors"
            style={{
              color: 'var(--button-text)',
              backgroundColor: 'var(--blue-light)',
            }}
          >
            {texts.length} {texts.length === 1 ? 'texto' : 'textos'}
          </span>
        </div>
      )}

      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {texts.map((text) => {
          const isSelected = currentTextId === text.id;

          return (
            <div
              key={text.id}
              className="border-2 rounded-lg p-4 transition-all"
              style={{
                borderColor: isSelected ? 'var(--blue-light)' : 'var(--border-color)',
                backgroundColor: isSelected ? 'var(--blue-bg)' : 'var(--card-bg)',
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg mb-1 truncate transition-colors" style={{ color: 'var(--foreground)' }}>
                    {text.title}
                  </h3>
                  <p className="text-sm mb-2 transition-colors" style={{ color: 'var(--text-muted)' }}>
                    {formatDate(text.created_at)}
                  </p>
                  <p className="text-sm line-clamp-2 transition-colors" style={{ color: 'var(--text-secondary)' }}>
                    {text.content.substring(0, 100)}
                    {text.content.length > 100 ? '...' : ''}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <Link
                    href={`/text/${text.id}`}
                    className="px-4 py-2 rounded-lg font-semibold shadow-sm transition-colors whitespace-nowrap text-center"
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
                    📖 Abrir
                  </Link>

                  <button
                    onClick={() => onSelectText(text)}
                    className="px-4 py-2 rounded-lg font-semibold shadow-sm transition-colors whitespace-nowrap"
                    style={{
                      backgroundColor: isSelected ? 'var(--blue-dark)' : 'var(--blue-light)',
                      color: 'var(--button-text)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--blue-dark)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--blue-light)';
                      }
                    }}
                  >
                    {isSelected ? '✓ Selecionado' : '⬇️ Carregar'}
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Deseja realmente excluir "${text.title}"?`)) {
                        onDeleteText(text.id);
                      }
                    }}
                    className="px-4 py-2 rounded-lg font-semibold shadow-sm transition-colors whitespace-nowrap"
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
                  >
                    🗑️ Excluir
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
