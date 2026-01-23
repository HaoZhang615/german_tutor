import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface TextInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({ onSend, disabled }) => {
  const [text, setText] = useState('');
  const { t } = useTranslation('tutor');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !disabled) {
      onSend(text);
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={disabled}
        placeholder={t('chat.placeholder', 'Type a message...')}
        className="flex-1 rounded-full border-gray-300 focus:border-german-gold focus:ring-german-gold shadow-sm px-4 py-2.5 text-gray-900 disabled:opacity-50 disabled:bg-gray-50"
      />
      <button
        type="submit"
        disabled={!text.trim() || disabled}
        className="bg-german-gold text-german-black rounded-full p-2.5 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
        </svg>
      </button>
    </form>
  );
};
