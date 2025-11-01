'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { EpubReader } from '@/app/components/EpubReader';
import { createClient } from '@/utils/supabase/client';

interface EpubData {
  id: string;
  title: string;
  file_path: string;
}

export default function EpubPage() {
  const params = useParams();
  const router = useRouter();
  const [epub, setEpub] = useState<EpubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEpub = async () => {
      try {
        const supabase = createClient();
        const { data, error: fetchError } = await supabase
          .from('epubs')
          .select('id, title, file_path')
          .eq('id', params.id)
          .single();

        if (fetchError) throw fetchError;
        if (!data) throw new Error('EPUB não encontrado');

        setEpub(data);
      } catch (err) {
        console.error('Error fetching EPUB:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar EPUB');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchEpub();
    }
  }, [params.id]);

  const handleClose = () => {
    router.push('/epubs');
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 transition-colors" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <div className="rounded-lg p-8 max-w-md w-full mx-4 transition-colors" style={{ backgroundColor: 'var(--card-bg)' }}>
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 mb-4" style={{ borderColor: 'var(--blue-light)' }}></div>
            <p className="text-lg font-semibold transition-colors" style={{ color: 'var(--foreground)' }}>Carregando EPUB...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !epub) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 transition-colors" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <div className="rounded-lg p-8 max-w-md w-full mx-4 transition-colors" style={{ backgroundColor: 'var(--card-bg)' }}>
          <div className="text-center">
            <p className="text-2xl mb-4">⚠️</p>
            <p className="text-lg font-semibold mb-2 transition-colors" style={{ color: 'var(--foreground)' }}>Erro ao carregar EPUB</p>
            <p className="text-sm mb-4 transition-colors" style={{ color: 'var(--red-light)' }}>{error || 'EPUB não encontrado'}</p>
            <button
              onClick={handleClose}
              className="px-6 py-2 rounded-lg font-semibold transition-colors"
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
              Voltar para lista
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <EpubReader
      epubId={epub.id}
      filePath={epub.file_path}
      title={epub.title}
      onClose={handleClose}
    />
  );
}
