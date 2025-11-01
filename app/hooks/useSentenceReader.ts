import { useState, useEffect, useRef, useCallback } from 'react';

interface ProgressData {
  text: string;
  currentSentenceIndex: number;
  characterPosition: number;
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

  // Split text into sentences
  const splitIntoSentences = (inputText: string): string[] => {
    if (!inputText.trim()) return [];

    // Split by common sentence delimiters while keeping the delimiter and whitespace
    const rawSentences = inputText.split(/([.!?]+(?:\s+|\n+))|([.!?]+$)/g);
    const processedSentences: string[] = [];

    for (let i = 0; i < rawSentences.length; i++) {
      const part = rawSentences[i];
      if (!part) continue;

      // If it's a delimiter with whitespace, add it to the previous sentence
      if (/^[.!?]+(?:\s+|\n+)$/.test(part) && processedSentences.length > 0) {
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

    return processedSentences.filter(s => s.trim().length > 0);
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

  // Load voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);

      // Prioritize en-US voices
      const enUSVoice = availableVoices.find(voice => voice.lang.startsWith('en-US'));
      if (enUSVoice) {
        setSelectedVoice(enUSVoice.name);
      } else {
        // Fallback to any English voice
        const enVoice = availableVoices.find(voice => voice.lang.startsWith('en'));
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

    // Only cancel if something is actually speaking
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(sentences[index]);
    const voice = voices.find(v => v.name === selectedVoice);
    if (voice) {
      utterance.voice = voice;
      // Required for Android Chrome to properly change voice
      utterance.lang = voice.lang;
      utterance.voiceURI = voice.voiceURI;
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

  return {
    text,
    setText,
    sentences,
    currentSentenceIndex,
    isPlaying,
    isPaused,
    voices,
    selectedVoice,
    setSelectedVoice,
    rate,
    setRate,
    pitch,
    setPitch,
    volume,
    setVolume,
    handlePlay,
    handlePause,
    handleStop,
    handleReset,
    setCurrentSentence,
    previousSentence,
    nextSentence,
  };
}
