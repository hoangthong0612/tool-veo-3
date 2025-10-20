export type GenerationMode = 'idea' | 'script';
export type AspectRatio = '16:9' | '9:16' | '1:1';
export type Language = 'en' | 'vi';

export interface Character {
  id: string;
  name: string;
  description: string;
  refImage?: File;
  refImageUrl?: string;
  refImageBase64?: string;
  promptImage?: string;
}

export interface Landscape {
  id: string;
  name: string;
  description: string;
  refImage?: File;
  refImageUrl?: string;
  refImageBase64?: string;
}

export interface Scene {
  sceneNumber: number;
  imagePrompt: string;
  videoPrompt: string;
  scriptPortion: string;
  charactersInScene: string[];
  landscapesInScene: string[];
  generatedImage?: string; // base64 string
  generatedVideoUrl?: string;
  narration?: string;
  isGeneratingImage?: boolean;
  isGeneratingVideo?: boolean;
}