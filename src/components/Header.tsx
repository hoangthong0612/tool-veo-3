
import React from 'react';
import { BotIcon } from './icons';

export const Header: React.FC = () => {
  return (
    <header className="text-center py-4">
      <div className="flex items-center justify-center gap-4 mb-2">
        <BotIcon className="w-10 h-10 text-cyan-400" />
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
          Tạo ý tưởng Prompt -&gt; Video
        </h1>
      </div>
      <p className="text-lg text-gray-400 max-w-2xl mx-auto">
        ThôngĐtrai
      </p>
    </header>
  );
};
