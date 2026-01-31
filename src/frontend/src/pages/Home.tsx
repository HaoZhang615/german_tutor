import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState, useMemo } from 'react';
import { Layout } from '../components/layout/Layout';
import { LevelSelector } from '../components/tutor/LevelSelector';
import { VoiceSelector } from '../components/tutor/VoiceSelector';
import { ScenarioCard } from '../components/tutor/ScenarioCard';
import { ModeSelector } from '../components/tutor/ModeSelector';
import { CreateScenarioModal } from '../components/tutor/CreateScenarioModal';
import { Button } from '../components/ui/Button';
import { scenarios } from '../data/scenarios';
import { useAppStore } from '../store';
import type { Scenario } from '../store/types';

export default function Home() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const [showAllScenarios, setShowAllScenarios] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [customScenarios, setCustomScenarios] = useState<Scenario[]>([]);
  
  const { 
    germanLevel,
    learningMode, 
    setLearningMode,
    selectedScenarioId,
    setSelectedScenarioId,
    clearMessages,
  } = useAppStore();

  const filteredScenarios = useMemo(() => {
    const allScenarios = [...scenarios, ...customScenarios];
    return allScenarios.filter(s => s.suggestedLevel === germanLevel);
  }, [germanLevel, customScenarios]);

  const displayedScenarios = showAllScenarios 
    ? filteredScenarios 
    : filteredScenarios.slice(0, 6);

  const handleStart = () => {
    clearMessages();
    navigate('/tutor');
  };

  const allScenarios = [...scenarios, ...customScenarios];
  const selectedScenario = allScenarios.find(s => s.id === selectedScenarioId);

  const handleScenarioCreated = (scenario: Scenario) => {
    setCustomScenarios(prev => [...prev, scenario]);
    setSelectedScenarioId(scenario.id);
  };

  return (
    <Layout>
      <div className="min-h-[80vh] py-8">
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 mb-4">
            <span className="block">{t('app.name')}</span>
            <span className="text-german-gold">{t('app.tagline')}</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            {t('home.subtitle', 'Master German with an intelligent AI tutor. Real-time voice conversations adapted to your level.')}
          </p>
        </div>

        <div className="max-w-6xl mx-auto space-y-12">
          <section className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {t('home.selectLevel', 'Select your proficiency level')}
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  {t('home.levelHelp')}
                </p>
              </div>
            </div>
            <LevelSelector />
          </section>

          <section className="animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {t('home.chooseLearningMode')}
              </h2>
              <p className="text-gray-500 text-sm">
                {t('home.modeHelp')}
              </p>
            </div>
            <ModeSelector value={learningMode} onChange={setLearningMode} />
          </section>

          <section className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {t('home.chooseScenario')}
                </h2>
                <p className="text-gray-500 text-sm">
                  {t('home.scenarioHelp')} • {t('home.scenariosForLevel', { level: germanLevel })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {selectedScenario && (
                  <button
                    onClick={() => setSelectedScenarioId(null)}
                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                  >
                    {t('home.clearSelection')}
                  </button>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  {t('scenario.createCustom', 'Create Custom Scenario')}
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedScenarios.map((scenario) => (
                <ScenarioCard
                  key={scenario.id}
                  scenario={scenario}
                  isSelected={selectedScenarioId === scenario.id}
                  onClick={() => setSelectedScenarioId(
                    selectedScenarioId === scenario.id ? null : scenario.id
                  )}
                />
              ))}
            </div>

            {filteredScenarios.length > 6 && (
              <div className="text-center mt-6">
                <button
                  onClick={() => setShowAllScenarios(!showAllScenarios)}
                  className="text-german-gold hover:text-amber-600 font-medium text-sm"
                >
                  {showAllScenarios 
                    ? t('home.showLess')
                    : t('home.showMore', { count: filteredScenarios.length - 6 })
                  }
                </button>
              </div>
            )}
          </section>

          <section className="relative z-20 animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {t('home.selectVoice', 'Select tutor voice')}
              </h2>
            </div>
            <VoiceSelector />
          </section>

          <div className="flex flex-col items-center gap-4 pt-8 pb-12 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            {selectedScenario && (
              <div className="text-center mb-2">
                <p className="text-sm text-gray-500">{t('home.startingScenario')}</p>
                <p className="font-semibold text-gray-900">
                  {selectedScenario.icon} {selectedScenario.title}
                </p>
              </div>
            )}
            <Button 
              size="lg" 
              onClick={handleStart}
              className="text-xl px-16 py-5 shadow-lg hover:shadow-xl transform transition-all hover:-translate-y-1 rounded-xl"
            >
              {selectedScenario 
                ? t('home.startMission')
                : t('home.start')
              }
            </Button>
            {!selectedScenario && (
              <p className="text-sm text-gray-400">
                {t('home.selectScenarioHint')}
              </p>
            )}
          </div>
        </div>
      </div>

      <CreateScenarioModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onScenarioCreated={handleScenarioCreated}
      />
    </Layout>
  );
}
