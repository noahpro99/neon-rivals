import React, { useMemo } from 'react';
import { PlayerStats, Upgrade } from '../../types';
import { UPGRADES } from '../../constants';

interface UpgradeScreenProps {
  loserId: number;
  onSelect: (upgrade: Upgrade) => void;
}

export const UpgradeScreen: React.FC<UpgradeScreenProps> = ({ loserId, onSelect }) => {
  // Pick 3 random upgrades
  const options = useMemo(() => {
    const shuffled = [...UPGRADES].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }, []);

  return (
    <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-50">
      <h2 className="text-4xl text-red-500 font-bold mb-2">ROUND OVER</h2>
      <p className="text-xl text-white mb-8">Player {loserId} (Loser) - Choose your tactical advantage!</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full px-4">
        {options.map((u) => (
          <button
            key={u.id}
            onClick={() => onSelect(u)}
            className={`
              p-6 rounded-xl border-2 transition-all hover:scale-105 text-left group
              ${u.rarity === 'legendary' ? 'border-yellow-400 bg-yellow-900/20 hover:bg-yellow-900/40' : 
                u.rarity === 'rare' ? 'border-purple-400 bg-purple-900/20 hover:bg-purple-900/40' : 
                'border-blue-400 bg-blue-900/20 hover:bg-blue-900/40'}
            `}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-2xl font-bold text-white">{u.name}</h3>
              <span className={`text-xs px-2 py-1 rounded uppercase font-bold 
                ${u.rarity === 'legendary' ? 'bg-yellow-500 text-black' : 
                  u.rarity === 'rare' ? 'bg-purple-500 text-white' : 'bg-blue-500 text-white'}`}>
                {u.rarity}
              </span>
            </div>
            <p className="text-gray-300 text-lg">{u.description}</p>
            <div className="mt-4 text-sm opacity-0 group-hover:opacity-100 transition-opacity text-white">
              Click to Select
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};