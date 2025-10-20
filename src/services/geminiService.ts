import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { AspectRatio, Character, Scene, GenerationMode, Landscape, Language } from '@/types/main';

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
  return response.text ?? "";
};

export const suggestStyle = async (storyContent: string, currentStyle: string): Promise<string> => {
  if (!storyContent.trim()) {
    throw new Error("Story content is required to suggest a style.");
  }
  const ai = getAi();
  const prompt = `Based on the following story content and the user's initial style preference, generate a more detailed and evocative style description suitable for AI image and video generation. The new style should enhance the story's mood and themes. Analyze the content for keywords and themes (e.g., futuristic, fantasy, horror, comedy) and incorporate them into the style. Respond with ONLY the new, improved style description text, without any introductory phrases.

Story Content: "${storyContent}"

User's Initial Style: "${currentStyle}"`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });
  return (response.text ?? "").trim();
};

export const generateScriptAndCharacters = async (mode: GenerationMode, idea: string, style: string, duration: number, script: string, language: Language): Promise<{ script: string, characters: Omit<Character, 'id'>[], landscapes: Omit<Landscape, 'id'>[] }> => {
  const ai = getAi();
  const languageName = language === 'vi' ? 'Vietnamese' : 'English';
  const schema = {
    type: Type.OBJECT,
    properties: {
      script: { type: Type.STRING, description: `The full, coherent story script, in ${languageName}.` },
      characters: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING, description: "A highly detailed visual description of the character's appearance, in English. Ensure the character's facial features and ethnicity are appropriate for the story's geographical and cultural setting. Include details on facial features, hair, body type, clothing, accessories, and demeanor for consistent image generation.Maximum of 3 characters" },
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
            description: { type: Type.STRING, description: "A detailed visual description of the landscape, setting, or environment, in English, including atmosphere, key elements, and color palette for consistent image generation.Maximum of 1" },
          },
          required: ["name", "description"]
        }
      }
    },
    required: ["script", "characters", "landscapes"]
  };

  const characterDescriptionInstruction = `For each character, provide a highly detailed visual description in English. This description is critical for AI image generation and must include specifics about their:
- Facial features (e.g., eye shape and color, nose, mouth, jawline). Ensure the character's facial features and ethnicity are appropriate for the story's geographical and cultural setting.
- Hair (e.g., color, length, style, texture)
- Body type (e.g., tall, short, slim, muscular)
- Clothing (be very specific about the type, style, colors, and textures of their garments)
- Key accessories or props (e.g., glasses, a specific hat, a futuristic watch)
- Overall demeanor (e.g., cheerful, grim, tired).`;

  const landscapeDescriptionInstruction = `For each landscape, provide a highly detailed visual description in English, including the atmosphere, key elements, and color palette.`;


  let prompt = '';
  if (mode === 'idea') {
    prompt = `Based on the idea "${idea}" and style "${style}", write a coherent and engaging script in ${languageName} for a ${duration}-second video. Also, identify the main characters AND key landscapes/settings. The character and landscape names and their detailed descriptions MUST be in English. Only the script itself should be in ${languageName}. ${characterDescriptionInstruction} ${landscapeDescriptionInstruction}`;
  } else {
    prompt = `Analyze the following script, which is in ${languageName}. Identify the main characters AND key landscapes/settings. The character and landscape names and their descriptions MUST be in English. Reformat the script if necessary to be more cinematic, keeping it in ${languageName}. Script: "${script}"`;
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: schema,
    }
  });

  return JSON.parse(response.text ?? "");
};

export const generateScenePrompts = async (script: string, characters: Character[], landscapes: Landscape[], duration: number, style: string, includeNarration: boolean, language: Language): Promise<Scene[]> => {
  const ai = getAi();
  const languageName = language === 'vi' ? 'Vietnamese' : 'English';
  const characterDescriptions = characters.map(c => `${c.name}: ${c.description}`).join('\n');
  const landscapeDescriptions = landscapes.map(l => `${l.name}: ${l.description}`).join('\n');
  const numScenes = Math.ceil(duration / 8);

  const sceneProperties: any = {
    sceneNumber: { type: Type.NUMBER },
    scriptPortion: { type: Type.STRING, description: `The part of the script this scene covers, in ${languageName}.` },
    imagePrompt: { type: Type.STRING, description: `A detailed prompt in English for generating a single, static keyframe image for this scene. Instead of using character or landscape names, embed their full descriptions directly into the prompt for maximum visual consistency. Style: ${style}.` },
    videoPrompt: { type: Type.STRING, description: `A prompt in English describing the action for an 8-second video clip. If the script portion contains character dialogue (e.g., 'ANNA: Look out!'), you MUST incorporate the dialogue into this prompt (e.g., 'Anna shouts "Look out!" with a worried expression'). Style: ${style}. The video should have music, but no other background noise or sound effects.` },
    charactersInScene: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of the exact names of characters present in this scene. E.g., ['Bob', 'Alice']"
    },
    landscapesInScene: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of the exact names of landscapes/settings for this scene. E.g., ['Enchanted Forest']"
    }
  };

  const requiredFields = ["sceneNumber", "scriptPortion", "imagePrompt", "videoPrompt", "charactersInScene", "landscapesInScene"];

  if (includeNarration) {
    sceneProperties.narration = { type: Type.STRING, description: `If the script portion contains text for a narrator (not spoken by a character), provide that narration script here, in ${languageName}. If the scene only contains dialogue, this field should be an empty string. The narration should be about 8 seconds long.` };
    requiredFields.push("narration");
  }

  const sceneSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: sceneProperties,
      required: requiredFields
    }
  };

  const narrationInstruction = includeNarration
    ? `6. A narration script (in ${languageName}). This is ONLY for a narrator's voice-over. If the scene only has dialogue, this field should be empty.`
    : "";

  const prompt = `The user's script is in ${languageName}. Break down this script into ${numScenes} distinct scenes. Each scene will be an 8-second video. For each scene, provide:
1. A concise portion of the script (in ${languageName}), including character dialogue and actions.
2. A detailed image prompt (MUST be in English).
3. A detailed video prompt (MUST be in English).
4. A list of character names in the scene.
5. A list of landscape names in the scene.
${narrationInstruction}

IMPORTANT:
- The 'scriptPortion' and 'narration' MUST be in ${languageName}.
- The 'imagePrompt' and 'videoPrompt' MUST be in English for the generation models.
- When creating image/video prompts, you MUST replace character/landscape names with their full descriptions provided below.
- CRITICAL for Video Prompt: If the script portion has character dialogue, you MUST include the dialogue text and the speaking action in the video prompt. For example, if the script is "ANNA: I found it!", the video prompt should be something like "Anna holds up a glowing orb and exclaims 'I found it!', her face lit with excitement".
- CRITICAL for Narration: The narration field is ONLY for a narrator's voice-over. DO NOT put character dialogue in the narration field.
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
  return JSON.parse(response.text ?? "");
};

export const generateCharacterReferenceImage = async (description: string, style: string, workflowId: string): Promise<any> => {
  // const ai = getAi();

  const prompt = `Full-body character concept art. A detailed portrait of the following character in a neutral, standing pose against a plain, light-colored background. The image should be a clear reference for the character's appearance. Style: ${style}. Character description: ${description}`;

  // const imageResponse = await ai.models.generateContent({
  //   model: 'gemini-2.5-flash-image',
  //   contents: { parts: [{ text: prompt }] },
  //   config: { responseModalities: [Modality.IMAGE] }
  // });

  try {
    const res = await fetch(`/api/create-subject-text`, {
      method: "POST",
      credentials: "include", // gửi cookie thật của user nếu cần
      body: JSON.stringify({ workflowId, prompt }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) throw new Error("Không có dữ liệu");
    const data = await res.json();
    console.log("Fetched token data:", data);
    // Use the image panels from the fetched response (try common property names)
    const imagePanels = data?.imagePanels ?? data?.imagePanels ?? [];
    const imagePart = imagePanels[0]?.generatedImages?.[0]?.encodedImage;
    if (!imagePart) throw new Error("Reference image data not found in response.");
    return {
      image: imagePart,
      id: imagePanels[0]?.generatedImages?.[0]?.mediaGenerationId,
      promptImage: imagePanels[0]?.prompt
    };
  } catch (e) {
    throw new Error("Reference image data not found in response.");
  }

  // const imagePart = imageResponse.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
  // const imageData = imagePart?.inlineData?.data;
  // if (!imageData) {
  //   throw new Error("Reference image data not found in response.");
  // }
  // return imageData;
};


export const generateImageForScene = async (scene: Scene, characters: Character[], landscapes: Landscape[], style: string, workflowId: string): Promise<string> => {
  // const ai = getAi();

  const fullImagePrompt = `${scene.imagePrompt}, in the style of ${style}`;

  // const imageParts: any[] = [{ text: fullImagePrompt }];

  // const sceneCharacters = characters.filter(c => scene.charactersInScene.includes(c.name));
  // sceneCharacters.forEach(char => {
  //   if (char.refImageBase64) {
  //     const mimeType = char.refImage ? char.refImage.type : 'image/png';
  //     imageParts.push({
  //       inlineData: {
  //         mimeType: mimeType,
  //         data: char.refImageBase64
  //       }
  //     });
  //   }
  // });

  // const sceneLandscapes = landscapes.filter(l => scene.landscapesInScene.includes(l.name));
  // sceneLandscapes.forEach(land => {
  //   if (land.refImageBase64 && land.refImage) {
  //     imageParts.push({
  //       inlineData: {
  //         mimeType: land.refImage.type,
  //         data: land.refImageBase64
  //       }
  //     });
  //   }
  // });
  // const imageResponse = await ai.models.generateContent({
  //   model: 'gemini-2.5-flash-image',
  //   contents: { parts: imageParts },
  //   config: { responseModalities: [Modality.IMAGE] }
  // });

  // const imagePart = imageResponse.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
  // const imageData = imagePart?.inlineData?.data;
  // if (!imageData) {
  //   throw new Error("Image data not found in response.");
  // }
  // return imageData;
  try {
    const res = await fetch(`/api/create-image-have-subject`, {
      method: "POST",
      credentials: "include", // gửi cookie thật của user nếu cần
      body: JSON.stringify({ workflowId, prompt : fullImagePrompt, characters,  }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) throw new Error("Không có dữ liệu");
    const data = await res.json();
    console.log("Fetched token data:", data);
    // Use the image panels from the fetched response (try common property names)
    const imagePanels = data?.imagePanels ?? data?.imagePanels ?? [];
    const imagePart = imagePanels[0]?.generatedImages?.[0]?.encodedImage;
    if (!imagePart) throw new Error("Reference image data not found in response.");
    return imagePart;
  } catch (e) {
    throw new Error("Reference image data not found in response.");
  }
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
    operation = await ai.operations.getVideosOperation({ operation: operation });
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