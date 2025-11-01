import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import ePub, { Book } from 'epubjs';

export interface EpubPage {
  pageNumber: number;
  content: string;
  totalPages: number;
}

const CHARS_PER_PAGE = 2000; // Aproximadamente 2000 caracteres por página

export interface ReadingProgress {
  epub_id: string;
  current_page: number;
  current_sentence: number;
  total_pages: number;
  last_read_at: string;
}

export function useEpubReader() {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pages, setPages] = useState<string[]>([]);
  const [bookTitle, setBookTitle] = useState('');
  const [totalCharacters, setTotalCharacters] = useState(0);
  const [epubId, setEpubId] = useState<string>('');
  const [savedProgress, setSavedProgress] = useState<ReadingProgress | null>(null);
  const supabase = createClient();

  // Calculate progress percentage
  const progressPercentage = pages.length > 0
    ? Math.round(((currentPage + 1) / pages.length) * 100)
    : 0;

  // Load saved progress from database
  const loadProgress = useCallback(async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('epub_reading_progress')
        .select('*')
        .eq('epub_id', id)
        .single();

      if (error) {
        // No progress saved yet
        return null;
      }

      return data as ReadingProgress;
    } catch (err) {
      console.warn('Error loading progress:', err);
      return null;
    }
  }, [supabase]);

  // Load EPUB from Supabase storage
  const loadEpub = useCallback(async (filePath: string, title: string, id: string) => {
    try {
      setLoading(true);
      setError(null);
      setBookTitle(title);
      setEpubId(id);
      setCurrentPage(0);

      // Download EPUB file from Supabase
      const { data, error: downloadError } = await supabase.storage
        .from('epubs')
        .download(filePath);

      if (downloadError) throw downloadError;

      // Convert Blob to ArrayBuffer
      const arrayBuffer = await data.arrayBuffer();

      // Load EPUB
      const epubBook = ePub(arrayBuffer);
      setBook(epubBook);

      // Extract all text content
      await epubBook.ready;

      const spine = await epubBook.loaded.spine;
      const allTexts: string[] = [];

      // Process each section
      if (spine.items && spine.items.length > 0) {
        for (const item of spine.items) {
          try {
            const section = epubBook.spine.get(item.href);
            if (section) {
              const doc = await section.load(epubBook.load.bind(epubBook));

              // Extract text from the document
              let text = '';

              if (doc) {
                // Try different approaches to get content
                if (doc.body) {
                  text = doc.body.textContent || doc.body.innerText || '';
                } else if (doc.documentElement) {
                  text = doc.documentElement.textContent || doc.documentElement.innerText || '';
                } else if (typeof doc === 'object' && doc.innerHTML) {
                  text = doc.textContent || doc.innerText || '';
                } else {
                  // Last resort: serialize and parse
                  const serializer = new XMLSerializer();
                  const xmlString = serializer.serializeToString(doc);
                  const parser = new DOMParser();
                  const parsedDoc = parser.parseFromString(xmlString, 'text/html');
                  text = parsedDoc.body?.textContent || parsedDoc.documentElement?.textContent || '';
                }
              }

              if (text.trim()) {
                allTexts.push(text.trim());
              }
            }
          } catch (err) {
            console.warn('Error loading section:', err);
          }
        }
      }

      // Combine all texts
      const fullText = allTexts.join('\n\n');
      setTotalCharacters(fullText.length);

      // Split into pages
      const paginatedPages = paginateText(fullText, CHARS_PER_PAGE);
      setPages(paginatedPages);

      // Load saved progress
      const progress = await loadProgress(id);
      if (progress && progress.current_page < paginatedPages.length) {
        setCurrentPage(progress.current_page);
        setSavedProgress(progress);
      }

      return true;
    } catch (err) {
      console.error('Error loading EPUB:', err);
      setError(err instanceof Error ? err.message : 'Failed to load EPUB');
      return false;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Helper function to extract text from DOM nodes
  const extractTextFromNode = (node: Node): string => {
    let text = '';

    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || '';
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;

      // Skip script and style tags
      if (element.tagName === 'SCRIPT' || element.tagName === 'STYLE') {
        return '';
      }

      // Add line breaks for block elements
      const blockElements = ['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'BR'];

      for (const child of Array.from(node.childNodes)) {
        text += extractTextFromNode(child);
      }

      if (blockElements.includes(element.tagName)) {
        text += '\n';
      }
    }

    return text;
  };

  // Paginate text into chunks
  const paginateText = (text: string, charsPerPage: number): string[] => {
    const pages: string[] = [];
    const paragraphs = text.split(/\n+/);
    let currentPage = '';

    for (const paragraph of paragraphs) {
      const trimmedParagraph = paragraph.trim();
      if (!trimmedParagraph) continue;

      // If adding this paragraph would exceed the page limit
      if (currentPage.length + trimmedParagraph.length + 2 > charsPerPage && currentPage.length > 0) {
        pages.push(currentPage.trim());
        currentPage = trimmedParagraph + '\n\n';
      } else {
        currentPage += trimmedParagraph + '\n\n';
      }
    }

    // Add the last page if there's content
    if (currentPage.trim()) {
      pages.push(currentPage.trim());
    }

    return pages.length > 0 ? pages : [''];
  };

  // Navigation functions
  const nextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, pages.length - 1));
  }, [pages.length]);

  const previousPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToPage = useCallback((pageNumber: number) => {
    if (pageNumber >= 0 && pageNumber < pages.length) {
      setCurrentPage(pageNumber);
    }
  }, [pages.length]);

  // Save reading progress to database
  const saveProgress = useCallback(async (page: number, sentence: number) => {
    if (!epubId || pages.length === 0) return false;

    try {
      const progressData = {
        epub_id: epubId,
        current_page: page,
        current_sentence: sentence,
        total_pages: pages.length,
        last_read_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('epub_reading_progress')
        .upsert(progressData, {
          onConflict: 'epub_id',
        })
        .select()
        .single();

      if (error) throw error;

      setSavedProgress(data as ReadingProgress);
      return true;
    } catch (err) {
      console.error('Error saving progress:', err);
      return false;
    }
  }, [epubId, pages.length, supabase]);

  // Reset reader
  const reset = useCallback(() => {
    setBook(null);
    setPages([]);
    setCurrentPage(0);
    setBookTitle('');
    setTotalCharacters(0);
    setEpubId('');
    setSavedProgress(null);
    setError(null);
  }, []);

  // Get current page content
  const getCurrentPageContent = useCallback(() => {
    return pages[currentPage] || '';
  }, [pages, currentPage]);

  return {
    loading,
    error,
    currentPage,
    totalPages: pages.length,
    bookTitle,
    progressPercentage,
    totalCharacters,
    currentPageContent: pages[currentPage] || '',
    savedProgress,
    loadEpub,
    nextPage,
    previousPage,
    goToPage,
    reset,
    getCurrentPageContent,
    saveProgress,
    hasNextPage: currentPage < pages.length - 1,
    hasPreviousPage: currentPage > 0,
  };
}
