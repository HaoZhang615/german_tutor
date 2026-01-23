import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/layout/Layout';
import { LevelSelector } from '../components/tutor/LevelSelector';
import { VoiceSelector } from '../components/tutor/VoiceSelector';
import { Button } from '../components/ui/Button';

export default function Home() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/tutor');
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-12">
        <div className="text-center space-y-6 max-w-2xl mx-auto animate-fade-in-up">
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-gray-900">
            <span className="block mb-2">German Tutor</span>
            <span className="text-german-gold">AI Learning</span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed max-w-lg mx-auto">
            {t('home.subtitle', 'Master German with an intelligent AI tutor. Real-time voice conversations adapted to your level.')}
          </p>
        </div>

        <div className="w-full max-w-5xl space-y-8 animate-fade-in-up delay-200">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {t('home.selectLevel', 'Select your proficiency level')}
            </h2>
          </div>
          
          <LevelSelector />

          <div className="flex items-center justify-between px-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {t('home.selectVoice', 'Select tutor voice')}
            </h2>
          </div>

          <VoiceSelector />
          
          <div className="flex justify-center pt-8">
            <Button 
              size="lg" 
              onClick={handleStart}
              className="text-xl px-12 py-4 shadow-lg hover:shadow-xl transform transition-transform hover:-translate-y-1"
            >
              {t('home.start', 'Start Learning')}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
