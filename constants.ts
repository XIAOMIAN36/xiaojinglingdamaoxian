
import { CharacterTheme, LevelConfig } from "./types";

export const GRAVITY = 1.2; 
export const JUMP_FORCE = -22; 
export const DOUBLE_JUMP_FORCE = -18; 
export const GROUND_Y = 400; 
export const GAME_SPEED_START = 5.0; 
export const MAX_SPEED = 20.0; 
export const MIN_OBSTACLE_GAP = 300; 

export const MAGNET_DURATION = 1000; 

export const PLAYER_WIDTH = 44; 
export const PLAYER_HEIGHT_STANDING = 44; 
export const PLAYER_HEIGHT_SLIDING = 30;

export const OBSTACLE_WIDTH = 35; 
export const OBSTACLE_HEIGHT = 35;

// Background Music
export const BGM_URL = "https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3"; 

// Share Image
export const SHARE_IMAGE_URL = "https://cdn.pixabay.com/photo/2022/10/05/20/43/hyacinth-macaw-7501470_1280.jpg";

export const SHOP_ITEMS = {
    revivePotion: {
        id: 'revivePotion',
        name: '复活药水',
        price: 200,
        description: '抵挡一次致命伤害并自动复活'
    }
};

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    targetStars: 10, 
    baseSpeed: 5.0,
    minGap: 450, 
    hasMovingObstacles: false,
    description: "初出茅庐"
  },
  {
    id: 2,
    targetStars: 15,
    baseSpeed: 8.0, 
    minGap: 380, 
    hasMovingObstacles: false,
    description: "丛林疾行"
  },
  {
    id: 3,
    targetStars: 20,
    baseSpeed: 9.5, 
    minGap: 340,
    hasMovingObstacles: true, 
    description: "飞弹危机"
  },
  {
    id: 4,
    targetStars: 25,
    baseSpeed: 11.0, 
    minGap: 300,
    hasMovingObstacles: true,
    description: "幻影迷踪"
  },
  {
    id: 5,
    targetStars: 60,
    baseSpeed: 15.0, 
    minGap: 220, 
    hasMovingObstacles: true,
    description: "极限挑战"
  }
];

export const CHARACTER_THEMES: Record<string, CharacterTheme> = {
  classic: {
    id: 'classic',
    name: '雨儿',
    ability: '幸运星: 金币分数翻倍',
    price: 0,
    colors: {
      body: '#fbcfe8', // Pink 200
      belly: '#fdf2f8', // Pink 50
      outline: '#db2777', // Pink 600
      dark: '#f472b6', // Pink 400
      hat: '#be185d', // Pink 700
      hatBand: '#facc15', // Yellow 400
      face: '#1e2937', 
      cheek: '#fb7185',
    }
  },
  ninja: {
    id: 'ninja',
    name: '忍者喵',
    ability: '影之跃: 拥有三段跳能力',
    price: 500,
    colors: {
      body: '#334155', // Slate 700
      belly: '#94a3b8', // Slate 400
      outline: '#0f172a', // Slate 900
      dark: '#1e293b', // Slate 800
      hat: '#0f172a', // Black
      hatBand: '#ef4444', // Red
      face: '#ffffff', // White eyes
      cheek: '#64748b',
    }
  },
  alien: {
    id: 'alien',
    name: '星际喵',
    ability: '力场: 开局自带护盾',
    price: 1000,
    colors: {
      body: '#4ade80', // Green 400
      belly: '#dcfce7', // Green 50
      outline: '#15803d', // Green 700
      dark: '#16a34a', // Green 600
      hat: '#94a3b8', // Silver (Helmet)
      hatBand: '#38bdf8', // Cyan Light
      face: '#000000', 
      cheek: '#86efac',
    }
  }
};

export const THEME_COLORS = {
  // Default Fallback
  player: '#fb923c',
  
  ground: '#ecfeff', // Cyan 50 - Fresher look
  groundHighlight: '#cffafe', // Cyan 100
  
  // Powerups
  shield: '#60a5fa', // Blue 400
  magnet: '#ef4444', // Red 500
  
  // Obstacles (Unified Style)
  outline: '#475569', // Slate 600 - Unified outline color for obstacles
  
  obstacle: '#f472b6', 
  obstacleAir: '#fbbf24', 
  coin: '#fcd34d', // Amber 300
  
  skyTop: '#bfdbfe', // Blue 200
  skyBottom: '#ffffff', // White
  
  spike: '#64748b', // Slate 500 (Thorn color)
  
  // Pillar Style - Marble & Vines
  pillar: '#f5f5f4', // Warm Grey 100 (Marble)
  pillarDark: '#d6d3d1', // Warm Grey 300
  vine: '#84cc16', // Lime 500
  
  mushroomCap: '#ef4444', // Red 500
  mushroomStem: '#fef3c7', // Amber 50
  
  // New Obstacles
  log: '#92400e', // Amber 800
  logDark: '#78350f', // Amber 900
  bat: '#7c3aed', // Violet 600
  crystal: '#06b6d4', // Cyan 500
  fireball: '#f97316', // Orange 500
  fireballCore: '#fef08a', // Yellow 200
  projectile: '#ef4444', // Red Rocket
  phasingVisible: '#a855f7', // Purple
  phasingHidden: 'rgba(168, 85, 247, 0.2)',
  
  // VFX & Decor
  dust: '#ffffff',
  shadow: 'rgba(51, 65, 85, 0.2)', // Slate 700 with opacity
  
  // Ground Decor
  flowerPetal: '#f472b6', // Pink
  flowerCenter: '#fcd34d', // Yellow
  grass: '#22d3ee', // Cyan 400 (Matches fresh ground)
  stone: '#94a3b8', // Slate 400
};