import { useTranslation } from 'react-i18next';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/Card';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';

export default function Dashboard() {
  const { t } = useTranslation('common');
  const { user } = useAuth();

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t('auth.welcomeBack', 'Welcome back')}, {user?.profile?.display_name || user?.email?.split('@')[0]}
            </h1>
            <p className="text-gray-600 mt-1">
              {t('home.subtitle', 'Ready to practice your German?')}
            </p>
          </div>
          <Link to="/tutor">
            <Button className="px-8 py-3 text-lg shadow-lg bg-german-gold hover:bg-amber-400 text-german-black font-bold transform transition-transform hover:scale-105">
              {t('home.start', 'Start Learning')}
            </Button>
          </Link>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 border-l-4 border-l-german-gold hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">{t('dashboard.totalSessions', 'Total Sessions')}</h3>
                <p className="text-4xl font-bold mt-2 text-gray-900">0</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center text-german-gold">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 border-l-4 border-l-german-red hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">{t('dashboard.totalMinutes', 'Total Minutes')}</h3>
                <p className="text-4xl font-bold mt-2 text-gray-900">0</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-german-red">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 border-l-4 border-l-black hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">{t('dashboard.currentStreak', 'Current Streak')}</h3>
                <p className="text-4xl font-bold mt-2 text-gray-900">0 <span className="text-lg font-normal text-gray-500">{t('dashboard.days', 'days')}</span></p>
              </div>
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-800">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="h-full">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">{t('dashboard.recentActivity', 'Recent Activity')}</h2>
                <Link to="/history" className="text-sm font-medium text-german-gold hover:text-amber-600">
                  {t('nav.history', 'View History')}
                </Link>
              </div>
              <div className="p-12 text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 mb-4">
                  <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">{t('history.empty', 'No conversations yet')}</h3>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">{t('history.emptyDesc', 'Start a new session to practice your German skills.')}</p>
                <Link to="/tutor">
                  <Button variant="secondary">{t('home.start', 'Start Learning')}</Button>
                </Link>
              </div>
            </Card>
          </div>
          
          {/* Level Progress */}
          <div className="lg:col-span-1">
            <Card className="h-full p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">{t('dashboard.levelProgress', 'Level Progress')}</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">A1</span>
                  <span className="text-sm text-gray-500">Beginner</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-german-gold h-2.5 rounded-full" style={{ width: '10%' }}></div>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <span className="font-medium text-gray-700">A2</span>
                  <span className="text-sm text-gray-500">Elementary</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-gray-300 h-2.5 rounded-full" style={{ width: '0%' }}></div>
                </div>

                <div className="pt-8 text-center">
                  <p className="text-sm text-gray-500 mb-4">{t('dashboard.noMilestones', 'Keep practicing to unlock milestones!')}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
