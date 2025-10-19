import React from 'react';

const Loader: React.FC<{ message: string }> = ({ message }) => (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center z-50">
    <div className="w-16 h-16 border-4 border-t-purple-500 border-gray-600 rounded-full animate-spin"></div>
    <p className="mt-4 text-xl text-white">{message}</p>
  </div>
);

export default Loader;
