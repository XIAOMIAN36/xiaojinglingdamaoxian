import { CharacterTheme, LevelConfig } from "./types";

export const GRAVITY = 1.2; // Increased for very fast, heavy falling
export const JUMP_FORCE = -22; // Stronger jump to counteract high gravity
export const DOUBLE_JUMP_FORCE = -18; 
export const GROUND_Y = 400; 
export const GAME_SPEED_START = 5.0; 
export const MAX_SPEED = 20.0; // Higher cap
export const MIN_OBSTACLE_GAP = 300; 

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
    targetStars: 100, // Endless challenge basically
    baseSpeed: 15.0, // Extreme speed
    minGap: 220, // Extreme density
    hasMovingObstacles: true,
    description: "极限挑战"
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