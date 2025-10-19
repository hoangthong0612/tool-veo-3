export type GenerationMode = 'idea' | 'script';
export type AspectRatio = '16:9' | '9:16' | '1:1';

export interface Character {
  id: string;
  name: string;
  description: string;
  refImage?: File;
  refImageUrl?: string;
  refImageBase64?: string;
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
  generatedImage?: string; // base64 string
  generatedVideoUrl?: string;
  isGeneratingImage?: boolean;
  isGeneratingVideo?: boolean;
}
