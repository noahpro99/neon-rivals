import React, { useState } from 'react';
import { generateSkinTexture } from '../../services/gemini';
import { PlayerStats } from '../../types';

interface SkinCreatorProps {
  player: PlayerStats;
  onUpdatePlayer: (id: number, updates: Partial<PlayerStats>) => void;
  onClose: () => void;
}

export const SkinCreator: React.FC<SkinCreatorProps> = ({ player, onUpdatePlayer, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setError('');
    try {
      const url = await generateSkinTexture(prompt);
      onUpdatePlayer(player.id, { textureUrl: url });
      onClose();
    } catch (err) {
      setError('Failed to generate texture. Try a different prompt.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-black/95 flex items-center justify-center z-50">
      <div className="w-full max-w-md p-8 bg-gray-900 rounded-2xl border border-gray-700">
        <h2 className="text-3xl font-bold text-white mb-4">Customize Player {player.id}</h2>
        <p className="text-gray-400 mb-6">Describe your armor/skin. AI will paint it for you.</p>
        
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.currentTarget.value)}
          placeholder="e.g., rusty metal plate with neon circuits, dragon scales, carbon fiber..."
          className="w-full h-32 bg-gray-800 text-white p-4 rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none mb-4"
        />

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            Cancel
          </button>
          <button 
            onClick={handleGenerate}
            disabled={loading || !prompt}
            className={`flex-1 px-4 py-3 rounded-lg font-bold text-black transition-colors
              ${loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-500 hover:bg-green-400'}
            `}
          >
            {loading ? 'Generating...' : 'Create Skin'}
          </button>
        </div>
      </div>
    </div>
  );
};