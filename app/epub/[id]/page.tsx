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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mb-4"></div>
            <p className="text-lg font-semibold text-gray-800">Carregando EPUB...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !epub) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <p className="text-2xl mb-4">⚠️</p>
            <p className="text-lg font-semibold text-gray-800 mb-2">Erro ao carregar EPUB</p>
            <p className="text-sm text-red-600 mb-4">{error || 'EPUB não encontrado'}</p>
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold"
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
