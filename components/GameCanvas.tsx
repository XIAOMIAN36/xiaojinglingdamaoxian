
import React, { useRef, useEffect, useCallback } from 'react';
import { GameState, EntityType, Player, Entity, Particle, CharacterTheme, LevelConfig } from '../types';
import { 
  GRAVITY, JUMP_FORCE, DOUBLE_JUMP_FORCE, MAX_SPEED, MIN_OBSTACLE_GAP, 
  PLAYER_WIDTH, PLAYER_HEIGHT_STANDING, PLAYER_HEIGHT_SLIDING, THEME_COLORS, MAGNET_DURATION
} from '../constants';

interface GameCanvasProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  onScoreUpdate: (score: number) => void;
  onStarUpdate: (stars: number) => void;
  onMagnetUpdate: (progress: number) => void;
  onGameOver: (finalScore: number) => void;
  onLevelComplete: () => void;
  activeTheme: CharacterTheme;
  levelConfig: LevelConfig;
  playSfx: (type: 'jump' | 'doubleJump' | 'slide' | 'coin' | 'powerup' | 'hit' | 'gameOver' | 'gameStart' | 'missionComplete' | 'levelComplete') => void;
}

// Extended particle for dust effects
interface DustParticle extends Particle {
  radius: number;
  growth: number;
}

interface GroundDecor {
  x: number;
  y: number;
  type: 'GRASS' | 'FLOWER' | 'STONE';
  variant: number; // For randomizing looks
}

// Visual Trail for jumping/dashing
interface TrailNode {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  color: string;
  skewX: number;
  scaleX: number;
  scaleY: number;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  gameState, 
  setGameState, 
  onScoreUpdate, 
  onStarUpdate,
  onMagnetUpdate,
  onGameOver, 
  onLevelComplete,
  activeTheme, 
  levelConfig,
  playSfx 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  
  // Game State Refs
  const scoreRef = useRef(0);
  const starsCollectedRef = useRef(0);
  const bonusScoreRef = useRef(0);
  const gameSpeedRef = useRef(levelConfig.baseSpeed);
  const distanceRef = useRef(0);
  const frameCountRef = useRef(0);
  
  const playerRef = useRef<Player>({
    x: 0, 
    y: 0,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT_STANDING,
    vx: 0,
    vy: 0,
    color: activeTheme.colors.body,
    type: EntityType.PLAYER,
    isGrounded: false,
    jumpCount: 0,
    isSliding: false,
    slideTimer: 0,
    rotation: 0,
    hasShield: false,
    magnetTimer: 0,
    landTimer: 0
  });

  const obstaclesRef = useRef<Entity[]>([]);
  const particlesRef = useRef<DustParticle[]>([]);
  const trailsRef = useRef<TrailNode[]>([]);
  const coinRotationRef = useRef(0);
  
  // Background Refs
  const cloudsRef = useRef<{x: number, y: number, w: number, s: number, bubbles: {dx: number, dy: number, r: number}[]}[]>([]);
  const groundDecorRef = useRef<GroundDecor[]>([]);
  const hillsRef = useRef<{x: number, h: number, w: number}[]>([]);
  const treesRef = useRef<{x: number, h: number, w: number}[]>([]);

  // Initialize Game
  const resetGame = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    
    scoreRef.current = 0;
    starsCollectedRef.current = 0;
    onStarUpdate(0);
    onMagnetUpdate(0);
    bonusScoreRef.current = 0;
    distanceRef.current = 0;
    gameSpeedRef.current = levelConfig.baseSpeed;
    frameCountRef.current = 0;
    
    const groundY = canvas.height - 100;
    
    // Character Ability: Alien starts with shield
    const startWithShield = activeTheme.id === 'alien';
    
    playerRef.current = {
      x: canvas.width * 0.1, 
      y: groundY - PLAYER_HEIGHT_STANDING,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT_STANDING,
      vx: 0,
      vy: 0,
      color: activeTheme.colors.body,
      type: EntityType.PLAYER,
      isGrounded: true,
      jumpCount: 0,
      isSliding: false,
      slideTimer: 0,
      rotation: 0,
      hasShield: startWithShield,
      magnetTimer: 0,
      landTimer: 0
    };
    
    obstaclesRef.current = [];
    particlesRef.current = [];
    groundDecorRef.current = [];
    trailsRef.current = [];
    
    // Create fluffy clouds
    cloudsRef.current = Array.from({ length: 8 }).map(() => {
      const w = 60 + Math.random() * 80;
      const bubbles = Array.from({ length: 5 }).map(() => ({
        dx: (Math.random() - 0.5) * w,
        dy: (Math.random() - 0.5) * 20,
        r: 15 + Math.random() * 15
      }));

      return {
        x: Math.random() * canvas.width,
        y: 50 + Math.random() * (canvas.height / 3),
        w: w,
        s: 0.1 + Math.random() * 0.2, 
        bubbles
      };
    });

    // Create Hills
    hillsRef.current = [];
    for(let i=0; i<canvas.width + 400; i+= 200) {
       hillsRef.current.push({
           x: i,
           h: 100 + Math.random() * 150,
           w: 300 + Math.random() * 200
       });
    }

    // Create Trees (Background)
    treesRef.current = [];
    for(let i=0; i<canvas.width + 200; i+= 150) {
        treesRef.current.push({
            x: i,
            h: 60 + Math.random() * 40,
            w: 40 + Math.random() * 20
        });
    }
    
    // Pre-populate ground decor
    for(let i=0; i<canvas.width; i+= 50) {
        if(Math.random() > 0.3) spawnGroundDecor(i, groundY);
    }

  }, [activeTheme, levelConfig, onStarUpdate, onMagnetUpdate]);

  const spawnGroundDecor = (x: number, groundY: number) => {
      const rand = Math.random();
      let type: GroundDecor['type'] = 'GRASS';
      if (rand > 0.8) type = 'FLOWER';
      else if (rand > 0.95) type = 'STONE';
      
      groundDecorRef.current.push({
          x,
          y: groundY + 5 + Math.random() * 10,
          type,
          variant: Math.random()
      });
  };

  const createDustParticles = (x: number, y: number, count: number) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y,
        vx: (Math.random() - 0.5) * 4,
        vy: -Math.random() * 2 - 0.5,
        life: 1.0,
        color: THEME_COLORS.dust,
        radius: 3 + Math.random() * 4,
        growth: 0.2
      });
    }
  };

  const createSparkles = (x: number, y: number, count: number, color: string) => {
      for (let i = 0; i < count; i++) {
        particlesRef.current.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6,
          life: 1.0,
          color,
          radius: 2 + Math.random() * 2,
          growth: -0.05
        });
      }
  };

  // Input Handling
  const handleInput = useCallback((action: 'JUMP' | 'SLIDE') => {
    if (gameState !== GameState.PLAYING) return;

    const p = playerRef.current;
    // Character Ability: Ninja has triple jump (3), others have double jump (2)
    const maxJumps = activeTheme.id === 'ninja' ? 3 : 2;

    if (action === 'JUMP') {
      if (p.isGrounded) {
        // First Jump
        p.vy = JUMP_FORCE;
        p.isGrounded = false;
        p.jumpCount = 1;
        p.isSliding = false;
        createDustParticles(p.x + p.width / 2, p.y + p.height, 8); // Jump Dust
        playSfx('jump');
      } else if (p.jumpCount < maxJumps) {
        // Double/Triple Jump
        p.vy = DOUBLE_JUMP_FORCE;
        p.jumpCount++;
        p.isSliding = false;
        createSparkles(p.x + p.width / 2, p.y + p.height, 5, activeTheme.colors.body); 
        playSfx('doubleJump');
      }
    } else if (action === 'SLIDE') {
      if (p.isGrounded && !p.isSliding) {
        p.isSliding = true;
        p.slideTimer = 45; 
        createDustParticles(p.x + p.width / 2, p.y + p.height, 5); // Slide Dust
        playSfx('slide');
      } else if (!p.isGrounded) {
        p.vy = 12; // Fast drop
      }
    }
  }, [gameState, activeTheme, playSfx]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === GameState.PAUSED) return;
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        handleInput('JUMP');
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        handleInput('SLIDE');
      }
    };
    
    const handleTouchStart = (e: TouchEvent) => {
        if (gameState === GameState.PAUSED) return;
        const touchY = e.touches[0].clientY;
        if (touchY < window.innerHeight / 2) {
            handleInput('JUMP');
        } else {
            handleInput('SLIDE');
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
    };
  }, [handleInput, gameState]);

  const drawStar = (ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) => {
      let rot = Math.PI / 2 * 3;
      let x = cx;
      let y = cy;
      let step = Math.PI / spikes;

      ctx.beginPath();
      ctx.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
          x = cx + Math.cos(rot) * outerRadius;
          y = cy + Math.sin(rot) * outerRadius;
          ctx.lineTo(x, y);
          rot += step;

          x = cx + Math.cos(rot) * innerRadius;
          y = cy + Math.sin(rot) * innerRadius;
          ctx.lineTo(x, y);
          rot += step;
      }
      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
  };

  const drawCharacter = (ctx: CanvasRenderingContext2D, p: Player, distance: number, theme: CharacterTheme) => {
    const colors = theme.colors;
    
    // --- SHADOW ---
    const groundY = ctx.canvas.height - 100;
    const shadowScale = 1 - Math.min((groundY - (p.y + p.height)) / 200, 0.6);
    const cx = p.x + p.width / 2;
    
    if (p.y + p.height < groundY + 50) { 
        ctx.fillStyle = THEME_COLORS.shadow;
        ctx.beginPath();
        ctx.ellipse(cx, groundY + 5, (p.width/2) * shadowScale, 6 * shadowScale, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.save();
    
    // Position center
    const cy = p.y + p.height / 2;
    
    ctx.translate(cx, cy);

    // Shield Visual
    if (p.hasShield) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, 40, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(96, 165, 250, 0.2)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(96, 165, 250, 0.6)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.rotate(distance * 0.05); 
        ctx.stroke();
        ctx.restore();
    }
    
    // Rotation logic
    if (!p.isGrounded) {
       ctx.rotate(p.rotation);
    } else {
       ctx.rotate(p.rotation); 
    }

    // Squash & Stretch Logic with Inertia (Skewing)
    let scaleX = 1;
    let scaleY = 1;
    let translateY = 0;
    let skewX = 0;
    
    if (p.landTimer > 0) {
        // Landing Impact (Inertia)
        const t = p.landTimer / 12; // 0 to 1 scale roughly
        const squash = Math.sin(t * Math.PI) * 0.5; // Squash factor
        scaleX = 1 + squash * 0.5; // Wider
        scaleY = 1 - squash * 0.5; // Shorter
        
        // FORWARD INERTIA: Skew the character forward when landing
        skewX = -0.3 * Math.sin(t * Math.PI); 
        translateY = (p.height / 2) * (1 - scaleY);
    } else if (!p.isGrounded) {
        scaleX = 0.9; 
        scaleY = 1.1; 
    } else {
        // Running Bounce
        const bounce = Math.sin(distance * 0.3) * 0.05;
        scaleX = 1 + bounce;
        scaleY = 1 - bounce;
        translateY = (p.height / 2) * (1 - scaleY);
        skewX = -0.1;
    }
    
    if (p.isSliding) {
        scaleY = 0.6;
        scaleX = 1.3;
        translateY = (p.height / 2) * (1 - scaleY);
        skewX = -0.4; // heavy lean when sliding
    }

    ctx.translate(0, translateY);
    ctx.transform(1, 0, skewX, 1, 0, 0);
    ctx.scale(scaleX, scaleY);

    const runCycle = (distance * 0.4); 
    const isRunning = p.isGrounded && !p.isSliding && p.landTimer <= 0;
    
    const bodyW = 34;
    const bodyH = 30;
    const headW = 38;
    const headH = 34;
    
    // --- LIMBS (Behind Body) ---
    ctx.fillStyle = colors.dark;
    
    ctx.save();
    ctx.translate(-8, 10);
    if (p.isSliding) {
        ctx.translate(4, 4);
        ctx.rotate(-1.4); // Slide leg forward
    }
    else if (isRunning) ctx.rotate(Math.sin(runCycle + Math.PI) * 0.6);
    else if (!p.isGrounded) ctx.rotate(-0.5); 
    drawLimb(ctx, 6, 10, colors.outline);
    ctx.restore();

    ctx.save();
    ctx.translate(8, 10);
    if (p.isSliding) {
        ctx.translate(4, 4);
        ctx.rotate(-1.4); // Slide leg forward
    }
    else if (isRunning) ctx.rotate(Math.sin(runCycle + Math.PI) * 0.6);
    else if (!p.isGrounded) ctx.rotate(-0.5);
    drawLimb(ctx, 6, 10, colors.outline);
    ctx.restore();
    
    // Tail
    if (!p.isSliding) {
        ctx.save();
        ctx.translate(-bodyW/2, 5);
        ctx.beginPath();
        ctx.strokeStyle = colors.dark;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        const tailBounce = Math.sin(runCycle * 2) * 2;
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-10, -5 + tailBounce, -10, 10 + tailBounce, -2, 5);
        ctx.stroke();
        ctx.restore();
    }

    // Speed Lines Effect (Sliding)
    if (p.isSliding) {
        ctx.save();
        ctx.translate(-30, 0);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        const time = Date.now() / 50;
        ctx.moveTo(Math.sin(time) * 5, -10); 
        ctx.lineTo(25 + Math.sin(time) * 5, -10);
        ctx.moveTo(-10 + Math.cos(time) * 5, 0); 
        ctx.lineTo(15 + Math.cos(time) * 5, 0);
        ctx.moveTo(5 + Math.sin(time + 1) * 5, 10); 
        ctx.lineTo(30 + Math.sin(time + 1) * 5, 10);
        ctx.stroke();
        ctx.restore();
    }

    // --- BODY ---
    ctx.fillStyle = colors.body;
    ctx.strokeStyle = colors.outline;
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.roundRect(-bodyW/2, -bodyH/2 + 5, bodyW, bodyH, 12);
    ctx.fill();
    ctx.stroke();

    // --- HEAD ---
    const headY = isRunning ? Math.sin(runCycle * 2) * 1.5 - 10 : -10;
    ctx.save();
    ctx.translate(0, headY);
    
    const earAngle = isRunning ? Math.sin(runCycle) * 0.2 : 0;
    
    // Ears
    ctx.save();
    ctx.translate(-12, -12);
    ctx.rotate(-0.4 + earAngle);
    ctx.fillStyle = colors.dark;
    ctx.beginPath();
    ctx.roundRect(-5, -8, 10, 16, 5);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.translate(12, -12);
    ctx.rotate(0.4 - earAngle);
    ctx.fillStyle = colors.dark;
    ctx.beginPath();
    ctx.roundRect(-5, -8, 10, 16, 5);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Head Shape
    ctx.fillStyle = colors.body;
    ctx.beginPath();
    ctx.roundRect(-headW/2, -headH/2, headW, headH, 14);
    ctx.fill();
    ctx.stroke();

    // Accessory (Bandana)
    if (theme.colors.accessory) {
        ctx.fillStyle = theme.colors.accessory;
        ctx.beginPath();
        ctx.moveTo(-headW/2 - 2, -headH/2 + 10);
        ctx.lineTo(headW/2 + 2, -headH/2 + 10);
        ctx.lineTo(headW/2 + 2, -headH/2 + 18);
        ctx.lineTo(-headW/2 - 2, -headH/2 + 18);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(headW/2 + 2, -headH/2 + 12);
        ctx.lineTo(headW/2 + 10, -headH/2 + 8);
        ctx.lineTo(headW/2 + 10, -headH/2 + 20);
        ctx.fill();
    }

    // Gloss
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.ellipse(-8, -10, 6, 3, -0.2, 0, Math.PI*2);
    ctx.fill();

    // Face
    const faceY = 2;
    ctx.fillStyle = colors.face;
    
    if (p.isSliding) {
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = colors.face;
        ctx.beginPath();
        ctx.moveTo(-11, faceY - 2);
        ctx.lineTo(-7, faceY + 1);
        ctx.lineTo(-11, faceY + 4);
        ctx.moveTo(11, faceY - 2);
        ctx.lineTo(7, faceY + 1);
        ctx.lineTo(11, faceY + 4);
        ctx.stroke();
    } else if (p.jumpCount >= 2) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = colors.face;
        ctx.beginPath();
        ctx.moveTo(-12, faceY - 2);
        ctx.lineTo(-8, faceY);
        ctx.lineTo(-12, faceY + 2);
        ctx.moveTo(12, faceY - 2);
        ctx.lineTo(8, faceY);
        ctx.lineTo(12, faceY + 2);
        ctx.stroke();
    } else {
        ctx.beginPath();
        ctx.ellipse(-8, faceY, 3.5, 4.5, 0, 0, Math.PI*2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(8, faceY, 3.5, 4.5, 0, 0, Math.PI*2);
        ctx.fill();
        
        if (theme.id !== 'ninja') { 
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(-7, faceY - 1.5, 1.5, 0, Math.PI*2);
            ctx.arc(9, faceY - 1.5, 1.5, 0, Math.PI*2);
            ctx.fill();
        }
    }

    // Snout
    ctx.fillStyle = colors.snout;
    ctx.beginPath();
    ctx.ellipse(0, faceY + 6, 7, 5, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = colors.nostril;
    ctx.beginPath();
    ctx.arc(-2.5, faceY + 6, 1.2, 0, Math.PI*2);
    ctx.arc(2.5, faceY + 6, 1.2, 0, Math.PI*2);
    ctx.fill();

    // Cheeks
    ctx.fillStyle = colors.cheek;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.arc(-13, faceY + 5, 3, 0, Math.PI*2);
    ctx.arc(13, faceY + 5, 3, 0, Math.PI*2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    ctx.restore(); // End Head

    // --- LIMBS (Front) ---
    ctx.fillStyle = colors.body; 
    
    ctx.save();
    ctx.translate(-9, 5);
    if (p.isSliding) {
        ctx.translate(4, 4);
        ctx.rotate(-1.4);
    }
    else if (isRunning) ctx.rotate(Math.sin(runCycle) * 0.8);
    else if (!p.isGrounded) ctx.rotate(-2.5);
    drawLimb(ctx, 5, 9, colors.outline);
    ctx.restore();

    ctx.save();
    ctx.translate(9, 5);
    if (p.isSliding) {
        ctx.translate(4, 4);
        ctx.rotate(-1.4);
    }
    else if (isRunning) ctx.rotate(Math.sin(runCycle) * 0.8);
    else if (!p.isGrounded) ctx.rotate(-2.5);
    drawLimb(ctx, 5, 9, colors.outline);
    ctx.restore();

    ctx.restore(); // End Player Transform
  };

  const drawLimb = (ctx: CanvasRenderingContext2D, w: number, h: number, outlineColor: string) => {
      ctx.beginPath();
      ctx.roundRect(-w/2, 0, w, h, w/2);
      ctx.fill();
      ctx.fillStyle = outlineColor; 
      ctx.beginPath();
      ctx.rect(-w/2, h-2, w, 2);
      ctx.fill();
  };

  const drawTrails = (ctx: CanvasRenderingContext2D) => {
      trailsRef.current.forEach(trail => {
          ctx.save();
          ctx.globalAlpha = trail.opacity;
          ctx.translate(trail.x + trail.width/2, trail.y + trail.height/2);
          ctx.rotate(trail.rotation);
          ctx.transform(1, 0, trail.skewX, 1, 0, 0);
          ctx.scale(trail.scaleX, trail.scaleY);
          ctx.fillStyle = trail.color;
          const bodyW = 34;
          const bodyH = 30;
          const headW = 38;
          const headH = 34;
          ctx.beginPath();
          ctx.roundRect(-bodyW/2, -bodyH/2 + 5, bodyW, bodyH, 12);
          ctx.fill();
          ctx.translate(0, -10);
          ctx.beginPath();
          ctx.roundRect(-headW/2, -headH/2, headW, headH, 14);
          ctx.fill();
          ctx.restore();
      });
      ctx.globalAlpha = 1.0;
  };

  const tick = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isPaused = gameState === GameState.PAUSED || gameState === GameState.LEVEL_COMPLETE;
    const isMenu = gameState === GameState.MENU;
    const isPlaying = gameState === GameState.PLAYING;

    if (!isPaused) {
      frameCountRef.current++;
      
      // Menu Mode
      if (isMenu) {
         distanceRef.current += levelConfig.baseSpeed;
         const p = playerRef.current;
         p.y = canvas.height - 100 - p.height; 
         p.x = canvas.width / 2 - p.width / 2;
         p.isGrounded = true;
         p.isSliding = false;
         
         const groundY = canvas.height - 100;
         hillsRef.current.forEach(h => {
             h.x -= levelConfig.baseSpeed * 0.1;
             if (h.x + h.w < 0) { h.x = canvas.width + 100; h.h = 100 + Math.random() * 150; }
         });
         treesRef.current.forEach(t => {
             t.x -= levelConfig.baseSpeed * 0.5;
             if (t.x + t.w < 0) { t.x = canvas.width + 50 + Math.random() * 100; t.h = 60 + Math.random() * 40; }
         });
         if (Math.random() < 0.15) spawnGroundDecor(canvas.width + 50, groundY); 
         groundDecorRef.current.forEach(d => { d.x -= levelConfig.baseSpeed; });
         groundDecorRef.current = groundDecorRef.current.filter(d => d.x > -50);
         cloudsRef.current.forEach(c => { c.x -= c.s; if (c.x + c.w + 50 < 0) c.x = canvas.width + 50; });
      }

      if (isPlaying) {
        const p = playerRef.current;
        const groundY = canvas.height - 100;
        
        coinRotationRef.current += 0.05;
        const wasGrounded = p.isGrounded;

        // --- Physics ---
        p.vy += GRAVITY;
        p.y += p.vy;

        const baseX = canvas.width * 0.1;
        const airBias = 40; 
        const targetX = p.isGrounded ? baseX : baseX + airBias;
        p.x += (targetX - p.x) * 0.05;

        // Rotation
        if (p.isGrounded) {
          p.rotation = p.rotation * 0.7; 
        } else {
           const spinSpeed = p.jumpCount >= 2 ? 0.25 : 0.15;
           p.rotation += spinSpeed;
        }

        // Ground Collision
        if (p.y + p.height >= groundY) {
          p.y = groundY - p.height;
          p.vy = 0;
          p.isGrounded = true;
          p.jumpCount = 0;
          
          if (!wasGrounded) {
             createDustParticles(p.x + p.width/2, p.y + p.height, 10);
             p.landTimer = 12; 
          }
        } else {
          p.isGrounded = false;
        }
        
        if (p.landTimer > 0) p.landTimer--;

        // Sliding
        if (p.isSliding) {
          p.height = PLAYER_HEIGHT_SLIDING;
          p.y = groundY - PLAYER_HEIGHT_SLIDING;
          p.slideTimer--;
          p.rotation = 0; 
          if (frameCountRef.current % 4 === 0) createDustParticles(p.x, p.y + p.height, 1);
          if (p.slideTimer <= 0) {
            p.isSliding = false;
            p.height = PLAYER_HEIGHT_STANDING;
            p.y = groundY - PLAYER_HEIGHT_STANDING;
          }
        } else if (!p.isSliding && p.height !== PLAYER_HEIGHT_STANDING) {
            p.height = PLAYER_HEIGHT_STANDING;
        }

        if (p.magnetTimer > 0) {
            p.magnetTimer--;
            onMagnetUpdate(p.magnetTimer / MAGNET_DURATION);
        } else {
            // Send 0 just to be safe/clear
            // But we don't want to spam if it's already 0. 
            // Since we don't track prev state here easily without ref, 
            // we rely on the parent or checking if it was > 0.
            // Simplified: we send progress every frame if > 0.
            // If it just became 0, we can't easily detect the "edge" here without extra var.
            // Let's just assume parent handles 0.
             if (p.magnetTimer === 0 && frameCountRef.current % 60 === 0) {
                 onMagnetUpdate(0);
             }
        }

        // Update Trails
        if ((!p.isGrounded || p.isSliding) && frameCountRef.current % 3 === 0) {
            trailsRef.current.push({
                x: p.x, y: p.y, width: p.width, height: p.height, rotation: p.rotation,
                opacity: p.isSliding ? 0.4 : 0.6, color: activeTheme.colors.body,
                skewX: p.isSliding ? -0.4 : -0.1, scaleX: 1.0, scaleY: p.isSliding ? 0.6 : 1.0
            });
        }
        for (let i = trailsRef.current.length - 1; i >= 0; i--) {
            const t = trailsRef.current[i];
            t.x -= gameSpeedRef.current;
            t.opacity -= 0.04; 
            t.scaleX *= 0.95; t.scaleY *= 0.95; 
            if (t.opacity <= 0 || t.scaleX < 0.1) trailsRef.current.splice(i, 1);
        }

        // Speed & Distance
        gameSpeedRef.current = Math.min(MAX_SPEED, levelConfig.baseSpeed + distanceRef.current * 0.00005);
        distanceRef.current += gameSpeedRef.current;
        scoreRef.current = Math.floor(distanceRef.current / 10) + bonusScoreRef.current;
        onScoreUpdate(scoreRef.current);

        // --- Background Updates ---
        hillsRef.current.forEach(h => {
            h.x -= gameSpeedRef.current * 0.1;
            if (h.x + h.w < 0) { h.x = canvas.width + 100; h.h = 100 + Math.random() * 150; }
        });
        
        treesRef.current.forEach(t => {
            t.x -= gameSpeedRef.current * 0.5;
            if (t.x + t.w < 0) { t.x = canvas.width + 50 + Math.random() * 100; t.h = 60 + Math.random() * 40; }
        });

        if (Math.random() < 0.15) spawnGroundDecor(canvas.width + 50, groundY); 
        groundDecorRef.current.forEach(d => { d.x -= gameSpeedRef.current; });
        groundDecorRef.current = groundDecorRef.current.filter(d => d.x > -50);

        // --- Obstacle Spawning ---
        const lastObstacle = obstaclesRef.current[obstaclesRef.current.length - 1];
        const currentMinGap = levelConfig.minGap + (gameSpeedRef.current * 10); 
        
        if (!lastObstacle || (canvas.width - lastObstacle.x > currentMinGap)) {
          if (Math.random() < 0.6) {
            const typeVal = Math.random();
            let type = EntityType.OBSTACLE_GROUND;
            let subtype: Entity['subtype'] = 'MUSHROOM';
            let yPos = groundY - 40;
            let w = 40;
            let h = 40;
            let color = THEME_COLORS.obstacle;
            let initialY = yPos;
            let floating = false;

            if (Math.random() < 0.08) { // Higher item chance in Levels
                type = EntityType.POWERUP;
                subtype = Math.random() > 0.5 ? 'SHIELD' : 'MAGNET';
                yPos = groundY - 100 - (Math.random() * 60);
                initialY = yPos;
                floating = false; // Powerups don't float anymore
                w = 40; h = 40;
                color = subtype === 'SHIELD' ? THEME_COLORS.shield : THEME_COLORS.magnet;
            } else {
                if (typeVal > 0.75) {
                  // AIR OBSTACLE
                  type = EntityType.OBSTACLE_AIR;
                  yPos = groundY - 120;
                  initialY = yPos;
                  w = 50; h = 40;
                  color = THEME_COLORS.obstacleAir;
                  subtype = 'GHOST';
                  
                  // Level 3+ Adds BAT
                  if (levelConfig.id >= 3 && Math.random() > 0.5) {
                      subtype = 'BAT';
                      color = THEME_COLORS.bat;
                  }
                  
                  if (levelConfig.hasMovingObstacles) floating = true;
                } else if (typeVal > 0.35) {
                   // GROUND OBSTACLE
                   type = EntityType.OBSTACLE_GROUND;
                   const rand = Math.random();
                   
                   // Determine available subtypes based on level
                   const subtypes: Entity['subtype'][] = ['MUSHROOM', 'SPIKE', 'PILLAR'];
                   if (levelConfig.id >= 2) subtypes.push('LOG');
                   if (levelConfig.id >= 4) subtypes.push('CRYSTAL');
                   if (levelConfig.id >= 5) subtypes.push('FIREBALL');
                   
                   subtype = subtypes[Math.floor(rand * subtypes.length)];

                   if (subtype === 'SPIKE') {
                       w = 40; h = 30; yPos = groundY - h; color = THEME_COLORS.spike;
                   } else if (subtype === 'PILLAR') {
                       w = 40; h = 70; yPos = groundY - h; color = THEME_COLORS.pillar;
                   } else if (subtype === 'LOG') {
                       w = 50; h = 25; yPos = groundY - h; color = THEME_COLORS.log;
                   } else if (subtype === 'CRYSTAL') {
                       w = 30; h = 50; yPos = groundY - h; color = THEME_COLORS.crystal;
                   } else if (subtype === 'FIREBALL') {
                       w = 40; h = 40; yPos = groundY - h; color = THEME_COLORS.fireball;
                       floating = true; // Fireball bounces
                       initialY = yPos;
                   } else {
                       // Mushroom
                       w = 40; h = 40; yPos = groundY - h; color = THEME_COLORS.mushroomCap;
                   }
                } else {
                   // COIN
                   type = EntityType.COIN;
                   subtype = 'STAR';
                   yPos = groundY - 120 - (Math.random() * 40);
                   initialY = yPos;
                   w = 30; h = 30; color = THEME_COLORS.coin;
                }
            }

            obstaclesRef.current.push({
              x: canvas.width + 100, y: yPos, width: w, height: h,
              vx: -gameSpeedRef.current, vy: 0, color: color, type: type, subtype: subtype,
              initialY, floating
            });
          }
        }

        // --- Update Entities ---
        cloudsRef.current.forEach(c => {
          c.x -= c.s;
          if (c.x + c.w + 50 < 0) c.x = canvas.width + 50;
        });

        for (let i = obstaclesRef.current.length - 1; i >= 0; i--) {
          const obs = obstaclesRef.current[i];
          
          // Moving obstacles logic
          if (obs.floating && obs.initialY !== undefined) {
             // Different floating patterns
             if (obs.subtype === 'FIREBALL') {
                 // Bounce for fireball
                 obs.y = obs.initialY - Math.abs(Math.sin(frameCountRef.current * 0.1)) * 60;
             } else {
                 // Gentle sine for ghosts/bats
                 obs.y = obs.initialY + Math.sin(frameCountRef.current * 0.05) * 40;
             }
          }

          // Magnet Logic
          if (p.magnetTimer > 0 && obs.type === EntityType.COIN) {
              const dx = p.x - obs.x;
              const dy = p.y - obs.y;
              const dist = Math.sqrt(dx*dx + dy*dy);
              if (dist < 500) { obs.x += (dx / dist) * 15; obs.y += (dy / dist) * 15; }
              else { obs.x -= gameSpeedRef.current; }
          } else {
              obs.x -= gameSpeedRef.current;
          }

          const collisionMargin = (obs.subtype === 'SPIKE' || obs.subtype === 'CRYSTAL' || obs.type === EntityType.POWERUP) ? 0 : 10;
          
          if (
            p.x < obs.x + obs.width - collisionMargin &&
            p.x + p.width > obs.x + collisionMargin &&
            p.y < obs.y + obs.height - collisionMargin &&
            p.y + p.height > obs.y + collisionMargin
          ) {
            if (obs.type === EntityType.COIN) {
               const scoreVal = activeTheme.id === 'classic' ? 200 : 100;
               bonusScoreRef.current += scoreVal; 
               starsCollectedRef.current += 1; // Increment Star Count
               onStarUpdate(starsCollectedRef.current);
               
               // WIN CONDITION
               if (starsCollectedRef.current >= levelConfig.targetStars) {
                   playSfx('levelComplete');
                   setGameState(GameState.LEVEL_COMPLETE);
                   onLevelComplete();
                   return; // Stop processing frame
               }

               createSparkles(obs.x + obs.width/2, obs.y + obs.height/2, 8, THEME_COLORS.coin);
               playSfx('coin');
               obs.markedForDeletion = true;
            } else if (obs.type === EntityType.POWERUP) {
               if (obs.subtype === 'SHIELD') {
                   p.hasShield = true;
                   createSparkles(obs.x + obs.width/2, obs.y + obs.height/2, 10, THEME_COLORS.shield);
               } else if (obs.subtype === 'MAGNET') {
                   p.magnetTimer = MAGNET_DURATION; // 20s
                   createSparkles(obs.x + obs.width/2, obs.y + obs.height/2, 10, THEME_COLORS.magnet);
               }
               playSfx('powerup');
               obs.markedForDeletion = true;
            } else {
               if (p.hasShield) {
                   p.hasShield = false;
                   obs.markedForDeletion = true;
                   createSparkles(obs.x + obs.width/2, obs.y + obs.height/2, 15, '#ffffff');
                   playSfx('hit');
               } else {
                  playSfx('hit');
                  playSfx('gameOver');
                  setGameState(GameState.GAME_OVER);
                  onGameOver(scoreRef.current);
                  return;
               }
            }
          }

          if (obs.x + obs.width < -100) {
            obs.markedForDeletion = true;
          }
        }
        obstaclesRef.current = obstaclesRef.current.filter(o => !o.markedForDeletion);

        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
          const pt = particlesRef.current[i];
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.life -= 0.05;
          pt.radius += pt.growth;
          if (pt.radius < 0) pt.radius = 0;
          if (pt.life <= 0) particlesRef.current.splice(i, 1);
        }
      } 
    } 

    // --- Draw ---
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, THEME_COLORS.skyTop);
    gradient.addColorStop(1, THEME_COLORS.skyBottom);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // BACKGROUNDS (Draw code same as before...)
    ctx.fillStyle = '#e0f2fe'; 
    hillsRef.current.forEach(h => {
        ctx.beginPath();
        ctx.moveTo(h.x, canvas.height);
        ctx.lineTo(h.x, canvas.height - h.h);
        ctx.bezierCurveTo(h.x + h.w/2, canvas.height - h.h - 50, h.x + h.w, canvas.height - h.h, h.x + h.w, canvas.height);
        ctx.fill();
    });

    ctx.fillStyle = '#bae6fd'; 
    treesRef.current.forEach(t => {
        const cx = t.x + t.w/2;
        const cy = canvas.height - 100 - t.h;
        ctx.beginPath();
        ctx.rect(cx - 5, cy, 10, t.h);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, cy, 20, 0, Math.PI*2);
        ctx.arc(cx - 15, cy + 10, 15, 0, Math.PI*2);
        ctx.arc(cx + 15, cy + 10, 15, 0, Math.PI*2);
        ctx.fill();
    });

    // Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    cloudsRef.current.forEach(c => {
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.w/3, 0, Math.PI * 2);
      c.bubbles.forEach(b => {
          ctx.arc(c.x + b.dx, c.y + b.dy, b.r, 0, Math.PI * 2);
      });
      ctx.fill();
    });

    // Floor
    const groundY = canvas.height - 100;
    ctx.fillStyle = THEME_COLORS.ground;
    ctx.fillRect(0, groundY, canvas.width, 100);
    ctx.fillStyle = THEME_COLORS.groundHighlight;
    const stripOffset = -(distanceRef.current % 100); 
    for (let i = -100; i < canvas.width + 100; i += 100) {
        ctx.beginPath();
        ctx.roundRect(i + stripOffset, groundY + 10, 20, 10, 5);
        ctx.fill();
    }

    // GROUND DECOR
    groundDecorRef.current.forEach(d => {
        if (d.type === 'GRASS') {
            ctx.fillStyle = THEME_COLORS.grass;
            ctx.beginPath();
            ctx.moveTo(d.x, d.y);
            ctx.lineTo(d.x - 5, d.y - 10 - d.variant*5);
            ctx.lineTo(d.x + 5, d.y);
            ctx.moveTo(d.x, d.y);
            ctx.lineTo(d.x + 3, d.y - 8 - d.variant*5);
            ctx.lineTo(d.x + 8, d.y);
            ctx.fill();
        } else if (d.type === 'FLOWER') {
             ctx.fillStyle = THEME_COLORS.grass;
             ctx.beginPath();
             ctx.moveTo(d.x, d.y);
             ctx.lineTo(d.x, d.y - 8);
             ctx.stroke();
             ctx.fillStyle = THEME_COLORS.flowerPetal;
             ctx.beginPath();
             ctx.arc(d.x, d.y - 10, 4, 0, Math.PI*2);
             ctx.fill();
             ctx.fillStyle = THEME_COLORS.flowerCenter;
             ctx.beginPath();
             ctx.arc(d.x, d.y - 10, 1.5, 0, Math.PI*2);
             ctx.fill();
        } else {
            ctx.fillStyle = THEME_COLORS.stone;
            ctx.beginPath();
            ctx.arc(d.x, d.y, 4 + d.variant * 4, Math.PI, 0);
            ctx.fill();
        }
    });

    drawTrails(ctx);
    drawCharacter(ctx, playerRef.current, distanceRef.current, activeTheme);

    if (!isMenu) {
        obstaclesRef.current.forEach(obs => {
          const cx = obs.x + obs.width/2;
          const cy = obs.y + obs.height/2;

          ctx.lineWidth = 2.5;
          ctx.strokeStyle = THEME_COLORS.outline;
          
          if (obs.type === EntityType.POWERUP) {
              ctx.globalAlpha = 0.8;
              ctx.fillStyle = 'rgba(255,255,255,0.7)';
              ctx.beginPath();
              ctx.arc(cx, cy, obs.width/2 + 2, 0, Math.PI*2);
              ctx.fill();
              ctx.strokeStyle = obs.subtype === 'SHIELD' ? THEME_COLORS.shield : THEME_COLORS.magnet;
              ctx.stroke();
              ctx.globalAlpha = 1.0;
              
              if (obs.subtype === 'SHIELD') {
                  ctx.fillStyle = THEME_COLORS.shield;
                  ctx.beginPath();
                  ctx.moveTo(cx, cy - 8);
                  ctx.bezierCurveTo(cx + 8, cy - 8, cx + 8, cy + 2, cx, cy + 10);
                  ctx.bezierCurveTo(cx - 8, cy + 2, cx - 8, cy - 8, cx, cy - 8);
                  ctx.fill();
              } else {
                  ctx.fillStyle = THEME_COLORS.magnet;
                  ctx.beginPath();
                  ctx.moveTo(cx - 8, cy - 8);
                  ctx.lineTo(cx - 8, cy + 2);
                  ctx.arc(cx, cy + 2, 8, Math.PI, 0, true);
                  ctx.lineTo(cx + 8, cy - 8);
                  ctx.lineTo(cx + 4, cy - 8);
                  ctx.lineTo(cx + 4, cy + 2);
                  ctx.arc(cx, cy + 2, 4, 0, Math.PI, false);
                  ctx.lineTo(cx - 4, cy - 8);
                  ctx.fill();
              }

          } else if (obs.type === EntityType.COIN) {
            ctx.fillStyle = THEME_COLORS.coin;
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 2;
            const wobble = Math.sin(coinRotationRef.current + obs.x * 0.01) * 3;
            drawStar(ctx, cx, cy + wobble, 5, obs.width/2, obs.width/4);
            
            ctx.fillStyle = '#92400e';
            ctx.beginPath();
            ctx.arc(cx - 3, cy - 1 + wobble, 1.5, 0, Math.PI*2);
            ctx.arc(cx + 3, cy - 1 + wobble, 1.5, 0, Math.PI*2);
            ctx.fill();

          } else if (obs.type === EntityType.OBSTACLE_AIR) {
            // Draw Ghost or Bat
            if (obs.subtype === 'BAT') {
                ctx.fillStyle = THEME_COLORS.bat;
                ctx.beginPath();
                // Bat Body
                ctx.ellipse(cx, cy, 12, 12, 0, 0, Math.PI*2);
                ctx.fill();
                ctx.stroke();
                // Wings
                const wingFlap = Math.sin(frameCountRef.current * 0.2) * 5;
                ctx.beginPath();
                ctx.moveTo(cx - 10, cy);
                ctx.quadraticCurveTo(cx - 25, cy - 10 + wingFlap, cx - 10, cy + 10);
                ctx.fill();
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(cx + 10, cy);
                ctx.quadraticCurveTo(cx + 25, cy - 10 + wingFlap, cx + 10, cy + 10);
                ctx.fill();
                ctx.stroke();
                // Eyes
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(cx - 4, cy - 2, 2.5, 0, Math.PI*2);
                ctx.arc(cx + 4, cy - 2, 2.5, 0, Math.PI*2);
                ctx.fill();
            } else {
                // Ghost (default)
                ctx.fillStyle = '#f1f5f9';
                ctx.beginPath();
                ctx.arc(cx, cy - 5, obs.width/2, Math.PI, 0);
                ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
                for(let k=1; k<=3; k++) {
                    ctx.arc(obs.x + obs.width - (obs.width/3)*k + (obs.width/6), obs.y + obs.height, obs.width/6, 0, Math.PI, true);
                }
                ctx.lineTo(obs.x, cy - 5);
                ctx.fill();
                ctx.stroke();
                
                ctx.fillStyle = '#fbcfe8';
                ctx.beginPath();
                ctx.arc(cx - 10, cy, 3, 0, Math.PI*2);
                ctx.arc(cx + 10, cy, 3, 0, Math.PI*2);
                ctx.fill();
                ctx.fillStyle = 'black';
                ctx.beginPath();
                ctx.arc(cx - 6, cy - 4, 3, 0, Math.PI*2);
                ctx.arc(cx + 6, cy - 4, 3, 0, Math.PI*2);
                ctx.fill();
            }
          } else {
            // GROUND OBSTACLES
             if (obs.subtype === 'SPIKE') {
                ctx.fillStyle = THEME_COLORS.spike;
                ctx.beginPath();
                const spikes = 4;
                const step = obs.width / spikes;
                ctx.moveTo(obs.x, obs.y + obs.height);
                for(let k=0; k<spikes; k++) {
                    ctx.bezierCurveTo(obs.x + k*step, obs.y + obs.height - 20, obs.x + k*step - 5, obs.y, obs.x + k*step + step/2, obs.y + 5);
                    ctx.bezierCurveTo(obs.x + (k+1)*step + 5, obs.y, obs.x + (k+1)*step, obs.y + obs.height - 20, obs.x + (k+1)*step, obs.y + obs.height);
                }
                ctx.fill();
                ctx.stroke();
             } else if (obs.subtype === 'CRYSTAL') {
                ctx.fillStyle = THEME_COLORS.crystal;
                ctx.beginPath();
                // Low poly crystal shape
                ctx.moveTo(cx, obs.y);
                ctx.lineTo(obs.x + obs.width, cy);
                ctx.lineTo(cx, obs.y + obs.height);
                ctx.lineTo(obs.x, cy);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                // Shine
                ctx.fillStyle = 'rgba(255,255,255,0.4)';
                ctx.beginPath();
                ctx.moveTo(cx, obs.y + 5);
                ctx.lineTo(cx + 5, cy);
                ctx.lineTo(cx, cy + 10);
                ctx.fill();

             } else if (obs.subtype === 'LOG') {
                 ctx.fillStyle = THEME_COLORS.log;
                 ctx.beginPath();
                 ctx.arc(cx, cy, obs.height/2, 0, Math.PI*2);
                 ctx.fill();
                 ctx.stroke();
                 // Wood Rings (Rotate)
                 const rot = distanceRef.current * 0.1;
                 ctx.save();
                 ctx.translate(cx, cy);
                 ctx.rotate(rot);
                 ctx.fillStyle = THEME_COLORS.logDark;
                 ctx.beginPath();
                 ctx.arc(0, 0, obs.height/3, 0, Math.PI*2);
                 ctx.fill();
                 ctx.restore();

             } else if (obs.subtype === 'FIREBALL') {
                 ctx.fillStyle = THEME_COLORS.fireball;
                 ctx.beginPath();
                 ctx.arc(cx, cy, obs.width/2, 0, Math.PI*2);
                 ctx.fill();
                 ctx.stroke();
                 ctx.fillStyle = THEME_COLORS.fireballCore;
                 ctx.beginPath();
                 ctx.arc(cx, cy, obs.width/3, 0, Math.PI*2);
                 ctx.fill();
                 // Tail
                 ctx.fillStyle = THEME_COLORS.fireball;
                 ctx.beginPath();
                 ctx.moveTo(cx + obs.width/2, cy);
                 ctx.lineTo(cx + obs.width, cy - 10);
                 ctx.lineTo(cx + obs.width - 5, cy);
                 ctx.lineTo(cx + obs.width, cy + 10);
                 ctx.fill();

             } else if (obs.subtype === 'PILLAR') {
                ctx.fillStyle = THEME_COLORS.pillar; 
                ctx.beginPath();
                ctx.moveTo(obs.x + 4, obs.y);
                ctx.lineTo(obs.x + obs.width - 4, obs.y);
                ctx.lineTo(obs.x + obs.width, obs.y + 10);
                ctx.lineTo(obs.x + obs.width, obs.y + obs.height - 10);
                ctx.lineTo(obs.x + obs.width - 4, obs.y + obs.height);
                ctx.lineTo(obs.x + 4, obs.y + obs.height);
                ctx.lineTo(obs.x, obs.y + obs.height - 10);
                ctx.lineTo(obs.x, obs.y + 10);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                ctx.strokeStyle = THEME_COLORS.pillarDark;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(cx - 5, obs.y + 10);
                ctx.lineTo(cx - 5, obs.y + obs.height - 10);
                ctx.moveTo(cx + 5, obs.y + 10);
                ctx.lineTo(cx + 5, obs.y + obs.height - 10);
                ctx.stroke();
                ctx.strokeStyle = THEME_COLORS.vine;
                ctx.lineWidth = 3;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(obs.x, obs.y + obs.height);
                ctx.bezierCurveTo(obs.x + 10, obs.y + obs.height - 20, obs.x + obs.width, obs.y + 20, obs.x + obs.width - 5, obs.y);
                ctx.stroke();
                ctx.fillStyle = THEME_COLORS.vine;
                ctx.beginPath();
                ctx.ellipse(cx, cy, 4, 2, 0.5, 0, Math.PI*2);
                ctx.fill();
             } else {
                ctx.fillStyle = THEME_COLORS.mushroomStem;
                ctx.beginPath();
                ctx.roundRect(cx - 10, cy, 20, obs.height/2, 5);
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = THEME_COLORS.mushroomCap;
                ctx.beginPath();
                ctx.arc(cx, cy, obs.width/2 + 2, Math.PI, 0); 
                ctx.lineTo(cx - obs.width/2 - 2, cy);
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(cx, cy - 12, 4, 0, Math.PI*2);
                ctx.arc(cx - 12, cy - 5, 3, 0, Math.PI*2);
                ctx.arc(cx + 12, cy - 5, 3, 0, Math.PI*2);
                ctx.fill();
                ctx.fillStyle = 'black';
                ctx.beginPath();
                ctx.moveTo(cx - 8, cy + 10);
                ctx.lineTo(cx - 4, cy + 12);
                ctx.stroke();
                ctx.moveTo(cx + 8, cy + 10);
                ctx.lineTo(cx + 4, cy + 12);
                ctx.stroke();
            }
          }
        });
    }

    particlesRef.current.forEach(pt => {
      ctx.globalAlpha = pt.life;
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    });

    requestRef.current = requestAnimationFrame(tick);
  }, [gameState, setGameState, onGameOver, onScoreUpdate, onStarUpdate, onMagnetUpdate, onLevelComplete, activeTheme, levelConfig, playSfx]);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = Math.max(window.innerWidth, 750);
        canvasRef.current.height = window.innerHeight;
        if (playerRef.current) playerRef.current.x = canvasRef.current.width * 0.1;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(tick);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [tick]);

  useEffect(() => {
    if (gameState === GameState.PLAYING) {
      resetGame();
    }
  }, [gameState, resetGame]);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 w-full h-full" />;
};

export default GameCanvas;
