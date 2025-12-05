
import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameCanvas from './components/GameCanvas';
import UIOverlay from './components/UIOverlay';
import { GameState, DailyMission, PlayerStats, CharacterId, LevelConfig, AchievementEntry } from './types';
import { generateDailyMission } from './services/geminiService';
import { CHARACTER_THEMES, BGM_URL, LEVELS, SHOP_ITEMS } from './constants';

const createSynthesizer = () => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return null;
  const ctx = new AudioContext();

  const playTone = (freq: number, type: OscillatorType, duration: number, vol = 0.1) => {
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + duration);
  };

  const playJump = () => {
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(300, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  };

  const playDoubleJump = () => {
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  };

  const playCoin = () => {
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08); 
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  };

  const playHit = () => {
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  };
  
  const playPowerup = () => {
      playTone(440, 'sine', 0.1);
      setTimeout(() => playTone(554, 'sine', 0.1), 50);
      setTimeout(() => playTone(659, 'sine', 0.2), 100);
  };
  
  const playSlide = () => {
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(50, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
  };
  
  const playGameOver = () => {
       playTone(300, 'sawtooth', 0.3);
       setTimeout(() => playTone(250, 'sawtooth', 0.3), 200);
       setTimeout(() => playTone(200, 'sawtooth', 0.6), 400);
  };

  const playGameStart = () => {
      playTone(523.25, 'sine', 0.1); 
      setTimeout(() => playTone(659.25, 'sine', 0.1), 100); 
      setTimeout(() => playTone(783.99, 'sine', 0.2), 200); 
      setTimeout(() => playTone(1046.5, 'sine', 0.3), 300); 
  };

  const playMissionComplete = () => {
      playTone(523.25, 'square', 0.1); 
      setTimeout(() => playTone(523.25, 'square', 0.1), 100); 
      setTimeout(() => playTone(523.25, 'square', 0.1), 200); 
      setTimeout(() => playTone(783.99, 'square', 0.6), 300); 
  };
  
  const playLevelComplete = () => {
      // Longer fanfare
      playTone(523.25, 'sine', 0.15); // C
      setTimeout(() => playTone(659.25, 'sine', 0.15), 150); // E
      setTimeout(() => playTone(783.99, 'sine', 0.15), 300); // G
      setTimeout(() => playTone(1046.50, 'sine', 0.4), 450); // High C
  };

  return {
    jump: playJump,
    doubleJump: playDoubleJump,
    coin: playCoin,
    hit: playHit,
    powerup: playPowerup,
    gameOver: playGameOver,
    slide: playSlide,
    gameStart: playGameStart,
    missionComplete: playMissionComplete,
    levelComplete: playLevelComplete
  };
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [score, setScore] = useState(0);
  const [starsCollected, setStarsCollected] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [mission, setMission] = useState<DailyMission | null>(null);
  const [missionLoading, setMissionLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [magnetProgress, setMagnetProgress] = useState(0);
  
  // Revive / Achievement State
  const [isReviving, setIsReviving] = useState(false);
  const [hasUsedShareRevive, setHasUsedShareRevive] = useState(false);
  const [isAchievementEligible, setIsAchievementEligible] = useState(true);

  // Achievement / Leaderboard Data
  const [achievements, setAchievements] = useState<AchievementEntry[]>(() => {
      const saved = localStorage.getItem('cloud_hopper_achievements');
      return saved ? JSON.parse(saved) : [];
  });

  // Track Level 5 Run Stats
  const [levelRunStats, setLevelRunStats] = useState({
      startTime: 0,
      revivesUsed: 0,
      retryCount: 0
  });

  // Persistent Stats
  const [stats, setStats] = useState<PlayerStats>(() => {
      const saved = localStorage.getItem('cloud_hopper_stats');
      if (saved) {
          const loaded = JSON.parse(saved);
          return {
              ...loaded,
              maxLevelReached: loaded.maxLevelReached || 1, // Backward compatibility
              revivePotions: loaded.revivePotions || 0,
              playerName: loaded.playerName || ''
          };
      }
      return {
          totalCoins: 0,
          totalScore: 0,
          highScore: 0,
          unlockedCharacters: ['classic'],
          selectedCharacter: 'classic',
          maxLevelReached: 1,
          revivePotions: 0,
          playerName: ''
      };
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthRef = useRef<ReturnType<typeof createSynthesizer>>(null);

  // Lazy Initialize Audio to speed up initial page load
  const initAudio = useCallback(() => {
    if (!audioRef.current) {
        audioRef.current = new Audio(BGM_URL);
        audioRef.current.loop = true;
        audioRef.current.volume = 0.3;
    }
    if (!synthRef.current) {
        synthRef.current = createSynthesizer();
    }
  }, []);

  const toggleAudio = () => {
      initAudio();
      if (audioRef.current) {
          if (isMuted) {
              audioRef.current.play().catch(e => console.log("Audio play blocked", e));
              setIsMuted(false);
          } else {
              audioRef.current.pause();
              setIsMuted(true);
          }
      }
  };

  const playBGM = () => {
      initAudio();
      if (audioRef.current && !isMuted && audioRef.current.paused) {
          audioRef.current.play().catch(e => console.log("Audio play failed", e));
      }
  };

  const playSfx = useCallback((type: 'jump' | 'doubleJump' | 'slide' | 'coin' | 'powerup' | 'hit' | 'gameOver' | 'gameStart' | 'missionComplete' | 'levelComplete') => {
    if (isMuted) return;
    // Ensure synth is initialized (in case playSfx is called before game start, e.g. menu interaction)
    if (!synthRef.current) {
        synthRef.current = createSynthesizer();
    }
    if (synthRef.current && synthRef.current[type]) {
        synthRef.current[type]();
    }
  }, [isMuted]);

  useEffect(() => {
      localStorage.setItem('cloud_hopper_stats', JSON.stringify(stats));
  }, [stats]);
  
  useEffect(() => {
      localStorage.setItem('cloud_hopper_achievements', JSON.stringify(achievements));
  }, [achievements]);

  useEffect(() => {
    handleGenerateMission();
  }, []);

  const handleGenerateMission = useCallback(async () => {
    setMissionLoading(true);
    const newMission = await generateDailyMission();
    setMission(newMission);
    setMissionLoading(false);
  }, []);

  const handleStart = (levelId: number) => {
    initAudio(); // Initialize audio context on user interaction
    setCurrentLevel(levelId);
    setScore(0);
    setStarsCollected(0);
    setMagnetProgress(0);
    
    // Reset Revive State for new run
    setHasUsedShareRevive(false);
    setIsReviving(false);
    setIsAchievementEligible(true);
    
    // Reset or Initialize Level Run Stats
    setLevelRunStats(prev => ({
        startTime: Date.now(),
        revivesUsed: 0,
        retryCount: levelId === 5 ? prev.retryCount : 0 // Keep retries if staying on lvl 5, else reset? Let's keep logic simple: reset on Menu, increment on Retry
    }));

    setGameState(GameState.PLAYING);
    playBGM();
    playSfx('gameStart');
  };

  const handlePause = () => {
      setGameState(GameState.PAUSED);
  };

  const handleResume = () => {
      setGameState(GameState.PLAYING);
      playBGM();
  };

  const handleQuit = () => {
      setGameState(GameState.MENU);
      // Reset level 5 retries when quitting to menu
      setLevelRunStats({ startTime: 0, revivesUsed: 0, retryCount: 0 });
      setHasUsedShareRevive(false);
  };

  const handleShareRevive = () => {
      // 1. Mark as used
      setHasUsedShareRevive(true);
      // 2. Disqualify from achievements
      setIsAchievementEligible(false);
      // 3. Set reviving flag
      setIsReviving(true);
      // 4. Resume Game
      setGameState(GameState.PLAYING);
      playSfx('powerup');
      playBGM();
  };

  const handleReviveComplete = useCallback(() => {
      setIsReviving(false);
  }, []);
  
  const handleLevelComplete = () => {
      // Level 5 Achievement Check
      if (currentLevel === 5 && isAchievementEligible) {
          const endTime = Date.now();
          const timeTaken = Math.floor((endTime - levelRunStats.startTime) / 1000);
          
          const newAchievement: AchievementEntry = {
              id: Date.now().toString(),
              playerName: stats.playerName || 'Anonymous',
              timeTaken: timeTaken,
              revivesUsed: levelRunStats.revivesUsed,
              retryCount: levelRunStats.retryCount,
              date: new Date().toLocaleDateString(),
              characterId: stats.selectedCharacter
          };
          
          setAchievements(prev => [...prev, newAchievement]);
      }

      // Unlock next level logic
      if (currentLevel < 5 && stats.maxLevelReached <= currentLevel) {
          setStats(prev => ({
              ...prev,
              maxLevelReached: currentLevel + 1
          }));
      }
      playSfx('levelComplete');
  };

  const handleGameOver = (final: number) => {
    setFinalScore(final);
    let coinsEarned = Math.floor(final / 20); 
    let missionBonus = 0;
    if (mission && final >= mission.targetScore) {
        missionBonus = 100; 
        playSfx('missionComplete');
    }
    coinsEarned += starsCollected * 5; 
    
    // Increment retry count for this session if it's Level 5
    if (currentLevel === 5) {
        setLevelRunStats(prev => ({ ...prev, retryCount: prev.retryCount + 1 }));
    }

    setStats(prev => ({
        ...prev,
        totalScore: prev.totalScore + final,
        highScore: Math.max(prev.highScore, final),
        totalCoins: prev.totalCoins + coinsEarned + missionBonus
    }));
  };

  const handleScoreUpdate = useCallback((newScore: number) => {
      setScore(newScore);
  }, []);

  const handleStarUpdate = useCallback((stars: number) => {
      setStarsCollected(stars);
  }, []);

  const handleMagnetUpdate = useCallback((progress: number) => {
      setMagnetProgress(progress);
  }, []);

  const handleBuyCharacter = (id: CharacterId) => {
      const char = CHARACTER_THEMES[id];
      if (stats.totalCoins >= char.price) {
          setStats(prev => ({
              ...prev,
              totalCoins: prev.totalCoins - char.price,
              unlockedCharacters: [...prev.unlockedCharacters, id],
              selectedCharacter: id
          }));
      }
  };

  const handleSelectCharacter = (id: CharacterId) => {
      if (stats.unlockedCharacters.includes(id)) {
          setStats(prev => ({ ...prev, selectedCharacter: id }));
      }
  };
  
  const handleBuyShopItem = (itemId: string) => {
      if (itemId === SHOP_ITEMS.revivePotion.id) {
          if (stats.totalCoins >= SHOP_ITEMS.revivePotion.price) {
              setStats(prev => ({
                  ...prev,
                  totalCoins: prev.totalCoins - SHOP_ITEMS.revivePotion.price,
                  revivePotions: (prev.revivePotions || 0) + 1
              }));
              playSfx('powerup');
          }
      }
  };
  
  const handleConsumeRevive = () => {
      setStats(prev => ({
          ...prev,
          revivePotions: Math.max(0, (prev.revivePotions || 0) - 1)
      }));
      // Track usage for achievement
      if (currentLevel === 5) {
          setLevelRunStats(prev => ({ ...prev, revivesUsed: prev.revivesUsed + 1 }));
      }
  };

  const handleSetName = (name: string) => {
      setStats(prev => ({ ...prev, playerName: name }));
  };

  // Get current level config
  const currentLevelConfig = LEVELS.find(l => l.id === currentLevel) || LEVELS[0];

  return (
    <div className="relative w-screen h-screen bg-sky-50 overflow-hidden font-sans select-none">
      <GameCanvas 
        gameState={gameState} 
        setGameState={setGameState}
        onScoreUpdate={handleScoreUpdate}
        onStarUpdate={handleStarUpdate}
        onMagnetUpdate={handleMagnetUpdate}
        onGameOver={handleGameOver}
        onLevelComplete={handleLevelComplete}
        activeTheme={CHARACTER_THEMES[stats.selectedCharacter]}
        playSfx={playSfx}
        levelConfig={currentLevelConfig}
        revivePotions={stats.revivePotions}
        onConsumeRevive={handleConsumeRevive}
        isReviving={isReviving}
        onReviveComplete={handleReviveComplete}
      />
      <UIOverlay 
        gameState={gameState}
        score={score}
        starsCollected={starsCollected}
        finalScore={finalScore}
        mission={mission}
        missionLoading={missionLoading}
        onStart={handleStart}
        onGenerateMission={handleGenerateMission}
        onPause={handlePause}
        onResume={handleResume}
        onQuit={handleQuit}
        stats={stats}
        onBuyCharacter={handleBuyCharacter}
        onSelectCharacter={handleSelectCharacter}
        isMuted={isMuted}
        toggleAudio={toggleAudio}
        currentLevelConfig={currentLevelConfig}
        magnetProgress={magnetProgress}
        onBuyShopItem={handleBuyShopItem}
        onSetName={handleSetName}
        achievements={achievements}
        onShareRevive={handleShareRevive}
        hasUsedShareRevive={hasUsedShareRevive}
      />
    </div>
  );
};

export default App;
