import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';

export interface SavedText {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

// Clean markdown and special characters from text
const cleanText = (text: string): string => {
  let cleaned = text
    // Replace em-dash with period and space
    .replaceAll('—', ' . ')
    // Remove horizontal rules (---, ***, ___)
    .replaceAll(/^[\s]*(---|\*\*\*|___)[\s]*$/gm, '')
    // Remove markdown bold
    .replaceAll(/\*\*(.+?)\*\*/g, '$1')
    .replaceAll(/__(.+?)__/g, '$1')
    // Remove markdown italic
    .replaceAll(/\*(.+?)\*/g, '$1')
    .replaceAll(/_(.+?)_/g, '$1')
    // Remove markdown links [text](url) -> text
    .replaceAll(/\[(.+?)\]\(.+?\)/g, '$1')
    // Remove markdown headers
    .replaceAll(/^#{1,6}\s+/gm, '')
    // Remove markdown code blocks
    .replaceAll(/```[\s\S]*?```/g, '')
    // Remove inline code
    .replaceAll(/`(.+?)`/g, '$1')
    // Clean up extra spaces but preserve line breaks and paragraph breaks
    .split('\n')
    .map(line => line.replaceAll(/\s+/g, ' ').trim())
    .join('\n')
    .trim();

  return cleaned;
};

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
  const saveText = useCallback(async (title: string, content: string): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);

      const cleanedContent = cleanText(content);

      const { data, error: insertError } = await supabase
        .from('saved_texts')
        .insert([{ title, content: cleanedContent }])
        .select('id')
        .single();

      if (insertError) throw insertError;

      // Refresh the list
      await fetchTexts();
      return data?.id || null;
    } catch (err) {
      console.error('Error saving text:', err);
      setError(err instanceof Error ? err.message : 'Failed to save text');
      return null;
    } finally {
      setLoading(false);
    }
  }, [supabase, fetchTexts]);

  // Update an existing text
  const updateText = useCallback(async (id: string, title: string, content: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const cleanedContent = cleanText(content);

      const { error: updateError } = await supabase
        .from('saved_texts')
        .update({ title, content: cleanedContent, updated_at: new Date().toISOString() })
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

  // Delete all texts
  const deleteAllTexts = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from('saved_texts')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

      if (deleteError) throw deleteError;

      // Refresh the list
      await fetchTexts();
      return true;
    } catch (err) {
      console.error('Error deleting all texts:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete all texts');
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
    deleteAllTexts,
    refreshTexts: fetchTexts,
  };
}
