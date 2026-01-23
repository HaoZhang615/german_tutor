import React from 'react';

interface RecordButtonProps {
  isRecording: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export const RecordButton: React.FC<RecordButtonProps> = ({ 
  isRecording, 
  onClick, 
  disabled 
}) => {
  return (
    <div className="relative group">
      {isRecording && (
        <span className="absolute inset-0 rounded-full bg-german-red opacity-20 animate-ping" />
      )}
      <button
        onClick={onClick}
        disabled={disabled}
        className={`relative z-10 flex items-center justify-center w-20 h-20 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
          isRecording 
            ? 'bg-german-red text-white' 
            : 'bg-german-gold text-german-black hover:bg-amber-400'
        }`}
        aria-label={isRecording ? "Stop recording" : "Start recording"}
      >
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className={`w-8 h-8 ${isRecording ? 'animate-pulse' : ''}`}
        >
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      </button>
    </div>
  );
};
