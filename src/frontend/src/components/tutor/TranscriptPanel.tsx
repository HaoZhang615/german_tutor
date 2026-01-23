import React, { useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import type { Message } from '../../store/types';

interface TranscriptPanelProps {
  messages: Message[];
}

export const TranscriptPanel: React.FC<TranscriptPanelProps> = ({ messages }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
      <div className="space-y-2">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} className="h-1" />
      </div>
    </div>
  );
};
