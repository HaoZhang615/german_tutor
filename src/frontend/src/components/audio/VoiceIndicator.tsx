import React from 'react';
import { useTranslation } from 'react-i18next';
import type { SessionStatus } from '../../store/types';

interface VoiceIndicatorProps {
  status: SessionStatus;
}

export const VoiceIndicator: React.FC<VoiceIndicatorProps> = ({ status }) => {
  const { t } = useTranslation('tutor');

  const getStatusConfig = () => {
    switch (status) {
      case 'listening':
        return {
          text: t('status.listening', 'Listening...'),
          color: 'text-german-red',
          icon: (
            <span className="relative flex h-3 w-3 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-german-red opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-german-red"></span>
            </span>
          )
        };
      case 'speaking':
        return {
          text: t('status.speaking', 'Speaking...'),
          color: 'text-german-gold',
          icon: (
            <svg className="w-4 h-4 mr-2 animate-bounce text-german-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )
        };
      case 'thinking':
        return {
          text: t('status.thinking', 'Thinking...'),
          color: 'text-gray-500',
          icon: (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )
        };
      default:
        return {
          text: t('status.ready', 'Ready'),
          color: 'text-gray-400',
          icon: <div className="w-2 h-2 rounded-full bg-gray-400 mr-2" />
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`flex items-center justify-center text-sm font-medium ${config.color} transition-colors duration-300`}>
      {config.icon}
      {config.text}
    </div>
  );
};
