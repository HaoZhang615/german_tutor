import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store';
import type { UILanguage } from '../../store/types';

export const LanguageSwitcher: React.FC = () => {
  const { uiLanguage, setUILanguage } = useAppStore();
  const { i18n } = useTranslation();

  const handleLanguageChange = (lang: UILanguage) => {
    setUILanguage(lang);
    i18n.changeLanguage(lang);
  };

  const languages: { code: UILanguage; label: string; flag: React.ReactNode }[] = [
    {
      code: 'en',
      label: 'English',
      flag: (
        <svg viewBox="0 0 32 24" className="w-5 h-3.5 rounded-sm shadow-sm">
          <rect width="32" height="24" fill="#B22234" />
          <path d="M0,0H32V2.6H0ZM0,5.2H32V7.8H0ZM0,10.4H32V13H0ZM0,15.6H32V18.2H0ZM0,20.8H32V23.4H0Z" fill="white" />
          <rect width="14" height="13" fill="#3C3B6E" />
        </svg>
      )
    },
    {
      code: 'de',
      label: 'Deutsch',
      flag: (
        <svg viewBox="0 0 32 24" className="w-5 h-3.5 rounded-sm shadow-sm">
          <rect width="32" height="8" y="0" fill="#000000" />
          <rect width="32" height="8" y="8" fill="#DD0000" />
          <rect width="32" height="8" y="16" fill="#FFCC00" />
        </svg>
      )
    },
    {
      code: 'zh',
      label: '中文',
      flag: (
        <svg viewBox="0 0 32 24" className="w-5 h-3.5 rounded-sm shadow-sm">
          <rect width="32" height="24" fill="#DE2910" />
          <path d="M5,5l1,3l-2.5,-2h3l-2.5,2z M10,2l0.5,1.5l-1.2,-1h1.5l-1.2,1z M12,4l0.5,1.5l-1.2,-1h1.5l-1.2,1z M12,7l0.5,1.5l-1.2,-1h1.5l-1.2,1z M10,9l0.5,1.5l-1.2,-1h1.5l-1.2,1z" fill="#FFDE00" />
        </svg>
      )
    }
  ];

  return (
    <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleLanguageChange(lang.code)}
          className={`flex items-center px-2 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
            uiLanguage === lang.code
              ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5'
              : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'
          }`}
          title={lang.label}
        >
          {lang.flag}
          <span className="ml-2 hidden sm:inline">{lang.code.toUpperCase()}</span>
        </button>
      ))}
    </div>
  );
};
