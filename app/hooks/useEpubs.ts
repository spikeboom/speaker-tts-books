import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';

export interface Epub {
  id: string;
  title: string;
  file_name: string;
  file_path: string;
  file_size: number;
  uploaded_at: string;
}

export function useEpubs() {
  const [epubs, setEpubs] = useState<Epub[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const supabase = createClient();

  // Fetch all EPUBs
  const fetchEpubs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('epubs')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (fetchError) throw fetchError;

      setEpubs(data || []);
    } catch (err) {
      console.error('Error fetching EPUBs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch EPUBs');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Load EPUBs on mount
  useEffect(() => {
    fetchEpubs();
  }, [fetchEpubs]);

  // Upload EPUB file
  const uploadEpub = useCallback(async (file: File, title: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      setUploadProgress(0);

      // Validate file type
      if (!file.type.includes('epub') && !file.name.endsWith('.epub')) {
        throw new Error('Por favor, selecione um arquivo EPUB válido');
      }

      // Validate file size (50MB limit)
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        throw new Error('Arquivo muito grande. Tamanho máximo: 50MB');
      }

      // Generate unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase Storage
      setUploadProgress(30);
      const { error: uploadError } = await supabase.storage
        .from('epubs')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      setUploadProgress(60);

      // Save metadata to database
      const { error: insertError } = await supabase
        .from('epubs')
        .insert([{
          title,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
        }]);

      if (insertError) {
        // If database insert fails, delete the uploaded file
        await supabase.storage.from('epubs').remove([filePath]);
        throw insertError;
      }

      setUploadProgress(100);

      // Refresh the list
      await fetchEpubs();
      return true;
    } catch (err) {
      console.error('Error uploading EPUB:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload EPUB');
      return false;
    } finally {
      setLoading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, [supabase, fetchEpubs]);

  // Download EPUB file
  const downloadEpub = useCallback(async (epub: Epub): Promise<void> => {
    try {
      setError(null);

      const { data, error: downloadError } = await supabase.storage
        .from('epubs')
        .download(epub.file_path);

      if (downloadError) throw downloadError;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = epub.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading EPUB:', err);
      setError(err instanceof Error ? err.message : 'Failed to download EPUB');
    }
  }, [supabase]);

  // Delete EPUB
  const deleteEpub = useCallback(async (id: string, filePath: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('epubs')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: deleteError } = await supabase
        .from('epubs')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Refresh the list
      await fetchEpubs();
      return true;
    } catch (err) {
      console.error('Error deleting EPUB:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete EPUB');
      return false;
    } finally {
      setLoading(false);
    }
  }, [supabase, fetchEpubs]);

  return {
    epubs,
    loading,
    error,
    uploadProgress,
    uploadEpub,
    downloadEpub,
    deleteEpub,
    refreshEpubs: fetchEpubs,
  };
}
