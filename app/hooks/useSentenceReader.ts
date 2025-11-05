import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';

interface ProgressData {
  text: string;
  currentSentenceIndex: number;
  characterPosition: number;
}

interface PreferencesData {
  rate: number;
  pitch: number;
  volume: number;
  selectedVoice: string;
}

export function useSentenceReader() {
  const [text, setText] = useState('');
  const [sentences, setSentences] = useState<string[]>([]);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const characterPositionRef = useRef(0);
  const isPausingRef = useRef(false);
  const supabase = createClient();

  // Split text into sentences
  const splitIntoSentences = (inputText: string): string[] => {
    if (!inputText.trim()) return [];

    // Split by common sentence delimiters while keeping the delimiter and whitespace
    // Pattern handles: period/exclamation/question followed by space/newline, double newlines, or at end of text
    const rawSentences = inputText.split(/(\n\n+)|([.!?]+(?:\s+|\n))|([.!?]+$)/g);
    const processedSentences: string[] = [];

    console.log('=== RAW SPLIT RESULT ===');
    rawSentences.slice(0, 10).forEach((part, i) => {
      console.log(`[Part ${i}]:`, JSON.stringify(part));
    });
    if (rawSentences.length > 10) {
      console.log(`... and ${rawSentences.length - 10} more parts`);
    }

    for (let i = 0; i < rawSentences.length; i++) {
      const part = rawSentences[i];
      if (!part) continue;

      // If it's a double newline (paragraph break), close the current sentence
      if (/^\n\n+$/.test(part)) {
        if (processedSentences.length > 0) {
          processedSentences[processedSentences.length - 1] += part;
        }
      }
      // If it's a delimiter with whitespace/newline, add it to the previous sentence and close it
      else if (/^[.!?]+(?:\s+|\n)$/.test(part) && processedSentences.length > 0) {
        processedSentences[processedSentences.length - 1] += part;
      }
      // If it's a delimiter at the end, add it to the previous sentence
      else if (/^[.!?]+$/.test(part) && processedSentences.length > 0) {
        processedSentences[processedSentences.length - 1] += part;
      }
      // Otherwise, it's a new sentence
      else if (part.trim()) {
        processedSentences.push(part);
      }
    }

    const filtered = processedSentences.filter(s => s.trim().length > 0);

    // Debug log: show each sentence with visible line breaks
    console.log('=== SENTENCE BREAKDOWN ===');
    filtered.forEach((sentence, index) => {
      console.log(`[Sentence ${index}]:`, JSON.stringify(sentence));
      console.log(`  Raw: ${sentence}`);
      console.log(`  Trimmed: "${sentence.trim()}"`);
      console.log(`  Has newline: ${sentence.includes('\n')}`);
      console.log('---');
    });
    console.log(`Total sentences: ${filtered.length}`);

    return filtered;
  };

  // Load progress from localStorage
  const loadProgress = useCallback(() => {
    try {
      const saved = localStorage.getItem('tts-reader-progress');
      if (saved) {
        const data: ProgressData = JSON.parse(saved);
        if (data.text === text && data.currentSentenceIndex >= 0) {
          setCurrentSentenceIndex(data.currentSentenceIndex);
          characterPositionRef.current = data.characterPosition || 0;
        }
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  }, [text]);

  // Save progress to localStorage
  const saveProgress = useCallback(() => {
    try {
      const data: ProgressData = {
        text,
        currentSentenceIndex,
        characterPosition: characterPositionRef.current,
      };
      localStorage.setItem('tts-reader-progress', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }, [text, currentSentenceIndex]);

  // Load preferences from Supabase
  const loadPreferences = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        return;
      }

      if (data) {
        setRate(Number(data.rate) || 1);
        setPitch(Number(data.pitch) || 1);
        setVolume(Number(data.volume) || 1);
        if (data.selected_voice) {
          setSelectedVoice(data.selected_voice);
        }
      }
    } catch (err) {
      console.error('Error loading preferences:', err);
    }
  }, [supabase]);

  // Save preferences to Supabase
  const savePreferences = useCallback(async (preferences: Partial<PreferencesData>) => {
    try {
      // Check if preferences exist
      const { data: existing, error: fetchError } = await supabase
        .from('user_preferences')
        .select('id')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const updateData = {
        rate: preferences.rate ?? rate,
        pitch: preferences.pitch ?? pitch,
        volume: preferences.volume ?? volume,
        selected_voice: preferences.selectedVoice ?? selectedVoice,
        updated_at: new Date().toISOString(),
      };

      if (existing && !fetchError) {
        // Update existing preferences
        await supabase
          .from('user_preferences')
          .update(updateData)
          .eq('id', existing.id)
          .select();
      } else {
        // Create new preferences
        await supabase
          .from('user_preferences')
          .insert([updateData])
          .select();
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }, [supabase, rate, pitch, volume, selectedVoice]);

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  // Load voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();

      setVoices(availableVoices);

      // Android uses underscore (en_US) instead of dash (en-US)
      // Prioritize en-US or en_US voices
      const enUSVoice = availableVoices.find(voice =>
        voice.lang.startsWith('en-US') || voice.lang.startsWith('en_US')
      );
      if (enUSVoice) {
        setSelectedVoice(enUSVoice.name);
      } else {
        // Fallback to any English voice
        const enVoice = availableVoices.find(voice =>
          voice.lang.startsWith('en-') || voice.lang.startsWith('en_')
        );
        if (enVoice) {
          setSelectedVoice(enVoice.name);
        } else if (availableVoices.length > 0) {
          setSelectedVoice(availableVoices[0].name);
        }
      }
    };

    loadVoices();

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Update sentences when text changes
  useEffect(() => {
    const newSentences = splitIntoSentences(text);
    setSentences(newSentences);

    // Try to load saved progress
    if (newSentences.length > 0) {
      loadProgress();
    } else {
      setCurrentSentenceIndex(0);
    }
  }, [text, loadProgress]);

  // Speak current sentence
  const speakSentence = useCallback((index: number) => {
    if (index >= sentences.length || index < 0) {
      setIsPlaying(false);
      setIsPaused(false);
      return;
    }

    // Detect Android
    const isAndroid = /Android/i.test(navigator.userAgent);

    // Always cancel before speaking to clear any cache
    window.speechSynthesis.cancel();

    // Add small delay on Android to ensure cancel completes
    const delay = isAndroid ? 100 : 0;

    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(sentences[index]);
      const voice = voices.find(v => v.name === selectedVoice);

      if (voice) {
        // Android uses underscore (en_US) but BCP 47 standard uses dash (en-US)
        // Normalize to dash format
        const normalizedLang = voice.lang.replace(/_/g, '-');

        if (isAndroid) {
          // On Android, DO NOT set voice property - it's ignored and may cause conflicts
          // Only set lang and voiceURI
          utterance.lang = normalizedLang;
          (utterance as any).voiceURI = voice.voiceURI;
        } else {
          // On iOS and desktop, set all properties
          utterance.voice = voice;
          utterance.lang = normalizedLang;
        }
      }

      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;

      utterance.onstart = () => {
        if (isPausingRef.current) return;
        setIsPlaying(true);
        setIsPaused(false);
        setCurrentSentenceIndex(index);
        characterPositionRef.current = 0;
      };

      utterance.onboundary = (event) => {
        if (isPausingRef.current) return;
        characterPositionRef.current = event.charIndex;
      };

      utterance.onend = () => {
        if (isPausingRef.current) {
          isPausingRef.current = false;
          return;
        }
        // Move to next sentence
        const nextIndex = index + 1;
        if (nextIndex < sentences.length) {
          setCurrentSentenceIndex(nextIndex);
          characterPositionRef.current = 0;
          saveProgress();
          // Add small delay to let browser finish processing previous utterance
          setTimeout(() => {
            speakSentence(nextIndex);
          }, 100);
        } else {
          setIsPlaying(false);
          setIsPaused(false);
          setCurrentSentenceIndex(0);
          characterPositionRef.current = 0;
          saveProgress();
        }
      };

      utterance.onerror = (event) => {
        if (isPausingRef.current) {
          isPausingRef.current = false;
          return;
        }
        console.error('Speech synthesis error:', event);
        setIsPlaying(false);
        setIsPaused(false);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }, delay);
  }, [sentences, voices, selectedVoice, rate, pitch, volume, saveProgress]);

  const handlePlay = useCallback(() => {
    if (!text.trim()) {
      alert('Por favor, digite algum texto para ler.');
      return;
    }

    if (sentences.length === 0) {
      alert('Nenhuma frase encontrada no texto.');
      return;
    }

    if (isPaused) {
      // When resuming from pause, always start from beginning of current sentence
      isPausingRef.current = false; // Clear the pausing flag
      setIsPaused(false);
      speakSentence(currentSentenceIndex);
      return;
    }

    // Start or restart from current sentence
    isPausingRef.current = false; // Clear the pausing flag
    speakSentence(currentSentenceIndex);
  }, [text, sentences, isPaused, currentSentenceIndex, speakSentence]);

  const handlePause = useCallback(() => {
    if (window.speechSynthesis.speaking || isPlaying) {
      // Set flag to prevent utterance events from changing state
      isPausingRef.current = true;

      // Cancel completely instead of pausing for more reliable behavior
      window.speechSynthesis.cancel();

      // Set states after cancel to ensure they persist
      setIsPaused(true);
      setIsPlaying(false);

      // Reset to beginning of current sentence
      characterPositionRef.current = 0;
      saveProgress();
    }
  }, [saveProgress, isPlaying]);

  const handleStop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    // Reset to beginning of current sentence when stopped
    characterPositionRef.current = 0;
    saveProgress();
  }, [saveProgress]);

  const handleReset = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentSentenceIndex(0);
    characterPositionRef.current = 0;
    localStorage.removeItem('tts-reader-progress');
  }, []);

  // Function to set sentence index (for loading saved position)
  const setCurrentSentence = useCallback((index: number) => {
    if (index >= 0 && index < sentences.length) {
      setCurrentSentenceIndex(index);
    }
  }, [sentences.length]);

  // Navigate to previous sentence
  const previousSentence = useCallback(() => {
    if (currentSentenceIndex > 0) {
      const newIndex = currentSentenceIndex - 1;
      setCurrentSentenceIndex(newIndex);

      // If playing, speak the new sentence
      if (isPlaying) {
        window.speechSynthesis.cancel();
        speakSentence(newIndex);
      }
      // If paused, just update the index (visual highlight will update)
      // If stopped, just update the index so Play will start from here
    }
  }, [currentSentenceIndex, isPlaying, speakSentence]);

  // Navigate to next sentence
  const nextSentence = useCallback(() => {
    if (currentSentenceIndex < sentences.length - 1) {
      const newIndex = currentSentenceIndex + 1;
      setCurrentSentenceIndex(newIndex);

      // If playing, speak the new sentence
      if (isPlaying) {
        window.speechSynthesis.cancel();
        speakSentence(newIndex);
      }
      // If paused, just update the index (visual highlight will update)
      // If stopped, just update the index so Play will start from here
    }
  }, [currentSentenceIndex, sentences.length, isPlaying, speakSentence]);

  // Wrapper functions that save to Supabase
  const handleSetRate = useCallback((newRate: number) => {
    setRate(newRate);
    savePreferences({ rate: newRate });
  }, [savePreferences]);

  const handleSetPitch = useCallback((newPitch: number) => {
    setPitch(newPitch);
    savePreferences({ pitch: newPitch });
  }, [savePreferences]);

  const handleSetVolume = useCallback((newVolume: number) => {
    setVolume(newVolume);
    savePreferences({ volume: newVolume });
  }, [savePreferences]);

  const handleSetSelectedVoice = useCallback((voiceName: string) => {
    setSelectedVoice(voiceName);
    savePreferences({ selectedVoice: voiceName });
  }, [savePreferences]);

  return {
    text,
    setText,
    sentences,
    currentSentenceIndex,
    isPlaying,
    isPaused,
    voices,
    selectedVoice,
    setSelectedVoice: handleSetSelectedVoice,
    rate,
    setRate: handleSetRate,
    pitch,
    setPitch: handleSetPitch,
    volume,
    setVolume: handleSetVolume,
    handlePlay,
    handlePause,
    handleStop,
    handleReset,
    setCurrentSentence,
    previousSentence,
    nextSentence,
  };
}
