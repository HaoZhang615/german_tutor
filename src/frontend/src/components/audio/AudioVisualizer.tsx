import React from 'react';

interface AudioVisualizerProps {
  isRecording: boolean;
  audioLevel: number; 
}

const BAR_SCALES = [0.95, 1.15, 0.85, 1.25, 0.9, 1.1, 0.8, 1.2, 0.88, 1.18, 0.92, 1.08];

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ 
  isRecording, 
  audioLevel 
}) => {
  return (
    <div className="flex items-end justify-center gap-1 h-12 w-full max-w-[200px]">
      {BAR_SCALES.map((scale, i) => {
        const height = isRecording 
          ? Math.max(15, Math.min(100, audioLevel * 100 * scale)) 
          : 15;
          
        return (
          <div
            key={i}
            className={`w-2 rounded-full transition-all duration-75 ${
              isRecording ? 'bg-german-gold' : 'bg-gray-300'
            }`}
            style={{ 
              height: `${height}%`,
              opacity: isRecording ? 1 : 0.5 
            }}
          />
        );
      })}
    </div>
  );
};
