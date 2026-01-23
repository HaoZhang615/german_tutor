import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store';
import type { TutorVoice } from '../../store/types';

const VOICES: TutorVoice[] = ['alloy', 'ash', 'ballad', 'coral', 'echo', 'sage', 'shimmer', 'verse'];

const getApiUrl = async (): Promise<string> => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  try {
    const response = await fetch('/config.json');
    if (response.ok) {
      const config = await response.json();
      return config.apiUrl || 'http://localhost:8000';
    }
  } catch {
  }
  return 'http://localhost:8000';
};

export const VoiceSelector: React.FC = () => {
  const { t } = useTranslation('tutor');
  const { tutorVoice, setTutorVoice } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [loadingVoice, setLoadingVoice] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handlePreview = async (e: React.MouseEvent, voice: string) => {
    e.stopPropagation();

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (playingVoice === voice) {
      setPlayingVoice(null);
      return;
    }

    setLoadingVoice(voice);
    setPlayingVoice(null);

    try {
      const apiUrl = await getApiUrl();
      const response = await fetch(`${apiUrl}/api/tts/preview?voice=${voice}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch audio');
      }

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        setPlayingVoice(null);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };
      
      audio.onerror = () => {
        setPlayingVoice(null);
        setLoadingVoice(null);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };

      setLoadingVoice(null);
      setPlayingVoice(voice);
      await audio.play();
    } catch (error) {
      console.error('Error playing voice preview:', error);
      setLoadingVoice(null);
      setPlayingVoice(null);
    }
  };

  const formatVoiceName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {t('voice.label', 'Tutor Voice')}
      </label>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            relative w-full bg-white border border-gray-200 text-gray-900 
            py-2.5 pl-3 pr-10 rounded-lg text-left
            focus:outline-none focus:ring-2 focus:ring-german-gold focus:border-transparent
            transition-shadow duration-200 cursor-pointer
            ${isOpen ? 'ring-2 ring-german-gold border-transparent' : ''}
          `}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className="block truncate">
            {formatVoiceName(tutorVoice)}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </button>

        {isOpen && (
          <ul
            className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-lg py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
            role="listbox"
          >
            {VOICES.map((voice) => {
              const isSelected = tutorVoice === voice;
              const isPlaying = playingVoice === voice;
              const isLoading = loadingVoice === voice;

              return (
                <li
                  key={voice}
                  className={`
                    relative cursor-pointer select-none py-2 pl-3 pr-9
                    hover:bg-amber-50 transition-colors duration-150
                    ${isSelected ? 'bg-amber-50 text-german-gold font-medium' : 'text-gray-900'}
                  `}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    setTutorVoice(voice);
                    setIsOpen(false);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className={`block truncate ${isSelected ? 'font-medium' : 'font-normal'}`}>
                      {formatVoiceName(voice)}
                    </span>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={(e) => handlePreview(e, voice)}
                        disabled={isLoading}
                        className={`
                          p-1.5 rounded-full transition-all duration-200
                          hover:bg-german-gold hover:text-white
                          focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-german-gold
                          disabled:opacity-50 disabled:cursor-not-allowed
                          ${isPlaying || isLoading ? 'text-german-gold bg-amber-100' : 'text-gray-400'}
                        `}
                        title={t('voice.preview', 'Preview Voice')}
                      >
                        {isLoading ? (
                          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        ) : isPlaying ? (
                          <span className="flex items-center justify-center w-4 h-4 gap-0.5">
                            <span className="block w-0.5 h-2 bg-current rounded-full animate-pulse" />
                            <span className="block w-0.5 h-3 bg-current rounded-full animate-pulse" />
                            <span className="block w-0.5 h-2 bg-current rounded-full animate-pulse" />
                          </span>
                        ) : (
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-german-gold pointer-events-none">
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};
