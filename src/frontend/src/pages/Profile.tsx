import { useTranslation } from 'react-i18next';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/Card';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';

export default function Profile() {
  const { t } = useTranslation('common');
  const { user, logout } = useAuth();

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('profile.title', 'Profile')}</h1>
          <Button variant="ghost" onClick={logout} className="text-red-600 hover:text-red-700 hover:bg-red-50">
            {t('auth.logout', 'Logout')}
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User Info Card */}
          <div className="md:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">{t('profile.personalInfo', 'Personal Information')}</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="h-20 w-20 rounded-full bg-german-gold/20 flex items-center justify-center text-3xl font-bold text-german-black mr-6">
                    {user?.profile?.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-medium">{user?.profile?.display_name || t('common.user', 'User')}</h3>
                    <p className="text-gray-500">{user?.email}</p>
                    {user?.is_verified && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
                        Verified
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="border-t pt-4 mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">{t('profile.nativeLanguage', 'Native Language')}</label>
                    <p className="mt-1 font-medium">{user?.profile?.native_language === 'zh' ? 'Chinese' : 'English'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">{t('profile.preferredLevel', 'German Level')}</label>
                    <p className="mt-1 font-medium">{user?.profile?.german_level}</p>
                  </div>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 border-l-4 border-l-red-500">
              <h2 className="text-lg font-semibold mb-2 text-red-600">{t('profile.dangerZone', 'Danger Zone')}</h2>
              <p className="text-gray-600 mb-4 text-sm">{t('profile.deleteAccountDesc', 'Permanently delete your account and all data.')}</p>
              <Button variant="secondary" className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300">
                {t('profile.deleteAccount', 'Delete Account')}
              </Button>
            </Card>
          </div>

          {/* Stats Summary */}
          <div className="md:col-span-1">
            <Card className="p-6 h-full">
              <h2 className="text-lg font-semibold mb-4">{t('dashboard.title', 'Stats')}</h2>
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-500">{t('dashboard.totalSessions', 'Total Sessions')}</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('dashboard.totalMinutes', 'Total Minutes')}</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
