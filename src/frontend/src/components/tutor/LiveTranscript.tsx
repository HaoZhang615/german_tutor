import React, { useEffect, useRef } from 'react';
import type { Message } from '../../store/types';

interface LiveTranscriptProps {
  messages: Message[];
  className?: string;
}

export const LiveTranscript: React.FC<LiveTranscriptProps> = ({ 
  messages, 
  className = '' 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className={`relative flex flex-col h-full ${className}`}>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
        }
        .transcript-mask {
          mask-image: linear-gradient(to bottom, transparent 0px, black 40px, black calc(100% - 40px), transparent 100%);
          -webkit-mask-image: linear-gradient(to bottom, transparent 0px, black 40px, black calc(100% - 40px), transparent 100%);
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 py-8 transcript-mask no-scrollbar"
      >
        <div className="flex flex-col space-y-6 min-h-full justify-end">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex w-full animate-fade-in-up ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[85%] text-lg font-medium leading-relaxed ${
                  msg.role === 'user'
                    ? 'text-right text-german-red'
                    : 'text-left text-gray-500'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
};
