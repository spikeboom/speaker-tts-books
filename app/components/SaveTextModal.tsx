import { useState } from 'react';

interface SaveTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string) => Promise<void>;
  currentText: string;
}

export function SaveTextModal({ isOpen, onClose, onSave, currentText }: SaveTextModalProps) {
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Por favor, insira um título para o texto.');
      return;
    }

    if (!currentText.trim()) {
      alert('Não há texto para salvar.');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(title.trim());
      setTitle('');
      onClose();
    } catch (error) {
      console.error('Error saving:', error);
      alert('Erro ao salvar texto. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          💾 Salvar Texto
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título do Texto
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Digite um título..."
            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-700"
            autoFocus
            disabled={isSaving}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSave();
              }
            }}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preview do Texto
          </label>
          <div className="p-3 border-2 border-gray-200 rounded-lg bg-gray-50 max-h-32 overflow-y-auto">
            <p className="text-sm text-gray-600 line-clamp-4">
              {currentText.substring(0, 200)}
              {currentText.length > 200 ? '...' : ''}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving || !title.trim()}
            className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold shadow-md transition-colors"
          >
            {isSaving ? '⏳ Salvando...' : '💾 Salvar'}
          </button>
          <button
            onClick={handleClose}
            disabled={isSaving}
            className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold shadow-md transition-colors"
          >
            ❌ Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
