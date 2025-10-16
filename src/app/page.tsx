"use client";

import React, { useState, useCallback } from 'react';
import { Header } from '@/components/Header';
import { IdeaInputForm } from '@/components/IdeaInputForm';
import { PromptDisplay } from '@/components/PromptDisplay';
import { Spinner } from '@/components/Spinner';
import { suggestIdea, generatePrompts } from '@/services/geminiService';
import type { PromptPair } from '@/types/main';

import { useGlobal } from "@/context/GlobalContext";
import Image from "next/image";

export default function Home() {
  const { tokenData } = useGlobal();
  if (!tokenData) {
    return <div>Loading...</div>;
  }

  if (!tokenData.user) {
    return ("Lỗi token")
  }
  console.log("User data:", tokenData);

  const [idea, setIdea] = useState<string>('');
  const [promptCount, setPromptCount] = useState<number>(3);
  const [generatedPrompts, setGeneratedPrompts] = useState<PromptPair[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuggesting, setIsSuggesting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSuggestIdea = useCallback(async () => {
    setIsSuggesting(true);
    setError(null);
    try {
      const suggestedIdea = await suggestIdea();
      setIdea(suggestedIdea);
    } catch (err) {
      setError('Không thể gợi ý ý tưởng. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setIsSuggesting(false);
    }
  }, []);

  const handleGeneratePrompts = useCallback(async () => {
    if (!idea.trim()) {
      setError('Vui lòng nhập một ý tưởng.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedPrompts([]);
    try {
      const prompts = await generatePrompts(idea, promptCount);
      setGeneratedPrompts(prompts);
    } catch (err) {
      setError('Không thể tạo prompt. Vui lòng kiểm tra ý tưởng của bạn và thử lại.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [idea, promptCount]);

  return (
    <>
      <div className="container mx-auto p-4">
        <div className="flex items-center  flex-col">
          <img src={tokenData.user.image} alt="" className="rounded-full" />
          <h1 className="py-5">Xin chào :  {tokenData.user.name}</h1>
          <main className="mt-8 w-full">
            <IdeaInputForm
              idea={idea}
              setIdea={setIdea}
              promptCount={promptCount}
              setPromptCount={setPromptCount}
              onGenerate={handleGeneratePrompts}
              onSuggest={handleSuggestIdea}
              isLoading={isLoading}
              isSuggesting={isSuggesting}
            />

            {error && (
              <div className="mt-6 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center">
                <p>{error}</p>
              </div>
            )}

            {isLoading && <Spinner />}

            {generatedPrompts.length > 0 && !isLoading && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-center text-cyan-400 mb-6">Kết quả tạo Prompt</h2>
                <PromptDisplay prompts={generatedPrompts} />
              </div>
            )}
          </main>
        </div>


      </div>
    </>
  );
}
