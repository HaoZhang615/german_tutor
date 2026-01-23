import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../ui/Card';
import { useAppStore } from '../../store';
import type { GermanLevel } from '../../store/types';

export const LevelSelector: React.FC = () => {
  const { t } = useTranslation('tutor');
  const { germanLevel, setGermanLevel } = useAppStore();

  const levels: GermanLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
      {levels.map((level) => (
        <Card
          key={level}
          hover
          className={`relative border-2 transition-all duration-300 ${
            germanLevel === level
              ? 'border-german-gold ring-1 ring-german-gold bg-amber-50/30'
              : 'border-transparent hover:border-gray-200'
          }`}
          onClick={() => setGermanLevel(level)}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-2xl font-bold ${
                germanLevel === level ? 'text-german-gold' : 'text-gray-900'
              }`}>
                {level}
              </span>
              {germanLevel === level && (
                <div className="w-3 h-3 rounded-full bg-german-gold" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {t(`levels.${level}.name`, `${level} Level`)}
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              {t(`levels.${level}.description`, 'Description not available')}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
};
