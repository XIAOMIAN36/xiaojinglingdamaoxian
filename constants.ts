
import { CharacterTheme, LevelConfig } from "./types";

export const GRAVITY = 0.9; // Significantly increased for heavy, fast falling
export const JUMP_FORCE = -19; // Stronger jump to counteract high gravity
export const DOUBLE_JUMP_FORCE = -15; 
export const GROUND_Y = 400; 
export const GAME_SPEED_START = 5.0; 
export const MAX_SPEED = 15.0; // Higher cap for later levels
export const MIN_OBSTACLE_GAP = 350; 

export const MAGNET_DURATION = 1000; 

export const PLAYER_WIDTH = 44; 
export const PLAYER_HEIGHT_STANDING = 44; 
export const PLAYER_HEIGHT_SLIDING = 30;

export const OBSTACLE_WIDTH = 35; 
export const OBSTACLE_HEIGHT = 35;

// Background Music (Lazy loaded in App.tsx)
export const BGM_URL = "https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3"; 

// Share Image for social cards
export const SHARE_IMAGE_URL = "https://cdn.pixabay.com/photo/2022/10/05/20/43/hyacinth-macaw-7501470_1280.jpg";

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    targetStars: 10, // Much easier start
    baseSpeed: 5.0,
    minGap: 450, 
    hasMovingObstacles: false,
    description: "初出茅庐"
  },
  {
    id: 2,
    targetStars: 25,
    baseSpeed: 6.5, // Faster
    minGap: 400, // More obstacles
    hasMovingObstacles: false,
    description: "丛林探险"
  },
  {
    id: 3,
    targetStars: 45,
    baseSpeed: 8.0, // Fast
    minGap: 360,
    hasMovingObstacles: true, 
    description: "幽灵出没"
  },
  {
    id: 4,
    targetStars: 70,
    baseSpeed: 9.5, // Very Fast
    minGap: 330,
    hasMovingObstacles: true,
    description: "极速挑战"
  },
  {
    id: 5,
    targetStars: 100,
    baseSpeed: 11.0, // Extreme
    minGap: 300, // Intense density
    hasMovingObstacles: true,
    description: "大师试炼"
  }
];

export const CHARACTER_THEMES: Record<string, CharacterTheme> = {
  classic: {
    id: 'classic',
    name: '小精灵',
    ability: '幸运星: 金币分数翻倍',
    price: 0,
    colors: {
      body: '#fbcfe8', // Pink 200
      outline: '#db2777', // Pink 600
      dark: '#f472b6', // Pink 400
      light: '#fce7f3', 
      snout: '#fce7f3', 
      nostril: '#be185d', 
      face: '#1f2937', 
      cheek: '#f9a8d4',
    }
  },
  ninja: {
    id: 'ninja',
    name: '忍者精灵',
    ability: '影之跃: 拥有三段跳能力',
    price: 500,
    colors: {
      body: '#334155', // Slate 700
      outline: '#0f172a', // Slate 900
      dark: '#1e293b', // Slate 800
      light: '#475569', 
      snout: '#94a3b8', 
      nostril: '#0f172a', 
      face: '#ffffff', // White eyes
      cheek: '#64748b',
      accessory: '#ef4444' // Red Bandana
    }
  },
  alien: {
    id: 'alien',
    name: '外星精灵',
    ability: '力场: 开局自带护盾',
    price: 1000,
    colors: {
      body: '#86efac', // Green 300
      outline: '#166534', // Green 800
      dark: '#4ade80', // Green 400
      light: '#bbf7d0', 
      snout: '#bbf7d0', 
      nostril: '#14532d', 
      face: '#000000', 
      cheek: '#22c55e',
    }
  }
};

export const THEME_COLORS = {
  // Default Fallback
  player: '#fbcfe8',
  
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
  
  // VFX & Decor
  dust: '#ffffff',
  shadow: 'rgba(51, 65, 85, 0.2)', // Slate 700 with opacity
  
  // Ground Decor
  flowerPetal: '#f472b6', // Pink
  flowerCenter: '#fcd34d', // Yellow
  grass: '#22d3ee', // Cyan 400 (Matches fresh ground)
  stone: '#94a3b8', // Slate 400
};
