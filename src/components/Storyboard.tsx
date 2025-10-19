import React from 'react';
import type { Scene } from '@/types/main';

interface StoryboardProps {
    scenes: Scene[];
    onDownloadAll: (type: 'image' | 'video') => void;
}
        
const Storyboard: React.FC<StoryboardProps> = ({ scenes, onDownloadAll }) => {
    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-purple-400">Generated Storyboard</h2>
                <div className="space-x-2">
                    <button onClick={() => onDownloadAll('image')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition">Download Images</button>
                    <button onClick={() => onDownloadAll('video')} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition">Download Videos</button>
                </div>
            </div>
            <div className="space-y-4">
                <div className="hidden lg:grid grid-cols-12 gap-4 font-bold text-gray-400 p-2">
                    <div className="col-span-3">Image Prompt</div>
                    <div className="col-span-3">Generated Image</div>
                    <div className="col-span-3">Video Prompt</div>
                    <div className="col-span-3">Generated Video</div>
                </div>
                {scenes.map(scene => (
                    <div key={scene.sceneNumber} className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-gray-900 p-4 rounded-lg border border-gray-700 items-center">
                        <div className="col-span-1 lg:col-span-3">
                            <h4 className="font-bold lg:hidden text-gray-400 mb-1">Image Prompt</h4>
                            <p className="text-sm text-gray-300">{scene.imagePrompt}</p>
                        </div>
                        <div className="col-span-1 lg:col-span-3 flex justify-center items-center h-48 bg-gray-800 rounded-md">
                            {scene.isGeneratingImage ? <div className="text-sm">Generating...</div> : (scene.generatedImage ? <img src={`data:image/png;base64,${scene.generatedImage}`} alt={`Scene ${scene.sceneNumber}`} className="max-h-full max-w-full object-contain rounded-md" /> : <div className="text-sm text-gray-500">No Image</div>)}
                        </div>
                        <div className="col-span-1 lg:col-span-3">
                            <h4 className="font-bold lg:hidden text-gray-400 mb-1">Video Prompt</h4>
                            <p className="text-sm text-gray-300">{scene.videoPrompt}</p>
                        </div>
                        <div className="col-span-1 lg:col-span-3 flex justify-center items-center h-48 bg-gray-800 rounded-md">
                            {scene.isGeneratingVideo ? <div className="text-sm">Generating...</div> : (scene.generatedVideoUrl ? <video src={scene.generatedVideoUrl} controls className="max-h-full max-w-full rounded-md" /> : <div className="text-sm text-gray-500">No Video</div>)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Storyboard;
