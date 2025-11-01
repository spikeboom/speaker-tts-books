import { SavedText } from '../hooks/useTexts';

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
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            📚 Textos Salvos
          </h2>
        )}
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Carregando...</span>
        </div>
      </div>
    );
  }

  if (texts.length === 0) {
    return (
      <div>
        {!hideTitle && (
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            📚 Textos Salvos
          </h2>
        )}
        <div className="text-center py-8 text-gray-500">
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
          <h2 className="text-2xl font-semibold text-gray-800">
            📚 Textos Salvos
          </h2>
          <span className="text-sm text-gray-600 bg-blue-100 px-3 py-1 rounded-full">
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
              className={`border-2 rounded-lg p-4 transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300 bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 text-lg mb-1 truncate">
                    {text.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {formatDate(text.created_at)}
                  </p>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {text.content.substring(0, 100)}
                    {text.content.length > 100 ? '...' : ''}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => onSelectText(text)}
                    className={`px-4 py-2 rounded-lg font-semibold shadow-sm transition-colors whitespace-nowrap ${
                      isSelected
                        ? 'bg-blue-500 text-white'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {isSelected ? '✓ Selecionado' : '📖 Carregar'}
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Deseja realmente excluir "${text.title}"?`)) {
                        onDeleteText(text.id);
                      }
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold shadow-sm transition-colors whitespace-nowrap"
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
