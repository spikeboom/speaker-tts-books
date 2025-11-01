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
    <div className="fixed inset-0 z-50 flex items-center justify-center transition-colors" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div
        className="rounded-lg shadow-xl p-6 w-full max-w-md mx-4 transition-colors"
        style={{ backgroundColor: 'var(--card-bg)' }}
      >
        <h2 className="text-2xl font-bold mb-4 transition-colors" style={{ color: 'var(--foreground)' }}>
          💾 Salvar Texto
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 transition-colors" style={{ color: 'var(--label-text)' }}>
            Título do Texto
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Digite um título..."
            className="w-full p-3 border-2 rounded-lg focus:outline-none transition-colors"
            style={{
              borderColor: 'var(--input-border)',
              backgroundColor: 'var(--input-bg)',
              color: 'var(--input-text)',
            }}
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
          <label className="block text-sm font-medium mb-2 transition-colors" style={{ color: 'var(--label-text)' }}>
            Preview do Texto
          </label>
          <div
            className="p-3 border-2 rounded-lg max-h-32 overflow-y-auto transition-colors"
            style={{
              borderColor: 'var(--border-color)',
              backgroundColor: 'var(--hover-bg)',
            }}
          >
            <p className="text-sm line-clamp-4 transition-colors" style={{ color: 'var(--text-secondary)' }}>
              {currentText.substring(0, 200)}
              {currentText.length > 200 ? '...' : ''}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving || !title.trim()}
            className="flex-1 px-4 py-3 rounded-lg font-semibold shadow-md transition-colors"
            style={{
              backgroundColor: isSaving || !title.trim() ? 'var(--gray-300)' : 'var(--green-light)',
              color: 'var(--button-text)',
              cursor: isSaving || !title.trim() ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!isSaving && title.trim()) {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--green-dark)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSaving && title.trim()) {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--green-light)';
              }
            }}
          >
            {isSaving ? '⏳ Salvando...' : '💾 Salvar'}
          </button>
          <button
            onClick={handleClose}
            disabled={isSaving}
            className="flex-1 px-4 py-3 rounded-lg font-semibold shadow-md transition-colors"
            style={{
              backgroundColor: isSaving ? 'var(--gray-300)' : 'var(--gray-600)',
              color: 'var(--button-text)',
              cursor: isSaving ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!isSaving) {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--gray-700)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSaving) {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--gray-600)';
              }
            }}
          >
            ❌ Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
