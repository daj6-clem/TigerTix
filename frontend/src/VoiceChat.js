import React, { useState, useEffect, useCallback } from 'react';

const VoiceChat = ({ onSpeechResult, onError }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onSpeechResult(transcript);
        setIsListening(false);
      };

      recognitionInstance.onerror = (event) => {
        onError(event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [onSpeechResult, onError]);

  const startListening = useCallback(() => {
    if (recognition) {
      // Play beep sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      gainNode.gain.value = 0.1;
      
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        // Start recognition after beep
        recognition.start();
        setIsListening(true);
      }, 200);
    }
  }, [recognition]);

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition, isListening]);

  return (
    <div className="voice-chat-controls" role="region" aria-label="Voice controls">
      <button
        onClick={isListening ? stopListening : startListening}
        aria-pressed={isListening}
        aria-label={isListening ? "Stop listening" : "Start voice input"}
        className={`voice-button ${isListening ? 'listening' : ''}`}
      >
        <span className="sr-only">
          {isListening ? 'Stop listening' : 'Start voice input'}
        </span>
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      </button>
      {isListening && (
        <div className="listening-indicator" role="status" aria-live="polite">
          Listening...
        </div>
      )}
    </div>
  );
};

export default VoiceChat;