import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Link } from 'react-router-dom';

export const Header = () => {
  const { t } = useTranslation('common');

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-german-gold rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
                <span className="text-german-black font-bold text-lg">D</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-gray-900 leading-tight">German Tutor</span>
                <span className="text-xs text-gray-500 font-medium">AI Learning</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/history"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              {t('nav.history', 'History')}
            </Link>
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
};
