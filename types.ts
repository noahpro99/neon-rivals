export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  ROUND_OVER = 'ROUND_OVER',
  GAME_OVER = 'GAME_OVER',
  SKIN_CREATOR = 'SKIN_CREATOR',
  VIDEO_STUDIO = 'VIDEO_STUDIO'
}

export interface PlayerStats {
  id: number;
  hp: number;
  maxHp: number;
  speed: number;
  size: number;
  damage: number;
  color: string;
  textureUrl?: string | null;
  wins: number;
  maxBounces: number;
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'legendary';
  apply: (stats: PlayerStats) => PlayerStats;
}

export interface ProjectileData {
  id: string;
  position: [number, number, number];
  velocity: [number, number, number];
  ownerId: number;
  damage: number;
  maxBounces: number;
}