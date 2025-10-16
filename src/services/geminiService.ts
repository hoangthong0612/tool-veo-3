
import { GoogleGenAI, Type } from "@google/genai";
import type { PromptPair } from '@/types/main';

if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

export const suggestIdea = async (): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'Tạo một ý tưởng sáng tạo và hấp dẫn về mặt hình ảnh cho một bức ảnh hoặc một video ngắn. Hãy thật ngắn gọn, chỉ đưa ra ý tưởng, phong cách bối cảnh. Ví dụ: "Một phi hành gia đang lướt sóng trên các vành đai của sao Thổ, phong cách 3d carton pixar".',
        });
        return response.text == undefined ? '' : response.text.trim();
    } catch (error) {
        console.error("Error suggesting idea:", error);
        throw new Error("Failed to get suggestion from Gemini API.");
    }
};

export const generatePrompts = async (idea: string, count: number): Promise<PromptPair[]> => {
    const prompt = `Dựa trên ý tưởng sau: "${idea}", hãy tạo ${count} cặp prompt riêng biệt.
    Đối với mỗi cặp:
    1. Một 'imagePrompt' được tối ưu hóa để tạo ra một hình ảnh tĩnh, chi tiết, chất lượng cao.
    2. Một 'videoPrompt' được tối ưu hóa để tạo ra một video dài 8 giây kể một câu chuyện ngắn hoặc ghi lại một khoảnh khắc.
    Cung cấp mô tả sống động về các cảnh, hành động và tâm trạng cho video.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            imagePrompt: {
                                type: Type.STRING,
                                description: 'Prompt để tạo hình ảnh tĩnh.',
                            },
                            videoPrompt: {
                                type: Type.STRING,
                                description: 'Prompt để tạo video dài 8 giây.',
                            },
                        },
                        required: ["imagePrompt", "videoPrompt"],
                    },
                },
            },
        });

        const jsonStr = response.text == undefined ? '' : response.text.trim();
        const result = JSON.parse(jsonStr);

        if (!Array.isArray(result)) {
            throw new Error("API did not return an array.");
        }

        // Basic type checking for the returned data
        const isValid = result.every(item =>
            typeof item === 'object' &&
            item !== null &&
            'imagePrompt' in item && typeof item.imagePrompt === 'string' &&
            'videoPrompt' in item && typeof item.videoPrompt === 'string'
        );

        if (!isValid) {
            throw new Error("API returned data in an unexpected format.");
        }

        return result as PromptPair[];

    } catch (error) {
        console.error("Error generating prompts:", error);
        throw new Error("Failed to generate prompts from Gemini API.");
    }
};
