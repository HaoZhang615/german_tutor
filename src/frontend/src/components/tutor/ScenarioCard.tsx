import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Scenario } from '../../data/scenarios';

interface ScenarioCardProps {
  scenario: Scenario;
  isSelected: boolean;
  onClick: () => void;
}

export const ScenarioCard: React.FC<ScenarioCardProps> = ({
  scenario,
  isSelected,
  onClick,
}) => {
  const { t } = useTranslation('common');
  const {
    id,
    titleDe,
    targetRole,
    difficulty,
    suggestedLevel,
    icon,
  } = scenario;

  const translatedTitle = t(`scenario.${id}.title`);
  const translatedDescription = t(`scenario.${id}.description`);
  const translatedRole = t(`scenario.roles.${targetRole}`);

  const difficultyColors = {
    Easy: 'bg-green-100 text-green-800 border-green-200',
    Medium: 'bg-amber-100 text-amber-800 border-amber-200',
    Hard: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <div
      onClick={onClick}
      className={`
        relative flex flex-col p-6 rounded-2xl cursor-pointer
        transition-all duration-300 ease-out
        backdrop-blur-sm bg-white/90 shadow-sm border-2
        hover:-translate-y-1 hover:scale-[1.02] hover:shadow-md
        ${
          isSelected
            ? 'border-[#FFCC00] ring-2 ring-[#FFCC00]/20 shadow-lg'
            : 'border-transparent hover:border-[#FFCC00]/50'
        }
      `}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="text-4xl filter drop-shadow-sm">{icon}</div>
        <span
          className={`
            px-2.5 py-0.5 rounded-full text-xs font-medium border
            ${difficultyColors[difficulty]}
          `}
        >
          {t(`scenario.difficulty.${difficulty}`)}
        </span>
      </div>

      <div className="flex-grow space-y-2 mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 leading-tight">
            {translatedTitle}
          </h3>
          <p className="text-sm text-gray-500 font-medium">{titleDe}</p>
        </div>
        <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
          {translatedDescription}
        </p>
      </div>

      <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-xs font-medium text-gray-500">
        <div className="flex items-center gap-1.5">
          <span className="uppercase tracking-wider text-[10px] text-gray-400">
            {t('scenario.role')}
          </span>
          <span className="text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
            {translatedRole}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="uppercase tracking-wider text-[10px] text-gray-400">
            {t('scenario.level')}
          </span>
          <span className="text-gray-900 font-bold bg-[#FFCC00]/20 px-2 py-0.5 rounded text-[#B38F00]">
            {suggestedLevel}
          </span>
        </div>
      </div>
    </div>
  );
};
