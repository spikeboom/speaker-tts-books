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

  // Split text into sentences
  const splitIntoSentences = (inputText: string): string[] => {
    if (!inputText.trim()) return [];

    // Split by common sentence delimiters while keeping the delimiter
    const rawSentences = inputText.split(/([.!?]+\s+|[.!?]+$)/g);
    const processedSentences: string[] = [];

    for (let i = 0; i < rawSentences.length; i += 2) {
      const sentence = rawSentences[i];
      const delimiter = rawSentences[i + 1] || '';
      const combined = (sentence + delimiter).trim();
      if (combined) {
        processedSentences.push(combined);
      }
    }

    return processedSentences.filter(s => s.length > 0);
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

      const ptVoice = availableVoices.find(voice => voice.lang.startsWith('pt'));
      if (ptVoice) {
        setSelectedVoice(ptVoice.name);
      } else if (availableVoices.length > 0) {
        setSelectedVoice(availableVoices[0].name);
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

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(sentences[index]);
    const voice = voices.find(v => v.name === selectedVoice);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      setCurrentSentenceIndex(index);
      characterPositionRef.current = 0;
    };

    utterance.onboundary = (event) => {
      characterPositionRef.current = event.charIndex;
    };

    utterance.onend = () => {
      // Move to next sentence
      const nextIndex = index + 1;
      if (nextIndex < sentences.length) {
        setCurrentSentenceIndex(nextIndex);
        characterPositionRef.current = 0;
        saveProgress();
        speakSentence(nextIndex);
      } else {
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentSentenceIndex(0);
        characterPositionRef.current = 0;
        saveProgress();
      }
    };

    utterance.onerror = (event) => {
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
      // Resume from pause
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    // Start or restart from current sentence
    speakSentence(currentSentenceIndex);
  }, [text, sentences, isPaused, currentSentenceIndex, speakSentence]);

  const handlePause = useCallback(() => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
      saveProgress();
    }
  }, [saveProgress]);

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
  };
}
