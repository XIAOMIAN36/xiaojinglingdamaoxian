
import React, { useState, useEffect } from 'react';
import { GameState, DailyMission, CharacterTheme, CharacterId, PlayerStats, LevelConfig, AchievementEntry } from '../types';
import { Trophy, RefreshCw, Zap, Skull, Play, RotateCcw, Pause, Home, Star, Lock, CheckCircle, Music, Music2, ArrowLeft, Share2, ArrowRight, ShoppingCart, Heart, Dice5, Medal, AlertTriangle } from 'lucide-react';
import { CHARACTER_THEMES, LEVELS, SHOP_ITEMS, RANDOM_NAMES, MOCK_LEADERBOARD } from '../constants';

interface UIOverlayProps {
  gameState: GameState;
  score: number;
  starsCollected: number;
  finalScore: number;
  mission: DailyMission | null;
  missionLoading: boolean;
  onStart: (levelId: number) => void;
  onGenerateMission: () => void;
  onPause: () => void;
  onResume: () => void;
  onQuit: () => void;
  stats: PlayerStats;
  onBuyCharacter: (id: CharacterId) => void;
  onSelectCharacter: (id: CharacterId) => void;
  isMuted: boolean;
  toggleAudio: () => void;
  currentLevelConfig: LevelConfig;
  magnetProgress: number;
  onBuyShopItem: (itemId: string) => void;
  onSetName: (name: string) => void;
  achievements: AchievementEntry[];
  onShareRevive: () => void;
  hasUsedShareRevive: boolean;
}

const CharacterAvatar = ({ theme }: { theme: CharacterTheme }) => (
    <div className="relative w-20 h-20 shrink-0">
        {/* Hat Tip (Background) */}
        <div className="absolute -top-3 right-0 w-8 h-8 rounded-full origin-bottom rotate-[20deg]" 
             style={{ backgroundColor: theme.colors.hat }}></div>

        {/* Head */}
        <div className="absolute top-4 left-2 w-16 h-14 rounded-full border-2 overflow-visible shadow-sm z-10"
             style={{ backgroundColor: theme.colors.body, borderColor: theme.colors.outline }}>
             
             {/* Left Ear */}
             <div className="absolute -top-3 left-1 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[16px]"
                 style={{ borderBottomColor: theme.colors.body }}></div>
             {/* Right Ear */}
             <div className="absolute -top-3 right-1 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[16px]"
                 style={{ borderBottomColor: theme.colors.body }}></div>
             
             {/* Eyes */}
             <div className="absolute top-4 left-4 w-2 h-2 rounded-full z-20" style={{ backgroundColor: theme.colors.face }}>
                 {theme.id !== 'ninja' && <div className="absolute top-0.5 left-0.5 w-0.5 h-0.5 bg-white rounded-full"></div>}
             </div>
             <div className="absolute top-4 right-4 w-2 h-2 rounded-full z-20" style={{ backgroundColor: theme.colors.face }}>
                 {theme.id !== 'ninja' && <div className="absolute top-0.5 left-0.5 w-0.5 h-0.5 bg-white rounded-full"></div>}
             </div>
             
             {/* Cheeks */}
             <div className="absolute top-6 left-2 w-3 h-1.5 bg-pink-400/30 rounded-full blur-[1px] z-10"></div>
             <div className="absolute top-6 right-2 w-3 h-1.5 bg-pink-400/30 rounded-full blur-[1px] z-10"></div>
             
             {/* Nose */}
             <div className="absolute top-5 left-1/2 -translate-x-1/2 w-2 h-1.5 rounded-full" style={{ backgroundColor: theme.colors.face }}></div>
        </div>
        
        {/* Hat (Foreground) */}
        <div className="absolute -top-2 left-0 w-20 h-6 z-20" style={{ backgroundColor: theme.colors.hat, borderRadius: '50%' }}></div>
        <div className="absolute -top-12 left-4 w-12 h-16 z-10" 
             style={{ 
                 background: `conic-gradient(from 150deg at 50% 100%, ${theme.colors.hat} 0deg, ${theme.colors.hat} 60deg, transparent 60deg)` 
             }}></div>
        <div className="absolute top-0 left-4 w-12 h-2 z-20" style={{ backgroundColor: theme.colors.hatBand }}></div>
        {/* Star on hat */}
        <div className="absolute -top-2 left-8 w-2 h-2 bg-yellow-300 rounded-full z-30 shadow-sm animate-pulse"></div>
    </div>
);

const UIOverlay: React.FC<UIOverlayProps> = ({
  gameState,
  score,
  starsCollected,
  finalScore,
  mission,
  missionLoading,
  onStart,
  onGenerateMission,
  onPause,
  onResume,
  onQuit,
  stats,
  onBuyCharacter,
  onSelectCharacter,
  isMuted,
  toggleAudio,
  currentLevelConfig,
  magnetProgress,
  onBuyShopItem,
  onSetName,
  achievements,
  onShareRevive,
  hasUsedShareRevive
}) => {
  const [showCharSelect, setShowCharSelect] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showShareHint, setShowShareHint] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [tempName, setTempName] = useState('');
  const [showNameModal, setShowNameModal] = useState(false);

  useEffect(() => {
    if (!stats.playerName) {
        setShowNameModal(true);
        setTempName(getRandomName());
    }
  }, [stats.playerName]);

  const handleShareClick = () => {
    setShowShareHint(true);
  };

  const getRandomName = () => {
      return RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
  };

  const handleRandomizeName = () => {
      setTempName(getRandomName());
  };

  const handleConfirmName = () => {
      if (tempName.trim()) {
          onSetName(tempName.trim());
          setShowNameModal(false);
      }
  };
  
  // Combine player achievements with mock leaderboard and sort by time (asc)
  const sortedAchievements = [...MOCK_LEADERBOARD, ...achievements].sort((a, b) => a.timeTaken - b.timeTaken);

  return (
    <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-6">
      
      {/* Name Input Modal */}
      {showNameModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-md flex items-center justify-center pointer-events-auto">
            <div className="bg-white p-8 rounded-3xl shadow-2xl w-80 text-center animate-bounce-in">
                <h2 className="text-2xl font-black text-slate-800 mb-4">欢迎来到冒险!</h2>
                <p className="text-slate-500 mb-6 text-sm">给自己取个响亮的名字吧</p>
                <div className="flex gap-2 mb-6">
                    <input 
                        type="text" 
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        className="flex-1 bg-slate-100 border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-bold focus:border-blue-400 outline-none"
                        maxLength={10}
                    />
                    <button onClick={handleRandomizeName} className="bg-blue-100 text-blue-500 p-3 rounded-xl hover:bg-blue-200">
                        <Dice5 size={24} />
                    </button>
                </div>
                <button onClick={handleConfirmName} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-transform active:scale-95">
                    开始旅程
                </button>
            </div>
        </div>
      )}

      {/* Top Bar (HUD / Stats) */}
      <div className="relative z-20 flex justify-between items-start w-full pointer-events-auto">
         {/* Stats (Visible in Menu) */}
         {gameState === GameState.MENU && (
             <div className="flex flex-wrap gap-2 sm:gap-4">
                 <div className="bg-white/90 backdrop-blur text-slate-700 px-3 py-2 sm:px-4 rounded-xl border border-blue-100 shadow-sm flex items-center gap-2">
                    <span className="font-black text-xs sm:text-sm text-blue-500">{stats.playerName || 'Guest'}</span>
                </div>
                <div className="bg-white/90 backdrop-blur text-slate-700 px-3 py-2 sm:px-4 rounded-xl border border-blue-100 shadow-sm flex items-center gap-2">
                    <Star className="text-yellow-400 fill-yellow-400" size={18} />
                    <span className="font-bold text-sm sm:text-base">{stats.totalCoins}</span>
                </div>
                {/* Revive Potion Count in Menu */}
                 <div className="bg-white/90 backdrop-blur text-slate-700 px-3 py-2 sm:px-4 rounded-xl border border-blue-100 shadow-sm flex items-center gap-2">
                    <Heart className="text-pink-500 fill-pink-500" size={18} />
                    <span className="font-bold text-sm sm:text-base">{stats.revivePotions || 0}</span>
                </div>
                <button onClick={toggleAudio} className="bg-white/90 p-2 rounded-xl border border-blue-100 shadow-sm hover:bg-blue-50 transition-transform active:scale-95">
                    {isMuted ? <Music2 className="text-slate-400" size={20} /> : <Music className="text-blue-500" size={20} />}
                </button>
             </div>
         )}
         
         {/* In-Game HUD */}
         {(gameState === GameState.PLAYING || gameState === GameState.PAUSED) && (
            <div className="absolute top-6 left-0 right-0 flex flex-col items-center pointer-events-none">
                 {/* Star Progress Bar - Smaller Version */}
                 <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-yellow-200 shadow-md flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-2">
                        <Star className="text-yellow-400 fill-yellow-400" size={20} />
                        <span className="text-xl font-black text-slate-800">{starsCollected}</span>
                        <span className="text-base font-bold text-slate-400">/</span>
                        <span className="text-lg font-bold text-slate-500">{currentLevelConfig.targetStars}</span>
                    </div>
                 </div>
                 
                 {/* Revive Status */}
                 {stats.revivePotions > 0 && (
                     <div className="bg-pink-50/80 backdrop-blur-md px-3 py-1 rounded-full border border-pink-200 shadow-sm flex items-center gap-2 mb-2">
                        <Heart size={16} className="text-pink-500 fill-pink-500" />
                        <span className="text-sm font-bold text-pink-700">x{stats.revivePotions}</span>
                     </div>
                 )}

                 {/* Magnet Timer */}
                 {magnetProgress > 0 && (
                     <div className="bg-red-50/90 backdrop-blur px-3 py-1 rounded-full border border-red-100 shadow-sm flex items-center gap-2 animate-pulse">
                        <Zap size={14} className="text-red-500 fill-red-500" />
                        <div className="w-16 h-1.5 bg-red-200 rounded-full overflow-hidden">
                            <div className="h-full bg-red-500 transition-all duration-100 ease-linear" style={{ width: `${magnetProgress * 100}%` }}></div>
                        </div>
                     </div>
                 )}
            </div>
         )}

         {/* Right Side Controls */}
         <div className="flex flex-col items-end gap-2 ml-auto">
            {gameState === GameState.PLAYING && (
                <div className="flex gap-2">
                    <button onClick={toggleAudio} className="bg-white/80 p-3 rounded-full hover:bg-white shadow-lg transition-transform hover:scale-105 active:scale-95">
                        {isMuted ? <Music2 className="text-slate-400" size={20} /> : <Music className="text-blue-500" size={20} />}
                    </button>
                    <button onClick={onPause} className="bg-white/80 p-3 rounded-full hover:bg-white shadow-lg transition-transform hover:scale-105 active:scale-95">
                        <Pause fill="#475569" className="text-slate-600" />
                    </button>
                </div>
            )}
            {/* Score HUD for score lovers (Optional secondary HUD) */}
            {(gameState === GameState.PLAYING || gameState === GameState.PAUSED) && (
                 <div className="bg-white/50 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-blue-500 mt-2">
                     Score: {score}
                 </div>
            )}
         </div>
      </div>
      
      {/* Mobile Hint (Only shows for a few seconds if we had state, but static is fine for now) */}
      {gameState === GameState.PLAYING && (
          <div className="absolute bottom-10 left-0 right-0 text-center pointer-events-none opacity-50 animate-pulse">
              <span className="text-slate-500 text-xs font-bold bg-white/50 px-2 py-1 rounded-full">
                👆 点按跳跃 &nbsp;|&nbsp; 👇 下滑翻滚
              </span>
          </div>
      )}

      {/* Main Menu */}
      {gameState === GameState.MENU && !showCharSelect && !showShop && !showAchievements && !showNameModal && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
          <div className="max-w-md w-full bg-white/90 border border-blue-100 p-8 rounded-3xl shadow-xl text-center relative overflow-hidden ring-4 ring-blue-50 backdrop-blur-md mx-4 max-h-[90vh] overflow-y-auto">
            
            <h1 className="text-4xl sm:text-5xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-400 mb-2 transform -skew-x-6">
              小精灵大冒险
            </h1>
            <p className="text-slate-400 mb-6 font-medium">Jump, Slide & Fly!</p>

            {/* Level Selector */}
            <div className="mb-6">
                <div className="text-left text-sm font-bold text-slate-500 mb-2 flex justify-between items-center">
                    <span>选择关卡</span>
                    <span className="text-xs text-blue-400">当前进度: 第 {stats.maxLevelReached} 关</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                    {LEVELS.map((level) => {
                        const isLocked = level.id > stats.maxLevelReached;
                        return (
                            <button
                                key={level.id}
                                disabled={isLocked}
                                onClick={() => onStart(level.id)}
                                className={`aspect-square rounded-xl flex flex-col items-center justify-center font-black text-lg transition-all
                                    ${isLocked 
                                        ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
                                        : 'bg-blue-100 text-blue-600 hover:bg-blue-500 hover:text-white hover:scale-105 shadow-sm'
                                    }`}
                            >
                                {isLocked ? <Lock size={16} /> : level.id}
                            </button>
                        );
                    })}
                </div>
                <div className="text-xs text-slate-400 mt-2 text-right">
                    {LEVELS[stats.maxLevelReached-1]?.description || "未知领域"}
                </div>
            </div>

            <div className="flex gap-2">
                <button
                onClick={() => setShowShop(true)}
                className="flex-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 font-bold py-3 rounded-2xl shadow-sm transition-all flex flex-col items-center justify-center gap-1"
                >
                <ShoppingCart size={20} />
                <span className="text-[10px] uppercase tracking-wide">商店</span>
                </button>
                
                <button
                onClick={() => setShowCharSelect(true)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-2xl shadow-sm transition-all flex flex-col items-center justify-center gap-1"
                >
                <span className="text-xl">😺</span>
                <span className="text-[10px] uppercase tracking-wide">角色</span>
                </button>

                <button
                onClick={() => setShowAchievements(true)}
                className="flex-1 bg-purple-100 hover:bg-purple-200 text-purple-700 font-bold py-3 rounded-2xl shadow-sm transition-all flex flex-col items-center justify-center gap-1"
                >
                <Medal size={20} />
                <span className="text-[10px] uppercase tracking-wide">成就</span>
                </button>
            </div>
            
            <button
            onClick={() => onStart(stats.maxLevelReached)}
            className="w-full mt-4 bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-black py-4 rounded-2xl text-xl shadow-lg shadow-blue-200 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
            <Play fill="white" size={24} /> 继续冒险
            </button>
            
             <button
               onClick={handleShareClick}
               className="mt-4 text-blue-400 font-bold text-sm flex items-center justify-center gap-2 w-full hover:text-blue-600"
             >
               <Share2 size={16} /> 邀请好友
             </button>
            
          </div>
        </div>
      )}

      {/* Shop Modal */}
      {gameState === GameState.MENU && showShop && (
          <div className="fixed inset-0 z-50 bg-slate-50 overflow-hidden flex flex-col pointer-events-auto">
              <div className="flex items-center p-4 bg-white shadow-sm z-10 sticky top-0">
                  <button onClick={() => setShowShop(false)} className="bg-slate-100 p-2 rounded-full hover:bg-slate-200 transition-colors mr-4">
                      <ArrowLeft size={24} className="text-slate-700" />
                  </button>
                  <h2 className="text-xl font-black text-slate-800">道具商店</h2>
                  <div className="ml-auto flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-bold">
                      <Star size={14} fill="currentColor" /> {stats.totalCoins}
                  </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center">
                  <div className="bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-sm w-full max-w-md flex items-center gap-4">
                      <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center">
                          <Heart size={32} className="text-pink-500 fill-pink-500" />
                      </div>
                      <div className="flex-1">
                          <h3 className="font-bold text-lg text-slate-800">{SHOP_ITEMS.revivePotion.name}</h3>
                          <p className="text-sm text-slate-500">{SHOP_ITEMS.revivePotion.description}</p>
                          <p className="text-xs text-blue-500 font-bold mt-1">当前拥有: {stats.revivePotions || 0}</p>
                      </div>
                      <button 
                        onClick={() => onBuyShopItem(SHOP_ITEMS.revivePotion.id)}
                        disabled={stats.totalCoins < SHOP_ITEMS.revivePotion.price}
                        className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-1 transition-colors
                            ${stats.totalCoins >= SHOP_ITEMS.revivePotion.price 
                                ? 'bg-yellow-400 hover:bg-yellow-500 text-yellow-900 shadow-sm' 
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                      >
                          <Star size={14} fill="currentColor" /> {SHOP_ITEMS.revivePotion.price}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Achievement Hall of Fame Modal */}
      {gameState === GameState.MENU && showAchievements && (
           <div className="fixed inset-0 z-50 bg-slate-50 overflow-hidden flex flex-col pointer-events-auto">
              <div className="flex items-center p-4 bg-white shadow-sm z-10 sticky top-0">
                  <button onClick={() => setShowAchievements(false)} className="bg-slate-100 p-2 rounded-full hover:bg-slate-200 transition-colors mr-4">
                      <ArrowLeft size={24} className="text-slate-700" />
                  </button>
                  <h2 className="text-xl font-black text-slate-800">荣耀殿堂 (第5关)</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                  <div className="max-w-2xl mx-auto space-y-4">
                      <div className="bg-purple-100 p-4 rounded-2xl text-purple-900 text-sm font-bold text-center">
                          只有通关第五关的勇者才能在此留名！
                      </div>
                      
                      {sortedAchievements.length === 0 ? (
                          <div className="text-center text-slate-400 mt-10">暂无通关记录，快去挑战吧！</div>
                      ) : (
                          sortedAchievements.map((entry, index) => (
                              <div key={index} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-4">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-white ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-slate-300' : index === 2 ? 'bg-orange-300' : 'bg-slate-100 text-slate-400'}`}>
                                      {index + 1}
                                  </div>
                                  <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                          <span className="font-bold text-slate-800">{entry.playerName}</span>
                                          <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">{CHARACTER_THEMES[entry.characterId]?.name || 'Unknown'}</span>
                                      </div>
                                      <div className="text-xs text-slate-400">{entry.date}</div>
                                  </div>
                                  <div className="text-right text-xs text-slate-500 flex flex-col gap-1">
                                      <div className="font-mono font-bold text-blue-600 text-sm">{entry.timeTaken}秒</div>
                                      <div>复活: {entry.revivesUsed} | 重试: {entry.retryCount}</div>
                                  </div>
                              </div>
                          ))
                      )}
                  </div>
              </div>
           </div>
      )}

      {/* Character Selector Modal */}
      {gameState === GameState.MENU && showCharSelect && (
          <div className="fixed inset-0 z-50 bg-slate-50 overflow-hidden flex flex-col pointer-events-auto">
              <div className="flex items-center p-4 bg-white shadow-sm z-10 sticky top-0">
                  <button onClick={() => setShowCharSelect(false)} className="bg-slate-100 p-2 rounded-full hover:bg-slate-200 transition-colors mr-4">
                      <ArrowLeft size={24} className="text-slate-700" />
                  </button>
                  <h2 className="text-xl font-black text-slate-800">选择角色</h2>
                  <div className="ml-auto flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-bold">
                      <Star size={14} fill="currentColor" /> {stats.totalCoins}
                  </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-20 max-w-5xl mx-auto">
                    {Object.values(CHARACTER_THEMES).map((theme) => {
                        const isUnlocked = stats.unlockedCharacters.includes(theme.id);
                        const isSelected = stats.selectedCharacter === theme.id;
                        const canAfford = stats.totalCoins >= theme.price;
                        return (
                            <div key={theme.id} className={`bg-white rounded-3xl p-4 border-2 shadow-sm transition-all flex items-center gap-4 relative overflow-hidden ${isSelected ? 'border-blue-400 ring-2 ring-blue-100' : 'border-slate-100'}`}>
                               {isSelected && <div className="absolute top-0 right-0 bg-blue-400 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase">已装备</div>}
                               <div className={`relative rounded-2xl p-1 ${isUnlocked ? '' : 'opacity-50 grayscale'}`}>
                                    <CharacterAvatar theme={theme} />
                                    {!isUnlocked && <div className="absolute inset-0 flex items-center justify-center"><div className="bg-black/60 p-2 rounded-full"><Lock className="text-white" size={20} /></div></div>}
                               </div>
                               <div className="flex-1 min-w-0">
                                   <h3 className="font-bold text-lg text-slate-800 truncate">{theme.name}</h3>
                                   <p className="text-xs text-slate-500 font-medium leading-tight mb-3 line-clamp-2 h-8">{theme.ability}</p>
                                   {isUnlocked ? (
                                       <button onClick={() => onSelectCharacter(theme.id)} className={`w-full py-2 rounded-xl font-bold text-sm transition-colors ${isSelected ? 'bg-green-100 text-green-700 cursor-default' : 'bg-slate-800 text-white hover:bg-slate-700'}`}>{isSelected ? '使用中' : '选择'}</button>
                                   ) : (
                                       <button onClick={() => onBuyCharacter(theme.id)} disabled={!canAfford} className={`w-full py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-1 transition-colors ${canAfford ? 'bg-yellow-400 hover:bg-yellow-500 text-yellow-900 shadow-sm shadow-yellow-200' : 'bg-slate-200 text-slate-400'}`}><Star size={14} fill="currentColor" /> {theme.price}</button>
                                   )}
                               </div>
                            </div>
                        );
                    })}
                </div>
              </div>
          </div>
      )}

      {/* Pause Menu */}
      {gameState === GameState.PAUSED && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-900/20 backdrop-blur-sm pointer-events-auto z-50">
             <div className="bg-white p-8 rounded-3xl shadow-2xl text-center w-80 animate-fade-in-up mx-4">
                 <h2 className="text-2xl font-black text-slate-800 mb-6">暂停</h2>
                 <div className="flex flex-col gap-3">
                     <button onClick={onResume} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"><Play size={20} fill="white" /> 继续游戏</button>
                     <button onClick={onQuit} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-xl flex items-center justify-center gap-2"><Home size={20} /> 返回主菜单</button>
                 </div>
             </div>
          </div>
      )}

      {/* Level Complete Screen */}
      {gameState === GameState.LEVEL_COMPLETE && (
        <div className="absolute inset-0 flex items-center justify-center bg-yellow-500/20 backdrop-blur-md pointer-events-auto z-50">
           <div className="max-w-sm w-full bg-white border border-yellow-100 p-8 rounded-3xl shadow-2xl text-center ring-4 ring-yellow-100 animate-bounce-in mx-4">
               <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 ring-4 ring-yellow-200">
                   <Trophy size={48} className="text-yellow-500 fill-yellow-500" />
               </div>
               <h2 className="text-3xl font-black text-slate-800 mb-2">关卡完成!</h2>
               <p className="text-slate-500 mb-8 font-medium">太棒了！所有的星星都收集到了！</p>
               
               <button 
                  onClick={() => {
                      // Check if there is a next level
                      if (currentLevelConfig.id < 5) {
                          onStart(currentLevelConfig.id + 1);
                      } else {
                          onQuit(); // Back to menu if finished game
                      }
                  }}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-black py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 mb-3 transform hover:scale-105"
               >
                   {currentLevelConfig.id < 5 ? (
                       <>下一关 <ArrowRight size={20} /></>
                   ) : (
                       <>通关全游戏! <Home size={20} /></>
                   )}
               </button>
               <button onClick={onQuit} className="text-slate-400 hover:text-slate-600 font-bold text-sm">返回主菜单</button>
           </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === GameState.GAME_OVER && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-900/10 backdrop-blur-md pointer-events-auto z-50">
          <div className="max-w-sm w-full bg-white border border-blue-100 p-8 rounded-3xl shadow-2xl text-center ring-4 ring-white animate-fade-in-up mx-4">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <Skull size={40} className="text-red-400" />
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-1">你失败了</h2>
            <p className="text-slate-500 font-bold mb-1">{stats.playerName}</p>
            <p className="text-slate-400 mb-6 text-sm">离通关还差一点点...</p>
            
            <div className="flex flex-col gap-2 mb-6">
                <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100 text-sm font-bold flex items-center justify-center gap-2 text-yellow-700">
                    <Star size={16} fill="currentColor" />
                    <span>进度: {starsCollected} / {currentLevelConfig.targetStars}</span>
                </div>
            </div>

            {/* Level 5 Conditional Share Revive */}
            {currentLevelConfig.id === 5 && !hasUsedShareRevive && (
                <div className="mb-4 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                     <button 
                        onClick={onShareRevive}
                        className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-md flex items-center justify-center gap-2 mb-1"
                     >
                        <Share2 size={18} /> 分享复活 (2秒无敌)
                     </button>
                     <div className="text-[10px] text-indigo-400 flex items-center justify-center gap-1">
                        <AlertTriangle size={10} /> 使用此复活将不计入通关成就
                     </div>
                </div>
            )}

            <button onClick={() => onStart(currentLevelConfig.id)} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 mb-3">
              <RotateCcw size={20} /> 重试本关
            </button>
            <div className="flex gap-2">
                <button onClick={onQuit} className="flex-1 text-slate-400 font-bold text-sm hover:text-slate-600 bg-slate-100 py-3 rounded-xl">主菜单</button>
                <button onClick={handleShareClick} className="flex-[2] bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"><Share2 size={18} /> 炫耀战绩</button>
            </div>
          </div>
        </div>
      )}

      {/* Share Hint */}
      {showShareHint && (
        <div className="absolute inset-0 bg-black/80 z-[100] pointer-events-auto flex flex-col items-end pr-8 pt-4 cursor-pointer" onClick={() => setShowShareHint(false)}>
            <div className="animate-float-arrow">
               <img src="https://cdn.pixabay.com/photo/2013/07/12/12/35/arrow-145969_1280.png" alt="arrow" className="w-16 h-16 opacity-80 filter invert rotate-[-45deg]" style={{ filter: 'invert(1)' }} />
            </div>
            <div className="text-white text-xl font-bold mt-4 text-center mr-4"><p>点击右上角</p><p>分享给好友</p></div>
        </div>
      )}
    </div>
  );
};

export default UIOverlay;
