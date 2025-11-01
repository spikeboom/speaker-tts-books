import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';

export interface SavedText {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export function useTexts() {
  const [texts, setTexts] = useState<SavedText[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  // Fetch all saved texts
  const fetchTexts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('saved_texts')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setTexts(data || []);
    } catch (err) {
      console.error('Error fetching texts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch texts');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Load texts on mount
  useEffect(() => {
    fetchTexts();
  }, [fetchTexts]);

  // Save a new text
  const saveText = useCallback(async (title: string, content: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { error: insertError } = await supabase
        .from('saved_texts')
        .insert([{ title, content }]);

      if (insertError) throw insertError;

      // Refresh the list
      await fetchTexts();
      return true;
    } catch (err) {
      console.error('Error saving text:', err);
      setError(err instanceof Error ? err.message : 'Failed to save text');
      return false;
    } finally {
      setLoading(false);
    }
  }, [supabase, fetchTexts]);

  // Update an existing text
  const updateText = useCallback(async (id: string, title: string, content: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('saved_texts')
        .update({ title, content, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (updateError) throw updateError;

      // Refresh the list
      await fetchTexts();
      return true;
    } catch (err) {
      console.error('Error updating text:', err);
      setError(err instanceof Error ? err.message : 'Failed to update text');
      return false;
    } finally {
      setLoading(false);
    }
  }, [supabase, fetchTexts]);

  // Delete a text
  const deleteText = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from('saved_texts')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Refresh the list
      await fetchTexts();
      return true;
    } catch (err) {
      console.error('Error deleting text:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete text');
      return false;
    } finally {
      setLoading(false);
    }
  }, [supabase, fetchTexts]);

  return {
    texts,
    loading,
    error,
    saveText,
    updateText,
    deleteText,
    refreshTexts: fetchTexts,
  };
}
