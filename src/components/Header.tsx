import React from 'react';

const Header: React.FC = () => (
  <header className="bg-gray-800/50 backdrop-blur-sm p-4 text-center rounded-lg shadow-lg mb-8">
    <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
      Story to Video AI Generator
    </h1>
    <p className="text-gray-400 mt-2">Bring your stories to life with AI-powered video creation.</p>
  </header>
);

export default Header;
