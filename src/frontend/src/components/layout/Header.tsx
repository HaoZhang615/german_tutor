import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useAuth } from '../../hooks/useAuth';

export const Header = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowDropdown(false);
    navigate('/login');
  };

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
                <span className="font-bold text-gray-900 leading-tight">{t('app.name')}</span>
                <span className="text-xs text-gray-500 font-medium">{t('app.tagline')}</span>
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
            
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-german-gold rounded-full flex items-center justify-center">
                    <span className="text-german-black font-semibold text-sm">
                      {user.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showDropdown && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowDropdown(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.profile?.display_name || user.email}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setShowDropdown(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {t('nav.profile', 'Profile')}
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        {t('auth.logout', 'Log out')}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-1.5 text-sm font-medium text-german-black bg-german-gold hover:bg-amber-400 rounded-lg transition-colors"
              >
                {t('auth.signIn', 'Sign in')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
