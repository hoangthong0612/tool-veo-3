
import React, { useState } from 'react';
import { CopyIcon, CheckIcon } from './icons';

interface PromptCardProps {
  text: string;
}

export const PromptCard: React.FC<PromptCardProps> = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-md group">
      <p className="text-gray-300 leading-relaxed">{text}</p>
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 p-2 bg-gray-700 rounded-full text-gray-400 hover:bg-gray-600 hover:text-white transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
        aria-label="Copy prompt"
      >
        {copied ? (
          <CheckIcon className="w-5 h-5 text-green-400" />
        ) : (
          <CopyIcon className="w-5 h-5" />
        )}
      </button>
    </div>
  );
};
