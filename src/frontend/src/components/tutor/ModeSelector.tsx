import React from 'react';
import { useTranslation } from 'react-i18next';
import type { LearningMode } from '../../store/types';

interface ModeSelectorProps {
  value: LearningMode;
  onChange: (mode: LearningMode) => void;
  className?: string;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  value,
  onChange,
  className = '',
}) => {
  const { t } = useTranslation('common');
  
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${className}`}>
      <button
        type="button"
        onClick={() => onChange('teacher')}
        className={`
          relative p-5 rounded-xl border-2 text-left transition-all duration-200 flex flex-col gap-3 h-full group overflow-hidden
          ${value === 'teacher'
            ? 'border-german-gold bg-amber-50 shadow-lg shadow-german-gold/10 -translate-y-0.5'
            : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 hover:-translate-y-0.5'
          }
        `}
        aria-pressed={value === 'teacher'}
      >
        <div className={`
          p-2.5 rounded-lg w-fit transition-colors duration-200
          ${value === 'teacher' ? 'bg-german-gold text-german-black' : 'bg-gray-100 text-gray-500 group-hover:text-gray-700'}
        `}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        </div>
        <div>
          <h3 className={`font-bold text-lg mb-1 transition-colors ${value === 'teacher' ? 'text-gray-900' : 'text-gray-800'}`}>
            {t('mode.teacher')}
          </h3>
          <p className={`text-sm leading-relaxed ${value === 'teacher' ? 'text-gray-700' : 'text-gray-500'}`}>
            {t('mode.teacherDesc')}
          </p>
        </div>
        
        {value === 'teacher' && (
          <div className="absolute top-3 right-3">
            <svg className="w-5 h-5 text-german-gold" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </button>

      <button
        type="button"
        onClick={() => onChange('immersive')}
        className={`
          relative p-5 rounded-xl border-2 text-left transition-all duration-200 flex flex-col gap-3 h-full group overflow-hidden
          ${value === 'immersive'
            ? 'border-german-gold bg-amber-50 shadow-lg shadow-german-gold/10 -translate-y-0.5'
            : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 hover:-translate-y-0.5'
          }
        `}
        aria-pressed={value === 'immersive'}
      >
        <div className={`
          p-2.5 rounded-lg w-fit transition-colors duration-200
          ${value === 'immersive' ? 'bg-german-gold text-german-black' : 'bg-gray-100 text-gray-500 group-hover:text-gray-700'}
        `}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
            <line x1="9" y1="9" x2="9.01" y2="9"/>
            <line x1="15" y1="9" x2="15.01" y2="9"/>
          </svg>
        </div>
        <div>
          <h3 className={`font-bold text-lg mb-1 transition-colors ${value === 'immersive' ? 'text-gray-900' : 'text-gray-800'}`}>
            {t('mode.immersive')}
          </h3>
          <p className={`text-sm leading-relaxed ${value === 'immersive' ? 'text-gray-700' : 'text-gray-500'}`}>
            {t('mode.immersiveDesc')}
          </p>
        </div>

        {value === 'immersive' && (
          <div className="absolute top-3 right-3">
            <svg className="w-5 h-5 text-german-gold" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </button>
    </div>
  );
};
