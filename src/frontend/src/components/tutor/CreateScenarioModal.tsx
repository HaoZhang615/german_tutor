import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';
import { scenarioService } from '../../services/scenarioService';
import { useAppStore } from '../../store';
import type { Scenario } from '../../store/types';

interface CreateScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScenarioCreated: (scenario: Scenario) => void;
}

export const CreateScenarioModal: React.FC<CreateScenarioModalProps> = ({
  isOpen,
  onClose,
  onScenarioCreated,
}) => {
  const { t } = useTranslation('common');
  const { germanLevel } = useAppStore();
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const scenario = await scenarioService.generateScenario({
        topic: topic.trim(),
        level: germanLevel,
      });
      
      const savedScenario = await scenarioService.createScenario(scenario);
      
      onScenarioCreated(savedScenario);
      onClose();
    } catch (err) {
      console.error('Failed to generate scenario:', err);
      setError(t('errors.generateScenarioFailed', 'Failed to generate scenario. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-scale-in">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {t('scenario.createCustom', 'Create Custom Scenario')}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
              {t('scenario.topicLabel', 'What do you want to practice?')}
            </label>
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={t('scenario.topicPlaceholder', 'e.g., Returning a defective item, Discussing climate change...')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-german-gold focus:border-german-gold outline-none transition-all"
              autoFocus
              disabled={isLoading}
            />
            <p className="mt-2 text-xs text-gray-500">
              {t('scenario.levelHint', 'The scenario will be generated for your current level: {{level}}', { level: germanLevel })}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              {t('common:actions.cancel', 'Cancel')}
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!topic.trim() || isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('common:status.generating', 'Generating...')}
                </span>
              ) : (
                t('scenario.generate', 'Generate Scenario')
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
