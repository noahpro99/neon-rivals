import { PlayerStats, Upgrade } from './types';

export const DEFAULT_STATS: Omit<PlayerStats, 'id' | 'color' | 'wins'> = {
  hp: 100,
  maxHp: 100,
  speed: 12, // Increased from 5 for faster gameplay
  size: 1,
  damage: 10,
  textureUrl: null,
  maxBounces: 3, // Increased from 1 to 3 for better game feel
};

export const PLAYER_1_START: PlayerStats = {
  ...DEFAULT_STATS,
  id: 1,
  color: '#3b82f6', // Blue
  wins: 0,
};

export const PLAYER_2_START: PlayerStats = {
  ...DEFAULT_STATS,
  id: 2,
  color: '#ef4444', // Red
  wins: 0,
};

export const UPGRADES: Upgrade[] = [
  {
    id: 'speed_boost',
    name: 'Nitro Injection',
    description: '+20% Movement Speed',
    rarity: 'common',
    apply: (s) => ({ ...s, speed: s.speed * 1.2 }),
  },
  {
    id: 'tank_up',
    name: 'Titan Plating',
    description: '+30 Max HP, +10% Size',
    rarity: 'common',
    apply: (s) => ({ ...s, maxHp: s.maxHp + 30, hp: s.hp + 30, size: s.size * 1.1 }),
  },
  {
    id: 'glass_cannon',
    name: 'Glass Cannon',
    description: '+50% Damage, -20% Max HP',
    rarity: 'rare',
    apply: (s) => ({ ...s, damage: s.damage * 1.5, maxHp: s.maxHp * 0.8, hp: Math.min(s.hp, s.maxHp * 0.8) }),
  },
  {
    id: 'tiny_terror',
    name: 'Nano Shrink',
    description: '-20% Size (Harder to hit)',
    rarity: 'rare',
    apply: (s) => ({ ...s, size: s.size * 0.8 }),
  },
  {
    id: 'juggernaut',
    name: 'Juggernaut',
    description: '+100% HP, +50% Size, -20% Speed',
    rarity: 'legendary',
    apply: (s) => ({ ...s, maxHp: s.maxHp * 2, hp: s.hp + s.maxHp, size: s.size * 1.5, speed: s.speed * 0.8 }),
  },
  {
    id: 'vampire',
    name: 'Life Leach',
    description: 'Full Heal + 10 Max HP',
    rarity: 'common',
    apply: (s) => ({ ...s, maxHp: s.maxHp + 10, hp: s.maxHp + 10 }),
  },
  {
    id: 'ricochet',
    name: 'Ricochet Rounds',
    description: '+2 Bullet Bounces',
    rarity: 'rare',
    apply: (s) => ({ ...s, maxBounces: s.maxBounces + 2 }),
  }
];