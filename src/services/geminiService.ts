import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { AspectRatio, Character, Scene, GenerationMode, Landscape } from '@/types/main';

const getAi = () => {
  if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
    throw new Error("API key is missing. Please ensure it's configured in your environment.");
  }
  return new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
};

export const suggestIdea = async (idea: string): Promise<string> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Generate a short, compelling story idea in English. The idea should be visual and suitable for a short video. Current idea fragment: "${idea}"`,
  });
  return response.text != undefined ? response.text : '';
};

export const generateScriptAndCharacters = async (mode: GenerationMode, idea: string, style: string, duration: number, script: string): Promise<{script: string, characters: Omit<Character, 'id'>[], landscapes: Omit<Landscape, 'id'>[]}> => {
    const ai = getAi();
    const schema = {
      type: Type.OBJECT,
      properties: {
        script: { type: Type.STRING, description: "The full, coherent story script, in English." },
        characters: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING, description: "A detailed visual description of the character's appearance, clothing, and key features for consistent image generation." },
            },
            required: ["name", "description"]
          }
        },
        landscapes: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING, description: "A detailed visual description of the landscape, setting, or environment for consistent image generation." },
            },
            required: ["name", "description"]
          }
        }
      },
      required: ["script", "characters", "landscapes"]
    };

    let prompt = '';
    if (mode === 'idea') {
      prompt = `Based on the idea "${idea}" and style "${style}", write a coherent and engaging script in English for a ${duration}-second video. Also, identify the main characters AND key landscapes/settings. For each, provide a detailed visual description suitable for image generation prompts.`;
    } else {
      prompt = `Analyze the following script. Identify the main characters AND key landscapes/settings. For each, provide a detailed visual description suitable for image generation prompts. Reformat the script if necessary to be more cinematic. All output must be in English. Script: "${script}"`;
    }
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
        }
    });
    
    return JSON.parse(response.text ? response.text : '');
};

export const generateScenePrompts = async (script: string, characters: Character[], landscapes: Landscape[], duration: number, style: string): Promise<Scene[]> => {
    const ai = getAi();
    const characterDescriptions = characters.map(c => `${c.name}: ${c.description}`).join('\n');
    const landscapeDescriptions = landscapes.map(l => `${l.name}: ${l.description}`).join('\n');
    const numScenes = Math.ceil(duration / 8);
    
    const sceneSchema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          sceneNumber: { type: Type.NUMBER },
          scriptPortion: { type: Type.STRING, description: "The part of the script this scene covers." },
          imagePrompt: { type: Type.STRING, description: `A detailed prompt in English for generating a single, static keyframe image for this scene. Mention characters and landscapes by name. Style: ${style}.` },
          videoPrompt: { type: Type.STRING, description: `A prompt in English describing the action for an 8-second video clip for this scene. Mention characters and landscapes by name. Style: ${style}. The video should have music, but no other background noise or sound effects.` },
        },
        required: ["sceneNumber", "scriptPortion", "imagePrompt", "videoPrompt"]
      }
    };

    const prompt = `Break down this script into ${numScenes} distinct scenes. Each scene will be an 8-second video. For each scene, provide a concise portion of the script, a detailed image prompt, and a detailed video prompt. All prompts must be in English.
    ---
    SCRIPT: ${script}
    ---
    CHARACTERS:
    ${characterDescriptions}
    ---
    LANDSCAPES:
    ${landscapeDescriptions}
    ---`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: sceneSchema,
      }
    });
    return JSON.parse(response.text == undefined ? '' : response.text);
};

export const generateImageForScene = async (scene: Scene, characters: Character[], landscapes: Landscape[], style: string): Promise<string> => {
    const ai = getAi();
    const fullImagePrompt = `${scene.imagePrompt}, in the style of ${style}`;
    const imageParts: any[] = [{ text: fullImagePrompt }];
    
    characters.forEach(char => {
      if (scene.imagePrompt.includes(char.name) && char.refImageBase64 && char.refImage) {
        imageParts.push({
          inlineData: {
            mimeType: char.refImage.type,
            data: char.refImageBase64
          }
        });
      }
    });

    landscapes.forEach(land => {
      if (scene.imagePrompt.includes(land.name) && land.refImageBase64 && land.refImage) {
        imageParts.push({
          inlineData: {
            mimeType: land.refImage.type,
            data: land.refImageBase64
          }
        });
      }
    });

    const imageResponse = await ai.models.generateContent({
      model: 'gemini-2.5-ultra-image',
      contents: { parts: imageParts },
      config: { responseModalities: [Modality.IMAGE] }
    });

    if (!imageResponse) {
        throw new Error("No response from image generation model.");
    }

    const candidate = imageResponse.candidates?.[0];
    const parts = candidate?.content?.parts;
    const inlinePart = parts?.find((p: any) => p.inlineData);
    const imageData = inlinePart?.inlineData?.data;

    if (!imageData) {
        throw new Error("Image data not found in response.");
    }
    return imageData;
};

export const generateVideoForScene = async (scene: Scene, imageData: string, aspectRatio: AspectRatio): Promise<string> => {
    const ai = getAi();
    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: scene.videoPrompt,
        image: {
            imageBytes: imageData,
            mimeType: 'image/png'
        },
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: aspectRatio,
        }
    });

    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({operation: operation});
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (downloadLink) {
        const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        if (!videoResponse.ok) {
           const errorText = await videoResponse.text();
           console.error("Video fetch error:", errorText);
           if (errorText.includes("Requested entity was not found")) {
             throw new Error("API Key error. Please re-select your API key and try again.");
           }
           throw new Error(`Failed to fetch video: ${videoResponse.statusText}`);
        }
        const videoBlob = await videoResponse.blob();
        return URL.createObjectURL(videoBlob);
    } else {
        throw new Error("Video URI not found in operation response.");
    }
};
