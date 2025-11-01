import { useState, useRef } from 'react';

interface EpubUploadProps {
  onUpload: (file: File, title: string) => Promise<boolean>;
  loading: boolean;
  uploadProgress: number;
}

export function EpubUpload({ onUpload, loading, uploadProgress }: EpubUploadProps) {
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!file.type.includes('epub') && !file.name.endsWith('.epub')) {
      alert('Por favor, selecione um arquivo EPUB válido');
      return;
    }

    // Validate file size (50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('Arquivo muito grande. Tamanho máximo: 50MB');
      return;
    }

    setSelectedFile(file);

    // Auto-fill title from filename (remove .epub extension)
    if (!title) {
      const fileName = file.name.replace(/\.epub$/i, '');
      setTitle(fileName);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Por favor, selecione um arquivo EPUB');
      return;
    }

    if (!title.trim()) {
      alert('Por favor, insira um título para o livro');
      return;
    }

    const success = await onUpload(selectedFile, title.trim());

    if (success) {
      // Reset form
      setTitle('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        📤 Upload de EPUB
      </h2>

      {/* Drag and Drop Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".epub,application/epub+zip"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={loading}
        />

        {!selectedFile ? (
          <div>
            <div className="text-6xl mb-4">📚</div>
            <p className="text-lg text-gray-700 mb-2">
              Arraste um arquivo EPUB aqui
            </p>
            <p className="text-sm text-gray-500 mb-4">ou</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 font-semibold shadow-md transition-colors"
            >
              Selecionar Arquivo
            </button>
            <p className="text-xs text-gray-500 mt-4">
              Tamanho máximo: 50MB
            </p>
          </div>
        ) : (
          <div>
            <div className="text-6xl mb-4">✅</div>
            <p className="text-lg font-semibold text-gray-800 mb-1">
              {selectedFile.name}
            </p>
            <p className="text-sm text-gray-600 mb-4">
              {formatFileSize(selectedFile.size)}
            </p>
            <button
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              disabled={loading}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Remover arquivo
            </button>
          </div>
        )}
      </div>

      {/* Title Input */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Título do Livro
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Digite o título do livro..."
          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-700"
          disabled={loading}
        />
      </div>

      {/* Upload Progress */}
      {uploadProgress > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Fazendo upload...
            </span>
            <span className="text-sm font-medium text-blue-600">
              {uploadProgress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Upload Button */}
      <div className="mt-6">
        <button
          onClick={handleUpload}
          disabled={loading || !selectedFile || !title.trim()}
          className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold shadow-md transition-colors"
        >
          {loading ? '⏳ Enviando...' : '📤 Fazer Upload'}
        </button>
      </div>
    </div>
  );
}
