import { useEffect, useCallback } from 'react';

const useTextToSpeech = () => {
  useEffect(() => {
    // Initialize speech synthesis if needed
    if ('speechSynthesis' in window) {
      // Load voices when they are available
      speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  const speak = useCallback((text, options = {}) => {
    if (!('speechSynthesis' in window)) {
      console.error('Text-to-speech not supported in this browser');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set default values for better clarity and pacing
    utterance.rate = options.rate || 0.9; // Slightly slower than default
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 1.0;

    // Try to find an English voice
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(voice => 
      voice.lang.startsWith('en-') && voice.localService
    );
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    // Add event handlers
    utterance.onstart = () => {
      if (options.onStart) options.onStart();
    };

    utterance.onend = () => {
      if (options.onEnd) options.onEnd();
    };

    utterance.onerror = (error) => {
      console.error('Speech synthesis error:', error);
      if (options.onError) options.onError(error);
    };

    // Break text into smaller chunks for better pacing
    const sentences = text.split(/[.!?]+/).filter(Boolean);
    sentences.forEach((sentence, index) => {
      const utterance = new SpeechSynthesisUtterance(sentence + '.');
      utterance.rate = options.rate || 0.9;
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 1.0;
      if (englishVoice) utterance.voice = englishVoice;
      
      // Add a small delay between sentences
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, index * 100);
    });
  }, []);

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  return { speak, stop };
};

export default useTextToSpeech;