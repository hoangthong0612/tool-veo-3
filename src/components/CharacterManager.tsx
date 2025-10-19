import React from 'react';
import type { Character, Landscape } from '@/types/main';
import { fileToBase64 } from '@/utils/fileUtils';

interface AssetManagerProps {
  characters: Character[];
  setCharacters: React.Dispatch<React.SetStateAction<Character[]>>;
  landscapes: Landscape[];
  setLandscapes: React.Dispatch<React.SetStateAction<Landscape[]>>;
  onGenerateAssets: () => void;
}

const AssetManager: React.FC<AssetManagerProps> = ({ characters, setCharacters, landscapes, setLandscapes, onGenerateAssets }) => {

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, id: string, type: 'character' | 'landscape') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await fileToBase64(file);
      const url = URL.createObjectURL(file);

      if (type === 'character') {
        setCharacters(prev => prev.map(c => 
          c.id === id ? { ...c, refImage: file, refImageUrl: url, refImageBase64: base64 } : c
        ));
      } else {
        setLandscapes(prev => prev.map(l => 
          l.id === id ? { ...l, refImage: file, refImageUrl: url, refImageBase64: base64 } : l
        ));
      }
    } catch (error) {
      console.error("Failed to process image upload:", error);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-center text-purple-400">Manage Characters</h2>
        <p className="text-center text-gray-400 mt-2">AI has identified the following characters. You can upload reference images for better consistency.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {characters.map(char => (
            <div key={char.id} className="bg-gray-900 p-4 rounded-lg border border-gray-700 space-y-3">
              <h3 className="font-bold text-xl">{char.name}</h3>
              <p className="text-gray-400 text-sm">{char.description}</p>
              <div className="flex items-center gap-4">
                {char.refImageUrl && <img src={char.refImageUrl} alt={char.name} className="w-16 h-16 rounded-full object-cover" />}
                <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-white text-sm py-2 px-4 rounded-lg transition">
                  {char.refImage ? 'Change Image' : 'Upload Image'}
                  <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, char.id, 'character')} />
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {landscapes.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-center text-teal-400">Manage Landscapes</h2>
          <p className="text-center text-gray-400 mt-2">AI has identified key settings and landscapes. Provide reference images for a consistent environment.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {landscapes.map(land => (
              <div key={land.id} className="bg-gray-900 p-4 rounded-lg border border-gray-700 space-y-3">
                <h3 className="font-bold text-xl">{land.name}</h3>
                <p className="text-gray-400 text-sm">{land.description}</p>
                 <div className="flex items-center gap-4">
                  {land.refImageUrl && <img src={land.refImageUrl} alt={land.name} className="w-16 h-16 rounded-lg object-cover" />}
                  <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-white text-sm py-2 px-4 rounded-lg transition">
                    {land.refImage ? 'Change Image' : 'Upload Image'}
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, land.id, 'landscape')} />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

       <div className="text-center pt-4">
        <button onClick={onGenerateAssets} className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105 shadow-lg">
          Generate All Scenes & Assets
        </button>
      </div>
    </div>
  );
};

export default AssetManager;
