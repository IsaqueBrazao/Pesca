'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Fish, Tackle, Bait, LocationType } from '@/types/game';
import { StardewMiniGame } from './StardewMiniGame';
import {
  playCast,
  playWaterSplash,
  playBiteAlert,
  playHookSnap,
  playEscapeSound,
  playClick,
} from '@/lib/soundEffects';

interface FishingSceneProps {
  location: LocationType;
  playerLevel: number;
  rodBonus: number;
  allowsBait: boolean;
  allowsTackle: boolean;
  equippedTackle: Tackle | null;
  equippedBait: Bait | null;
  allFish: Fish[];
  onFishCaught: (fish: Fish, isPerfect: boolean, caughtTreasure: boolean) => void;
  onFishEscaped: (fish: Fish) => void;
  onConsumeBait: () => void;
}

export type SceneState = 'IDLE' | 'CASTING' | 'WAITING' | 'BITING' | 'MINIGAME';

export const FishingScene: React.FC<FishingSceneProps> = ({
  location,
  playerLevel,
  rodBonus,
  equippedTackle,
  equippedBait,
  allFish,
  onFishCaught,
  onFishEscaped,
  onConsumeBait,
}) => {
  const [sceneState, setSceneState] = useState<SceneState>('IDLE');
  const [castPower, setCastPower] = useState<number>(0);
  const [isMaxCast, setIsMaxCast] = useState<boolean>(false);
  const [activeFish, setActiveFish] = useState<Fish | null>(null);

  // Bobber position on water
  const [bobberPos, setBobberPos] = useState<{ x: number; y: number }>({ x: 55, y: 70 });
  const [showRipples, setShowRipples] = useState<boolean>(false);

  // Timing refs
  const castDirectionRef = useRef<number>(1);
  const castAnimRef = useRef<number | null>(null);
  const biteTimerRef = useRef<NodeJS.Timeout | null>(null);
  const biteWindowTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to pick random fish for this location & level
  const pickRandomFish = useCallback((): Fish => {
    const pool = allFish.filter((f) => f.location === location);
    // Weigh higher difficulty fish if player level is high
    const weightedPool = pool.filter((f) => {
      if (f.isLegendary && playerLevel < 6) return false;
      return true;
    });
    const chosen = weightedPool[Math.floor(Math.random() * weightedPool.length)] || pool[0];
    return chosen;
  }, [allFish, location, playerLevel]);

  // Start charging cast
  const startCasting = useCallback(() => {
    if (sceneState !== 'IDLE') return;
    playClick();
    setSceneState('CASTING');
    setCastPower(10);
    setIsMaxCast(false);
    castDirectionRef.current = 1;
  }, [sceneState]);

  // Release cast
  const releaseCast = useCallback(() => {
    if (sceneState !== 'CASTING') return;

    if (castAnimRef.current) {
      cancelAnimationFrame(castAnimRef.current);
      castAnimRef.current = null;
    }

    const finalPower = castPower;
    const isMax = finalPower >= 94;
    setIsMaxCast(isMax);

    playCast(finalPower);

    // Calculate bobber landing coordinates based on cast power
    // x: 45% to 75%, y: 65% to 80%
    const targetX = 45 + (finalPower / 100) * 30;
    const targetY = 65 + (Math.sin(finalPower) * 5);
    setBobberPos({ x: targetX, y: targetY });

    setSceneState('WAITING');
    setShowRipples(false);

    // Bobber lands after 600ms
    setTimeout(() => {
      playWaterSplash();
      setShowRipples(true);

      // Consume bait if equipped
      if (equippedBait) {
        onConsumeBait();
      }

      // Schedule fish bite
      const baitMultiplier = equippedBait?.id === 'regular_bait' ? 0.5 : 1.0;
      const waitTime = (2000 + Math.random() * 3500) * baitMultiplier;

      biteTimerRef.current = setTimeout(() => {
        // Fish bite "!" triggered
        const candidateFish = pickRandomFish();
        setActiveFish(candidateFish);
        setSceneState('BITING');
        playBiteAlert();

        // Player has 1.2 seconds window to strike ("HIT!")
        biteWindowTimerRef.current = setTimeout(() => {
          // Missed bite window
          playEscapeSound();
          setSceneState('IDLE');
          setActiveFish(null);
          setShowRipples(false);
        }, 1250);
      }, waitTime);
    }, 600);
  }, [sceneState, castPower, equippedBait, onConsumeBait, pickRandomFish]);

  // Player clicks "HIT" / strike to hook fish
  const hookFish = useCallback(() => {
    if (sceneState !== 'BITING' || !activeFish) return;

    if (biteWindowTimerRef.current) {
      clearTimeout(biteWindowTimerRef.current);
      biteWindowTimerRef.current = null;
    }

    playHookSnap();
    setSceneState('MINIGAME');
  }, [sceneState, activeFish]);

  // Handle Cast bar animation loop
  useEffect(() => {
    if (sceneState !== 'CASTING') return;

    let power = castPower;
    const animateCast = () => {
      power += castDirectionRef.current * 2.2;
      if (power >= 100) {
        power = 100;
        castDirectionRef.current = -1;
      } else if (power <= 5) {
        power = 5;
        castDirectionRef.current = 1;
      }
      setCastPower(power);
      castAnimRef.current = requestAnimationFrame(animateCast);
    };

    castAnimRef.current = requestAnimationFrame(animateCast);

    return () => {
      if (castAnimRef.current) {
        cancelAnimationFrame(castAnimRef.current);
      }
    };
  }, [sceneState, castPower]);

  // Keyboard shortcut listener for spacebar / C
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'KeyC') {
        e.preventDefault();
        if (sceneState === 'IDLE') {
          startCasting();
        } else if (sceneState === 'BITING') {
          hookFish();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'KeyC') {
        e.preventDefault();
        if (sceneState === 'CASTING') {
          releaseCast();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [sceneState, startCasting, releaseCast, hookFish]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (biteTimerRef.current) clearTimeout(biteTimerRef.current);
      if (biteWindowTimerRef.current) clearTimeout(biteWindowTimerRef.current);
      if (castAnimRef.current) cancelAnimationFrame(castAnimRef.current);
    };
  }, []);

  const handleMiniGameCatch = (perfect: boolean) => {
    if (!activeFish) return;
    setSceneState('IDLE');
    setShowRipples(false);
    onFishCaught(activeFish, perfect, false);
    setActiveFish(null);
  };

  const handleMiniGameEscape = () => {
    if (!activeFish) return;
    playEscapeSound();
    setSceneState('IDLE');
    setShowRipples(false);
    onFishEscaped(activeFish);
    setActiveFish(null);
  };

  return (
    <div className="relative w-full h-[540px] md:h-[620px] rounded-lg overflow-hidden border-4 border-[#3a1e05] shadow-2xl bg-[#0f1d2a]">
      {/* Background Lake Pixel Scene */}
      <div className="absolute inset-0">
        <Image
          src="/backgrounds/stardew_fishing_lake.jpg"
          alt="Lago de Pescaria Stardew"
          fill
          priority
          sizes="(max-width: 1200px) 100vw, 1200px"
          className="object-cover object-center filter contrast-105"
          referrerPolicy="no-referrer"
        />
        {/* Subtle Water Shimmer Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-950/40 via-transparent to-black/20 pointer-events-none" />
      </div>

      {/* Weather / Location Water Atmosphere Badge */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-[#2b1708]/85 border-2 border-[#f6bf7a] px-3 py-1.5 rounded-sm shadow-md">
        <span className="text-sm">📍</span>
        <span className="font-pixel text-[11px] text-[#f7e7c4] tracking-wide">
          {location === 'lake' && 'Lago da Montanha'}
          {location === 'river' && 'Rio de Pelican Town'}
          {location === 'ocean' && 'Píer da Praia'}
        </span>
      </div>

      {/* Fisherman Dock Character Silhouette / Sprite Area */}
      <div className="absolute bottom-10 left-12 md:left-24 z-10 flex flex-col items-center">
        {/* Animated Pixel Fisherman */}
        <div className="relative">
          {/* Rod Line */}
          {sceneState !== 'IDLE' && sceneState !== 'CASTING' && (
            <svg
              className="absolute pointer-events-none z-10"
              style={{
                top: '-20px',
                left: '28px',
                width: '600px',
                height: '400px',
              }}
            >
              <path
                d={`M 0 0 Q ${bobberPos.x * 2.5} ${bobberPos.y * 1.2}, ${(bobberPos.x - 15) * 6} ${(bobberPos.y - 45) * 5}`}
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.2"
                strokeDasharray="2,1"
                opacity="0.75"
              />
            </svg>
          )}

          {/* Fisherman Figure */}
          <div className="relative w-16 h-24 bg-[#3b2210] border-2 border-[#160b05] rounded-t-lg shadow-lg flex flex-col items-center p-1">
            {/* Straw Hat */}
            <div className="w-14 h-4 bg-[#eab308] border border-[#a16207] rounded-sm -mt-2 shadow-sm" />
            {/* Face */}
            <div className="w-8 h-6 bg-[#fcd34d] border border-[#ca8a04] mt-0.5 rounded-xs" />
            {/* Overalls */}
            <div className="w-12 h-10 bg-[#2563eb] border border-[#1e40af] mt-1 rounded-sm flex items-center justify-center">
              <span className="text-[10px] text-white/70">🎣</span>
            </div>
            {/* Boots */}
            <div className="w-10 h-3 bg-[#78350f] mt-1 rounded-xs" />
          </div>

          {/* Fishing Pole Angled */}
          <div
            className={`absolute -top-12 left-10 w-2.5 h-36 bg-[#a16207] border border-[#451a03] origin-bottom rounded-t-sm transition-transform duration-200 ${
              sceneState === 'CASTING'
                ? '-rotate-45'
                : sceneState === 'BITING' || sceneState === 'MINIGAME'
                ? 'rotate-12 animate-pulse'
                : 'rotate-25'
            }`}
          />
        </div>

        {/* Pier Planks Base */}
        <div className="w-36 h-4 bg-[#543419] border-t-2 border-[#2b1708] shadow-inner mt-1 rounded-xs" />
      </div>

      {/* Floating Bobber in Water */}
      {(sceneState === 'WAITING' || sceneState === 'BITING' || sceneState === 'MINIGAME') && (
        <div
          className="absolute z-20 pointer-events-none transition-all duration-300"
          style={{
            left: `${bobberPos.x}%`,
            top: `${bobberPos.y}%`,
          }}
        >
          {/* Water Ripples */}
          {showRipples && (
            <div className="absolute -inset-4 rounded-full border-2 border-white/40 animate-ping pointer-events-none" />
          )}

          {/* Bobber Icon */}
          <div
            className={`relative flex items-center justify-center transition-transform ${
              sceneState === 'BITING'
                ? 'animate-bounce scale-125'
                : 'animate-pulse'
            }`}
          >
            {/* Stardew Bobber: Red top, White bottom */}
            <div className="w-4 h-6 rounded-full border-2 border-[#2b1708] overflow-hidden shadow-md">
              <div className="h-1/2 bg-red-600" />
              <div className="h-1/2 bg-white" />
            </div>

            {/* "!" Speech Bubble on Fish Bite */}
            {sceneState === 'BITING' && (
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-amber-400 border-2 border-[#3a1e05] px-2 py-0.5 rounded shadow-lg animate-bounce z-30">
                <span className="font-pixel text-sm text-[#3a1e05] font-black">
                  !
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active Mini-Game Overlay when Fish is Hooked */}
      {sceneState === 'MINIGAME' && activeFish && (
        <div className="absolute inset-0 z-40 bg-black/45 backdrop-blur-[2px] flex items-center justify-center animate-fadeIn">
          <div className="relative">
            <StardewMiniGame
              fish={activeFish}
              playerLevel={playerLevel}
              rodBonus={rodBonus}
              equippedTackle={equippedTackle}
              onCatch={handleMiniGameCatch}
              onEscape={handleMiniGameEscape}
            />

            {/* Quick Action Hint beneath the bar */}
            <div className="text-center mt-2">
              <span className="font-pixel text-[9px] text-white/90 bg-black/60 px-3 py-1 rounded shadow">
                Segure o botão ou [Espaço] para subir a barra verde
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Cast Meter HUD while charging cast */}
      {sceneState === 'CASTING' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-2">
          {/* MAX Badge if at top */}
          <div className="h-6">
            {castPower >= 94 && (
              <span className="font-pixel text-xs text-yellow-300 font-bold tracking-widest animate-bounce drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                ⭐ MAX! ⭐
              </span>
            )}
          </div>

          {/* Cast Bar */}
          <div className="pixel-box-wood p-2 rounded-sm shadow-2xl flex flex-col items-center">
            <span className="font-pixel text-[9px] text-[#3a1e05] mb-1 font-bold">
              FORÇA DO LANÇAMENTO
            </span>
            <div className="w-56 h-6 bg-[#1a233a] border-2 border-[#2b1708] rounded-xs overflow-hidden relative shadow-inner">
              <div
                className={`h-full transition-all duration-75 shadow-sm ${
                  castPower >= 94
                    ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500'
                    : castPower > 60
                    ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                    : 'bg-gradient-to-r from-red-500 to-amber-500'
                }`}
                style={{ width: `${castPower}%` }}
              />
            </div>
            <span className="font-pixel text-[8px] text-[#4a2810] mt-1.5">
              Solte para Lançar no Lago
            </span>
          </div>
        </div>
      )}

      {/* Interactive Controls Bar at Bottom */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1">
        {sceneState === 'IDLE' && (
          <button
            onMouseDown={startCasting}
            onMouseUp={releaseCast}
            onTouchStart={startCasting}
            onTouchEnd={releaseCast}
            className="pixel-box-wood px-6 py-2.5 rounded-sm hover:brightness-105 active:scale-95 transition-transform cursor-pointer shadow-xl flex items-center gap-2"
          >
            <span className="text-base">🎣</span>
            <span className="font-pixel text-xs text-[#3a1e05] font-bold">
              SEGURE PARA LANÇAR (Espaço)
            </span>
          </button>
        )}

        {sceneState === 'WAITING' && (
          <div className="bg-[#2b1708]/85 border-2 border-[#f6bf7a] px-5 py-2 rounded-sm shadow-md animate-pulse">
            <span className="font-pixel text-[10px] text-[#f7e7c4] tracking-wide">
              Aguardando peixe morder a isca...
            </span>
          </div>
        )}

        {sceneState === 'BITING' && (
          <button
            onClick={hookFish}
            className="pixel-box-wood bg-gradient-to-r from-yellow-400 to-amber-500 px-8 py-3 rounded-sm border-2 border-red-600 animate-bounce active:scale-95 cursor-pointer shadow-2xl flex items-center gap-2"
          >
            <span className="text-xl">⚡</span>
            <span className="font-pixel text-sm text-[#3a1e05] font-black tracking-wider">
              FISGAR! (HIT)
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
