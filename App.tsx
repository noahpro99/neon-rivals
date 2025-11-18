import React, { useState, useCallback } from 'react';
import { GameState, PlayerStats } from './types';
import { DEFAULT_STATS, PLAYER_1_START, PLAYER_2_START } from './constants';
import { GameScene } from './components/Game/GameScene';
import { UpgradeScreen } from './components/UI/UpgradeScreen';
import { SkinCreator } from './components/UI/SkinCreator';
import { VideoStudio } from './components/UI/VideoStudio';

function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [p1, setP1] = useState<PlayerStats>(PLAYER_1_START);
  const [p2, setP2] = useState<PlayerStats>(PLAYER_2_START);
  const [round, setRound] = useState(1);
  const [winnerId, setWinnerId] = useState<number | null>(null);
  
  // Editor State
  const [editingPlayerId, setEditingPlayerId] = useState<number | null>(null);

  const handleP1Hit = useCallback((damage: number) => {
    setP1(prev => {
      const newHp = prev.hp - damage;
      if (newHp <= 0 && gameState === GameState.PLAYING) {
        setWinnerId(2);
        setP2(p => ({ ...p, wins: p.wins + 1 }));
        setGameState(GameState.ROUND_OVER);
        return { ...prev, hp: 0 };
      }
      return { ...prev, hp: newHp };
    });
  }, [gameState]);

  const handleP2Hit = useCallback((damage: number) => {
    setP2(prev => {
      const newHp = prev.hp - damage;
      if (newHp <= 0 && gameState === GameState.PLAYING) {
        setWinnerId(1);
        setP1(p => ({ ...p, wins: p.wins + 1 }));
        setGameState(GameState.ROUND_OVER);
        return { ...prev, hp: 0 };
      }
      return { ...prev, hp: newHp };
    });
  }, [gameState]);

  const startRound = () => {
    // Reset HP but keep stats
    setP1(p => ({ ...p, hp: p.maxHp }));
    setP2(p => ({ ...p, hp: p.maxHp }));
    setWinnerId(null);
    setGameState(GameState.PLAYING);
  };

  const applyUpgrade = (upgrade: any) => {
    const loserId = winnerId === 1 ? 2 : 1;
    if (loserId === 1) {
      setP1(prev => upgrade.apply(prev));
    } else {
      setP2(prev => upgrade.apply(prev));
    }
    setRound(r => r + 1);
    startRound();
  };

  const updatePlayerStats = (id: number, updates: Partial<PlayerStats>) => {
    if (id === 1) setP1(prev => ({ ...prev, ...updates }));
    else setP2(prev => ({ ...prev, ...updates }));
  };

  // --- RENDER ---

  return (
    <div className="w-full h-screen bg-gray-900 relative overflow-hidden select-none">
      
      {/* Main Game Render - Always mounted but covered by UI when not playing */}
      {(gameState === GameState.PLAYING || gameState === GameState.ROUND_OVER) && (
        <div className="absolute inset-0">
            <GameScene 
                p1={p1} 
                p2={p2} 
                onP1Hit={handleP1Hit}
                onP2Hit={handleP2Hit} 
            />
            
            {/* HUD */}
            <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start pointer-events-none">
                <div className="flex flex-col gap-2">
                    <div className="text-blue-400 text-2xl font-bold">PLAYER 1</div>
                    <div className="text-white text-sm">WINS: {p1.wins}</div>
                    <div className="w-48 h-4 bg-gray-700 rounded-full overflow-hidden border border-gray-500">
                        <div style={{ width: `${(p1.hp / p1.maxHp) * 100}%` }} className="h-full bg-blue-500 transition-all" />
                    </div>
                </div>
                <div className="text-white font-bold text-3xl bg-black/50 px-4 py-2 rounded-xl">
                    ROUND {round}
                </div>
                <div className="flex flex-col gap-2 items-end">
                    <div className="text-red-400 text-2xl font-bold">PLAYER 2</div>
                    <div className="text-white text-sm">WINS: {p2.wins}</div>
                    <div className="w-48 h-4 bg-gray-700 rounded-full overflow-hidden border border-gray-500">
                        <div style={{ width: `${(p2.hp / p2.maxHp) * 100}%` }} className="h-full bg-red-500 transition-all" />
                    </div>
                </div>
            </div>

            {/* Controls Hint */}
            <div className="absolute bottom-4 w-full text-center text-white/30 text-xs pointer-events-none">
                P1: WASD + SPACE | P2: ARROWS + ENTER
            </div>
        </div>
      )}

      {/* Main Menu */}
      {gameState === GameState.MENU && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[url('https://picsum.photos/1920/1080?blur=2')] bg-cover bg-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="z-10 flex flex-col items-center animate-fade-in">
            <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-600 mb-8 tracking-tighter">
              NEON RIVALS
            </h1>
            
            <button 
              onClick={startRound}
              className="w-64 py-4 bg-white text-black font-bold text-xl rounded-full hover:scale-105 transition-transform mb-4 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              START MATCH
            </button>

            <div className="flex gap-4 mt-8">
                <button 
                    onClick={() => { setEditingPlayerId(1); setGameState(GameState.SKIN_CREATOR); }}
                    className="px-6 py-2 rounded-lg border border-blue-500 text-blue-400 hover:bg-blue-500/20 transition-colors"
                >
                    Customize P1
                </button>
                <button 
                    onClick={() => { setEditingPlayerId(2); setGameState(GameState.SKIN_CREATOR); }}
                    className="px-6 py-2 rounded-lg border border-red-500 text-red-400 hover:bg-red-500/20 transition-colors"
                >
                    Customize P2
                </button>
            </div>
            
            <button 
                onClick={() => setGameState(GameState.VIDEO_STUDIO)}
                className="mt-8 text-gray-400 hover:text-white text-sm border-b border-transparent hover:border-white transition-all"
            >
                ✨ Open Video Studio (Veo)
            </button>
          </div>
        </div>
      )}

      {/* Round Over Screen */}
      {gameState === GameState.ROUND_OVER && winnerId !== null && (
        <UpgradeScreen 
          loserId={winnerId === 1 ? 2 : 1} 
          onSelect={applyUpgrade} 
        />
      )}

      {/* Skin Creator Overlay */}
      {gameState === GameState.SKIN_CREATOR && editingPlayerId && (
        <SkinCreator 
            player={editingPlayerId === 1 ? p1 : p2}
            onUpdatePlayer={updatePlayerStats}
            onClose={() => setGameState(GameState.MENU)}
        />
      )}

      {/* Video Studio Overlay */}
      {gameState === GameState.VIDEO_STUDIO && (
          <VideoStudio onClose={() => setGameState(GameState.MENU)} />
      )}

    </div>
  );
}

export default App;