'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Fish, FishQuality, PlayerStats, TreasureItem } from '@/types/game';
import { ALL_FISH, LEVEL_XP_THRESHOLDS } from '@/lib/fishData';
import { StardewMiniGame } from './StardewMiniGame';
import { CaughtModal } from './CaughtModal';
import {
  playHookSnap,
  playEscapeSound,
  playCaughtFanfare,
  playClick,
} from '@/lib/soundEffects';

interface PixelFishingSceneProps {
  stats: PlayerStats;
  onUpdateStats: (newStats: PlayerStats) => void;
}

type GameFlowState = 'IDLE' | 'FISHING' | 'CAUGHT' | 'ESCAPED';

export const PixelFishingScene: React.FC<PixelFishingSceneProps> = ({
  stats,
  onUpdateStats,
}) => {
  const [gameState, setGameState] = useState<GameFlowState>('IDLE');
  const [activeFish, setActiveFish] = useState<Fish>(ALL_FISH[0]);
  const [escapeReason, setEscapeReason] = useState<'lost_progress' | 'time_out'>('lost_progress');
  const justClosedModalRef = useRef<boolean>(false);

  const [caughtResult, setCaughtResult] = useState<{
    fish: Fish;
    size: number;
    quality: FishQuality;
    isPerfect: boolean;
    isRecord: boolean;
    goldEarned: number;
    xpEarned: number;
    treasureLoot: TreasureItem[];
  } | null>(null);

  // Pick a random fish based on player level
  const pickRandomFish = useCallback((): Fish => {
    const candidates = ALL_FISH.filter((f) => {
      if (f.isLegendary && stats.level < 4) return false;
      return true;
    });
    return candidates[Math.floor(Math.random() * candidates.length)] || ALL_FISH[0];
  }, [stats.level]);

  // Start mini-game instantly with NO animations
  const startFishing = useCallback(() => {
    if (gameState === 'FISHING' || gameState === 'CAUGHT' || justClosedModalRef.current) return;
    playHookSnap();
    const fish = pickRandomFish();
    setActiveFish(fish);
    setGameState('FISHING');
  }, [gameState, pickRandomFish]);

  // Keyboard handler for starting game and handling escaped state
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If caught modal is open, DO NOT react to space at all!
      if (gameState === 'CAUGHT') {
        return;
      }

      // If escaping or idle, space or enter starts a game
      if (gameState === 'IDLE') {
        if (e.code === 'Space' || e.code === 'KeyC' || e.code === 'Enter') {
          e.preventDefault();
          startFishing();
        }
      } else if (gameState === 'ESCAPED') {
        if (e.code === 'Space' || e.code === 'Enter' || e.code === 'Escape') {
          e.preventDefault();
          startFishing();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, startFishing]);

  // Handle mini-game catch victory
  const handleMiniGameCatch = (isPerfect: boolean) => {
    const fish = activeFish;
    const sizeRange = fish.maxSize - fish.minSize;
    const sizeFactor = Math.min(1, 0.25 + Math.random() * 0.55 + (stats.level * 0.03) + (isPerfect ? 0.25 : 0));
    const size = fish.minSize + sizeRange * sizeFactor;

    let quality: FishQuality = 'normal';
    if (isPerfect && (stats.level >= 3 || sizeFactor > 0.75)) {
      quality = 'iridium';
    } else if (sizeFactor > 0.7 || (isPerfect && stats.level >= 1)) {
      quality = 'gold';
    } else if (sizeFactor > 0.45) {
      quality = 'silver';
    }

    const qualityMultipliers: Record<FishQuality, number> = {
      normal: 1.0,
      silver: 1.25,
      gold: 1.5,
      iridium: 2.0,
    };

    const goldEarned = Math.round(fish.basePrice * qualityMultipliers[quality]);
    let xpEarned = Math.round(fish.difficulty * 3 + (quality === 'iridium' ? 30 : quality === 'gold' ? 20 : quality === 'silver' ? 10 : 0));
    if (isPerfect) {
      xpEarned = Math.round(xpEarned * 2.4);
    }

    playCaughtFanfare(isPerfect);

    const existing = stats.caughtRecords[fish.id];
    const isRecord = !existing || size > existing.maxSize;
    const ranks: FishQuality[] = ['normal', 'silver', 'gold', 'iridium'];
    let bestQuality: FishQuality = quality;
    if (existing && ranks.indexOf(existing.highestQuality) > ranks.indexOf(quality)) {
      bestQuality = existing.highestQuality;
    }

    const newRecord = {
      fishId: fish.id,
      count: (existing?.count || 0) + 1,
      maxSize: existing ? Math.max(existing.maxSize, size) : size,
      highestQuality: bestQuality,
      firstCaughtTimestamp: existing?.firstCaughtTimestamp || Date.now(),
    };

    const newXp = stats.xp + xpEarned;
    let newLevel = stats.level;
    for (let lvl = stats.level + 1; lvl < LEVEL_XP_THRESHOLDS.length; lvl++) {
      if (newXp >= LEVEL_XP_THRESHOLDS[lvl]) {
        newLevel = lvl;
      }
    }

    onUpdateStats({
      ...stats,
      gold: stats.gold + goldEarned,
      xp: newXp,
      level: newLevel,
      totalCaught: stats.totalCaught + 1,
      totalCasts: stats.totalCasts + 1,
      perfectCatches: stats.perfectCatches + (isPerfect ? 1 : 0),
      caughtRecords: {
        ...stats.caughtRecords,
        [fish.id]: newRecord,
      },
    });

    setCaughtResult({
      fish,
      size,
      quality,
      isPerfect,
      isRecord,
      goldEarned,
      xpEarned,
      treasureLoot: [],
    });
    setGameState('CAUGHT');
  };

  // Handle mini-game escape
  const handleMiniGameEscape = (reason: 'lost_progress' | 'time_out') => {
    playEscapeSound();
    setEscapeReason(reason);
    setGameState('ESCAPED');

    onUpdateStats({
      ...stats,
      totalCasts: stats.totalCasts + 1,
    });
  };

  // Handle closing caught modal safely with debounce guard
  const handleCloseCaughtModal = () => {
    justClosedModalRef.current = true;
    setCaughtResult(null);
    setGameState('IDLE');
    setTimeout(() => {
      justClosedModalRef.current = false;
    }, 350);
  };

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-[#0c131a] select-none flex items-center justify-center"
      onClick={() => {
        if (gameState === 'IDLE') {
          startFishing();
        }
      }}
    >
      {/* 16-bit Pixel Art Background: Night fishing on calm moonlit lake */}
      <div className="absolute inset-0 pointer-events-none">
        <Image
          src="/backgrounds/pixel_night_fishing.jpg"
          alt="Pescaria Noturna Pixel Art"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center filter contrast-105"
          style={{ imageRendering: 'pixelated' }}
          referrerPolicy="no-referrer"
        />
        {/* Subtle Shading Scrim */}
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />
      </div>

      {/* STATE: IDLE -> Clean prompt in the center */}
      {gameState === 'IDLE' && (
        <div className="relative z-30 flex flex-col items-center gap-2 animate-fadeIn">
          <button
            onClick={(e) => {
              e.stopPropagation();
              startFishing();
            }}
            className="pixel-box-wood px-6 py-3.5 rounded-none border-4 border-[#281608] hover:brightness-105 active:scale-95 transition-transform cursor-pointer shadow-2xl flex flex-col items-center gap-1.5"
          >
            <span className="font-pixel text-xs md:text-sm text-[#281608] font-black tracking-wider">
              [ ESPAÇO ] PARA PESCAR
            </span>
            <span className="font-pixel text-[8px] text-[#4a2810]">
              ou clique na tela para começar
            </span>
          </button>
        </div>
      )}

      {/* STATE: FISHING -> Stardew MiniGame Bar + Bottom Timer Bar */}
      {gameState === 'FISHING' && (
        <div
          className="relative z-30 animate-fadeIn"
          onClick={(e) => e.stopPropagation()}
        >
          <StardewMiniGame
            fish={activeFish}
            playerLevel={stats.level}
            rodBonus={8}
            equippedTackle={null}
            maxTimeSeconds={24}
            onCatch={handleMiniGameCatch}
            onEscape={handleMiniGameEscape}
          />
        </div>
      )}

      {/* STATE: ESCAPED -> Fish Escaped Banner */}
      {gameState === 'ESCAPED' && (
        <div className="relative z-30 flex flex-col items-center gap-3 animate-fadeIn">
          <div className="pixel-box-parchment p-5 max-w-xs text-center border-4 border-[#3a1e05] shadow-2xl flex flex-col items-center gap-2">
            <span className="font-pixel text-xs text-[#881337] font-black tracking-wide">
              {escapeReason === 'time_out'
                ? 'TEMPO ESGOTADO!'
                : 'O PEIXE ESCAPOU!'}
            </span>
            <p className="font-pixel text-[8px] text-[#4a2810]">
              {escapeReason === 'time_out'
                ? 'O tempo da barra acabou antes de fisgar o peixe.'
                : 'A barra de progresso esvaziou.'}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                playClick();
                startFishing();
              }}
              className="pixel-box-wood w-full py-2.5 mt-2 rounded-none font-pixel text-[9px] text-[#281608] font-bold hover:brightness-105 active:scale-95 cursor-pointer"
            >
              [ ESPAÇO ] TENTAR DE NOVO
            </button>
          </div>
        </div>
      )}

      {/* STATE: CAUGHT -> Caught Modal (Closed ONLY with Enter or Esc) */}
      {gameState === 'CAUGHT' && caughtResult && (
        <CaughtModal
          fish={caughtResult.fish}
          onClose={handleCloseCaughtModal}
        />
      )}
    </div>
  );
};
