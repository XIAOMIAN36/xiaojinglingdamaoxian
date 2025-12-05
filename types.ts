
export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
  LEVEL_COMPLETE = 'LEVEL_COMPLETE'
}

export enum EntityType {
  PLAYER = 'PLAYER',
  OBSTACLE_GROUND = 'OBSTACLE_GROUND',
  OBSTACLE_AIR = 'OBSTACLE_AIR',
  COIN = 'COIN',
  POWERUP = 'POWERUP'
}

export interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  color: string;
  type: EntityType;
  markedForDeletion?: boolean;
  subtype?: 'SPIKE' | 'PILLAR' | 'MUSHROOM' | 'BIRD' | 'GHOST' | 'STAR' | 'SHIELD' | 'MAGNET' | 'LOG' | 'BAT' | 'CRYSTAL' | 'FIREBALL' | 'PROJECTILE' | 'PHASING';
  initialY?: number; // For floating animations
  floating?: boolean;
  isVisible?: boolean; // For Phasing obstacles
  phaseTimer?: number; // For Phasing logic
}

export interface Player extends Entity {
  isGrounded: boolean;
  jumpCount: number;
  isSliding: boolean;
  slideTimer: number;
  rotation: number; // Visual rotation angle in radians
  hasShield: boolean;
  magnetTimer: number;
  landTimer: number; // For landing squash animation
  invincibleTimer: number; // For revive invulnerability
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export interface DailyMission {
  title: string;
  description: string;
  targetScore: number;
}

export type CharacterId = 'classic' | 'ninja' | 'alien';

export interface CharacterTheme {
  id: CharacterId;
  name: string;
  ability: string; // Description of special power
  price: number; // Cost in coins
  colors: {
    body: string;
    outline: string;
    dark: string; // Limbs/Shadows
    light: string;
    snout: string;
    nostril: string;
    face: string;
    cheek: string;
    accessory?: string; // Bandana, etc.
  };
}

export interface PlayerStats {
  totalCoins: number;
  totalScore: number;
  highScore: number;
  unlockedCharacters: CharacterId[];
  selectedCharacter: CharacterId;
  maxLevelReached: number; // 1 to 5
  revivePotions: number;
}

export interface LevelConfig {
  id: number;
  targetStars: number;
  baseSpeed: number;
  minGap: number;
  hasMovingObstacles: boolean;
  description: string;
}
