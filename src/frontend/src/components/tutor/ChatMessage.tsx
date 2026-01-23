import React from 'react';
import type { Message } from '../../store/types';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-5 py-3.5 shadow-sm text-base leading-relaxed break-words ${
          isUser
            ? 'bg-primary-50 text-gray-900 rounded-br-none border border-primary-100'
            : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
        }`}
      >
        {message.content}
      </div>
    </div>
  );
};
