import React from 'react';

interface AudioVisualizerProps {
  isRecording: boolean;
  audioLevel: number; 
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ 
  isRecording, 
  audioLevel 
}) => {
  const bars = Array.from({ length: 12 });

  return (
    <div className="flex items-end justify-center gap-1 h-12 w-full max-w-[200px]">
      {bars.map((_, i) => {
        const height = isRecording 
          ? Math.max(15, Math.min(100, audioLevel * 100 * (Math.random() * 0.5 + 0.8))) 
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
