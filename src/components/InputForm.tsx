import React from 'react';
import type { GenerationMode, AspectRatio } from '@/types/main';

interface InputFormProps {
  mode: GenerationMode;
  setMode: (mode: GenerationMode) => void;
  idea: string;
  setIdea: (idea: string) => void;
  style: string;
  setStyle: (style: string) => void;
  duration: number;
  setDuration: (duration: number) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (ratio: AspectRatio) => void;
  script: string;
  setScript: (script: string) => void;
  onSuggestIdea: () => void;
  onGenerateScript: () => void;
}

const InputForm: React.FC<InputFormProps> = ({
  mode, setMode, idea, setIdea, style, setStyle, duration, setDuration,
  aspectRatio, setAspectRatio, script, setScript, onSuggestIdea, onGenerateScript
}) => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl space-y-6">
      <div className="flex border border-gray-700 rounded-lg p-1 max-w-md mx-auto">
        <button onClick={() => setMode('idea')} className={`w-1/2 py-2 rounded-md transition-colors ${mode === 'idea' ? 'bg-purple-600' : 'hover:bg-gray-700'}`}>From Idea</button>
        <button onClick={() => setMode('script')} className={`w-1/2 py-2 rounded-md transition-colors ${mode === 'script' ? 'bg-purple-600' : 'hover:bg-gray-700'}`}>From Script</button>
      </div>
      
      {mode === 'idea' ? (
        <div className='space-y-4'>
          <label className="block text-sm font-medium text-gray-400">Your Idea</label>
          <div className="relative">
            <textarea value={idea} onChange={e => setIdea(e.target.value)} rows={3} placeholder="A cat astronaut exploring a planet made of cheese..." className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"></textarea>
            <button onClick={onSuggestIdea} className="absolute bottom-3 right-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-1 px-3 rounded-full transition">Suggest</button>
          </div>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-400">Your Script</label>
          <textarea value={script} onChange={e => setScript(e.target.value)} rows={6} placeholder="SCENE START..." className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"></textarea>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400">Style</label>
          <input type="text" value={style} onChange={e => setStyle(e.target.value)} placeholder="e.g., Anime, Pixar, Cinematic..." className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400">Duration (seconds)</label>
          <input type="number" value={duration} onChange={e => setDuration(parseInt(e.target.value, 10) || 0)} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400">Aspect Ratio</label>
          <select value={aspectRatio} onChange={e => setAspectRatio(e.target.value as AspectRatio)} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition">
            <option>16:9</option>
            <option>9:16</option>
            <option>1:1</option>
          </select>
        </div>
      </div>
      <div className="text-center">
        <button onClick={onGenerateScript} className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105 shadow-lg">
          Create Story & Characters
        </button>
      </div>
    </div>
  );
};

export default InputForm;
