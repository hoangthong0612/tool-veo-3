
import React from 'react';
import { LightbulbIcon, SparklesIcon } from './icons';

interface IdeaInputFormProps {
  idea: string;
  setIdea: (idea: string) => void;
  promptCount: number;
  setPromptCount: (count: number) => void;
  onGenerate: () => void;
  onSuggest: () => void;
  isLoading: boolean;
  isSuggesting: boolean;
}

export const IdeaInputForm: React.FC<IdeaInputFormProps> = ({
  idea,
  setIdea,
  promptCount,
  setPromptCount,
  onGenerate,
  onSuggest,
  isLoading,
  isSuggesting,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    if (promptCount < 1) {
      alert("Số lượng prompt phải lớn hơn 0");
      return;
    }
    e.preventDefault();
    onGenerate();
  };

  return (
    <form onSubmit={handleSubmit} className="backdrop-blur-sm p-6 rounded-2xl border border-gray-700 shadow-2xl space-y-6">
      <div className="relative">
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="Nhập ý tưởng của bạn ở đây... ví dụ: 'một khu rừng cyberpunk vào ban đêm'"
          className="w-full h-32 p-4 pr-32  border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200 resize-none"
          disabled={isLoading || isSuggesting}
        />
        <button
          type="button"
          onClick={onSuggest}
          disabled={isSuggesting || isLoading}
          className="absolute top-3 right-3 flex items-center gap-2 bg-yellow-500/10 text-yellow-400 px-3 py-2 rounded-md hover:bg-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isSuggesting ? (
            <div className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <LightbulbIcon className="w-5 h-5" />
          )}
          <span>Gợi ý</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="w-full sm:w-1/2">
          <label htmlFor="prompt-count" className="block mb-2 text-sm font-medium text-gray-400">
            Số lượng prompt:
          </label>
          <input
            id="prompt-count"
            type="number"
            min={1}
            value={promptCount}
            onChange={(e) => setPromptCount(Number(e.target.value))}
            className="w-full border-gray-700 border p-3 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            disabled={isLoading || isSuggesting}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || isSuggesting}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold px-8 py-3 rounded-lg hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 shadow-lg"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Đang tạo...</span>
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5" />
              <span>Tạo Prompts</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
