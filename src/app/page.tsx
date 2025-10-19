"use client";

import React, { useState, useCallback, useEffect } from 'react';

import type { GenerationMode, AspectRatio, Character, Scene, Landscape } from '@/types/main';

// Import components
import Loader from '@/components/Loader';
import ErrorMessage from '@/components/ErrorMessage';
import InputForm from '@/components/InputForm';
import AssetManager from '@/components/CharacterManager'; // Renamed to AssetManager
import Storyboard from '@/components/Storyboard';

import { useGlobal } from "@/context/GlobalContext";
import Image from "next/image";

// Import services
import * as aiService from '@/services/geminiService';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);


  const [mode, setMode] = useState<GenerationMode>('idea');
  const [idea, setIdea] = useState('');
  const [style, setStyle] = useState('Cinematic, hyper-realistic, 4K');
  const [duration, setDuration] = useState(16);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [script, setScript] = useState('');

  const [characters, setCharacters] = useState<Character[]>([]);
  const [landscapes, setLandscapes] = useState<Landscape[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [step, setStep] = useState(1); // 1: Input, 2: Asset Mgmt, 3: Results

  const handleSuggestIdea = async () => {
    setIsLoading(true);
    setLoadingMessage('Generating an idea...');
    setError(null);
    try {
      const suggestedIdea = await aiService.suggestIdea(idea);
      setIdea(suggestedIdea);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateScript = async () => {
    if (mode === 'idea' && !idea) {
      setError('Please enter an idea.');
      return;
    }
    if (mode === 'script' && !script) {
      setError('Please enter your script.');
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Analyzing input and creating script...');
    setError(null);

    try {
      const result = await aiService.generateScriptAndCharacters(mode, idea, style, duration, script);
      setScript(result.script);
      setCharacters(result.characters.map((c: any) => ({ ...c, id: self.crypto.randomUUID() })));
      setLandscapes(result.landscapes.map((l: any) => ({ ...l, id: self.crypto.randomUUID() })));
      setStep(2);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate script. The model might have returned an invalid format.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAssets = async () => {
    if (!script) {
      setError('No script available to generate assets.');
      return;
    }

    // if (window.aistudio) {
    //   try {
    //     const hasKey = await window.aistudio.hasSelectedApiKey();
    //     if (!hasKey) {
    //       await window.aistudio.openSelectKey();
    //     }
    //   } catch (e) {
    //     setError('Could not verify API key. Please try again.');
    //     return;
    //   }
    // } else {
    //   console.warn('aistudio context not found, skipping API key check.');
    // }

    setIsLoading(true);
    setError(null);

    try {
      setLoadingMessage('Breaking script into scenes...');
      const generatedScenes = await aiService.generateScenePrompts(script, characters, landscapes, duration, style);
      setScenes(generatedScenes);
      setStep(3);

      for (const [index, scene] of generatedScenes.entries()) {
        const currentScene = scene;
        setScenes(prev => prev.map(s => s.sceneNumber === currentScene.sceneNumber ? { ...s, isGeneratingImage: true } : s));
        setLoadingMessage(`Generating image for scene ${index + 1}/${generatedScenes.length}...`);

        try {
          const imageData = await aiService.generateImageForScene(currentScene, characters, landscapes, style);
          setScenes(prev => prev.map(s => s.sceneNumber === currentScene.sceneNumber ? { ...s, generatedImage: imageData, isGeneratingImage: false, isGeneratingVideo: true } : s));

          setLoadingMessage(`Generating video for scene ${index + 1}/${generatedScenes.length} (this can take a few minutes)...`);
          const videoUrl = await aiService.generateVideoForScene(currentScene, imageData, aspectRatio);
          setScenes(prev => prev.map(s => s.sceneNumber === currentScene.sceneNumber ? { ...s, generatedVideoUrl: videoUrl, isGeneratingVideo: false } : s));
        } catch (e) {
          console.error(`Error processing scene ${currentScene.sceneNumber}:`, e);
          let errorMessage = e instanceof Error ? e.message : "An unknown error occurred";
          if (errorMessage.includes("Requested entity was not found")) {
            errorMessage = "API Key error. Please re-select your API key and try again.";
          }
          setScenes(prev => prev.map(s => s.sceneNumber === currentScene.sceneNumber ? { ...s, isGeneratingImage: false, isGeneratingVideo: false } : s));
          setError(`Failed on scene ${currentScene.sceneNumber}: ${errorMessage}`);
          break;
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate scene prompts.');
      console.error(e);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleDownloadAll = async (type: 'image' | 'video') => {
    for (const scene of scenes) {
      let url;
      let filename;
      if (type === 'image' && scene.generatedImage) {
        url = `data:image/png;base64,${scene.generatedImage}`;
        filename = `scene_${scene.sceneNumber}_image.png`;
      } else if (type === 'video' && scene.generatedVideoUrl) {
        url = scene.generatedVideoUrl;
        filename = `scene_${scene.sceneNumber}_video.mp4`;
      }

      if (url && filename) {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        if (type === 'video') URL.revokeObjectURL(url);
      }
    }
  };

  const renderContent = () => {
    if (!mounted) {
      return <div>Loading...</div>;
    }

    return (
      <div className="min-h-screen bg-gray-900 text-gray-200 p-4 md:p-8">
        {isLoading && <Loader message={loadingMessage} />}
        <div className="max-w-7xl mx-auto">
        
          <ErrorMessage error={error} onClose={() => setError(null)} />

          {step === 1 && (
            <InputForm
              mode={mode}
              setMode={setMode}
              idea={idea}
              setIdea={setIdea}
              style={style}
              setStyle={setStyle}
              duration={duration}
              setDuration={setDuration}
              aspectRatio={aspectRatio}
              setAspectRatio={setAspectRatio}
              script={script}
              setScript={setScript}
              onSuggestIdea={handleSuggestIdea}
              onGenerateScript={handleGenerateScript}
            />
          )}

          {step === 2 && (
            <AssetManager
              characters={characters}
              setCharacters={setCharacters}
              landscapes={landscapes}
              setLandscapes={setLandscapes}
              onGenerateAssets={handleGenerateAssets}
            />
          )}

          {step === 3 && (
            <Storyboard scenes={scenes} onDownloadAll={handleDownloadAll} />
          )}
        </div>
      </div>
    );
  };

  return renderContent();
}
