'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Fish, Tackle } from '@/types/game';
import { setReelSoundActive } from '@/lib/soundEffects';
import { PixelFish } from './PixelFish';

interface StardewMiniGameProps {
  fish: Fish;
  playerLevel: number;
  rodBonus: number;
  equippedTackle: Tackle | null;
  maxTimeSeconds?: number;
  onCatch: (perfect: boolean) => void;
  onEscape: (reason: 'lost_progress' | 'time_out') => void;
}

const TRACK_HEIGHT = 440; // Total vertical track in pixels
const BASE_BAR_HEIGHT = 92; // Base height of the green bar
const DEFAULT_MAX_TIME = 24; // 24 seconds total timer limit

export const StardewMiniGame: React.FC<StardewMiniGameProps> = ({
  fish,
  playerLevel,
  rodBonus,
  equippedTackle,
  maxTimeSeconds = DEFAULT_MAX_TIME,
  onCatch,
  onEscape,
}) => {
  // Physical parameters
  const isCork = equippedTackle?.id === 'cork_bobber';
  const isTrap = equippedTackle?.id === 'trap_bobber';
  const isLead = equippedTackle?.id === 'lead_bobber';
  const isBarbed = equippedTackle?.id === 'barbed_hook';

  const barHeight = Math.min(
    TRACK_HEIGHT * 0.75,
    BASE_BAR_HEIGHT + (playerLevel * 6) + rodBonus + (isCork ? 24 : 0)
  );

  // States for rendering
  const [barY, setBarY] = useState<number>(TRACK_HEIGHT - barHeight);
  const [fishY, setFishY] = useState<number>(TRACK_HEIGHT * 0.65);
  const [catchProgress, setCatchProgress] = useState<number>(35); // 0 to 100
  const [isFishInside, setIsFishInside] = useState<boolean>(false);
  const [isPerfect, setIsPerfect] = useState<boolean>(true);
  const [timeRemaining, setTimeRemaining] = useState<number>(maxTimeSeconds);

  // Control state
  const [isPressing, setIsPressing] = useState<boolean>(false);

  // Physics refs for requestAnimationFrame
  const isPressingRef = useRef<boolean>(false);
  const barYRef = useRef<number>(TRACK_HEIGHT - barHeight);
  const barVelocityRef = useRef<number>(0);
  const fishYRef = useRef<number>(TRACK_HEIGHT * 0.65);
  const fishTargetYRef = useRef<number>(TRACK_HEIGHT * 0.55);
  const fishVelocityRef = useRef<number>(0);
  const fishTimerRef = useRef<number>(1.5);
  const catchProgressRef = useRef<number>(35);
  const isPerfectRef = useRef<boolean>(true);
  const isEndedRef = useRef<boolean>(false);
  const timeRemainingRef = useRef<number>(maxTimeSeconds);

  // Keep isPressingRef in sync
  useEffect(() => {
    isPressingRef.current = isPressing;
  }, [isPressing]);

  // Handle keyboard controls (Space, C, ArrowUp)
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space' || e.code === 'KeyC' || e.key === 'ArrowUp') {
      e.preventDefault();
      setIsPressing(true);
    }
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space' || e.code === 'KeyC' || e.key === 'ArrowUp') {
      e.preventDefault();
      setIsPressing(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Main game physics loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      if (isEndedRef.current) return;

      const dt = Math.min((currentTime - lastTime) / 1000, 0.04);
      lastTime = currentTime;

      // 0. Update countdown timer
      timeRemainingRef.current -= dt;
      if (timeRemainingRef.current <= 0) {
        timeRemainingRef.current = 0;
        setTimeRemaining(0);
        isEndedRef.current = true;
        setReelSoundActive(false);
        onEscape('time_out');
        return;
      }
      setTimeRemaining(timeRemainingRef.current);

      // 1. Green Bar Physics (Stardew-accurate acceleration & gravity)
      const THRUST = -48.0;
      const GRAVITY = 34.0;
      const MAX_SPEED = 32.0;

      if (isPressingRef.current) {
        barVelocityRef.current += THRUST * dt * 60;
      } else {
        barVelocityRef.current += GRAVITY * dt * 60;
      }

      if (isBarbed) {
        const barCenter = barYRef.current + barHeight / 2;
        const diff = fishYRef.current - barCenter;
        if (Math.abs(diff) < barHeight * 0.7) {
          barVelocityRef.current += (diff > 0 ? 5.0 : -5.0) * dt * 60;
        }
      }

      barVelocityRef.current = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, barVelocityRef.current));
      barYRef.current += barVelocityRef.current * dt * 10;

      const maxBarY = TRACK_HEIGHT - barHeight;

      // Top ceiling
      if (barYRef.current < 0) {
        barYRef.current = 0;
        barVelocityRef.current = 0;
      }

      // Bottom floor
      if (barYRef.current > maxBarY) {
        barYRef.current = maxBarY;
        if (isLead) {
          barVelocityRef.current = 0;
        } else {
          barVelocityRef.current = -barVelocityRef.current * 0.44;
        }
      }

      // 2. Calm Fish Movement
      fishTimerRef.current -= dt;

      if (fishTimerRef.current <= 0) {
        const behavior = fish.behavior;
        const margin = 35;
        const trackRange = TRACK_HEIGHT - margin * 2;

        let nextInterval = 2.0 + Math.random() * 2.2;
        let nextTarget = fishTargetYRef.current;
        const currentY = fishYRef.current;

        switch (behavior) {
          case 'smooth': {
            const shift = (Math.random() - 0.5) * (trackRange * 0.35);
            nextTarget = Math.max(margin, Math.min(TRACK_HEIGHT - margin, currentY + shift));
            nextInterval = 2.5 + Math.random() * 2.5;
            break;
          }
          case 'sinker': {
            if (Math.random() < 0.65) {
              nextTarget = TRACK_HEIGHT - margin - Math.random() * (trackRange * 0.3);
            } else {
              nextTarget = TRACK_HEIGHT * 0.5 + (Math.random() - 0.5) * 60;
            }
            nextInterval = 2.0 + Math.random() * 1.8;
            break;
          }
          case 'floater': {
            if (Math.random() < 0.65) {
              nextTarget = margin + Math.random() * (trackRange * 0.3);
            } else {
              nextTarget = TRACK_HEIGHT * 0.5 + (Math.random() - 0.5) * 60;
            }
            nextInterval = 2.0 + Math.random() * 1.8;
            break;
          }
          case 'dart': {
            nextTarget = margin + Math.random() * trackRange;
            nextInterval = 1.6 + Math.random() * 1.6;
            break;
          }
          case 'legendary': {
            nextTarget = margin + Math.random() * trackRange;
            nextInterval = 1.2 + Math.random() * 1.4;
            break;
          }
          case 'mixed':
          default: {
            const shift = (Math.random() - 0.5) * (trackRange * 0.45);
            nextTarget = Math.max(margin, Math.min(TRACK_HEIGHT - margin, currentY + shift));
            nextInterval = 2.2 + Math.random() * 2.0;
            break;
          }
        }

        fishTargetYRef.current = nextTarget;
        fishTimerRef.current = nextInterval;
      }

      const fishDiff = fishTargetYRef.current - fishYRef.current;
      const smoothAgility = 2.2;
      fishVelocityRef.current += (fishDiff * smoothAgility - fishVelocityRef.current * 3.8) * dt;
      fishYRef.current += fishVelocityRef.current * dt * 9;

      const fishPadding = 16;
      fishYRef.current = Math.max(fishPadding, Math.min(TRACK_HEIGHT - fishPadding, fishYRef.current));

      // 3. Overlap & Catch Rate Mechanics
      const barTop = barYRef.current;
      const barBottom = barYRef.current + barHeight;
      const fishInBar = fishYRef.current >= barTop - 4 && fishYRef.current <= barBottom + 4;

      setIsFishInside(fishInBar);
      setReelSoundActive(fishInBar);

      const CATCH_FILL_SPEED = 13.0;
      const ESCAPE_DRAIN_SPEED = isTrap ? 5.5 : 8.5;

      if (fishInBar) {
        catchProgressRef.current = Math.min(100, catchProgressRef.current + CATCH_FILL_SPEED * dt);
      } else {
        catchProgressRef.current = Math.max(0, catchProgressRef.current - ESCAPE_DRAIN_SPEED * dt);
        if (isPerfectRef.current) {
          isPerfectRef.current = false;
          setIsPerfect(false);
        }
      }

      // 4. Check Win/Loss conditions
      if (catchProgressRef.current >= 100) {
        isEndedRef.current = true;
        setReelSoundActive(false);
        onCatch(isPerfectRef.current);
        return;
      }

      if (catchProgressRef.current <= 0) {
        isEndedRef.current = true;
        setReelSoundActive(false);
        onEscape('lost_progress');
        return;
      }

      setBarY(barYRef.current);
      setFishY(fishYRef.current);
      setCatchProgress(catchProgressRef.current);

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      setReelSoundActive(false);
    };
  }, [
    barHeight,
    fish,
    isCork,
    isTrap,
    isLead,
    isBarbed,
    maxTimeSeconds,
    onCatch,
    onEscape,
  ]);

  const getProgressColor = (val: number) => {
    if (val > 65) return 'from-emerald-500 via-green-400 to-emerald-300';
    if (val > 30) return 'from-amber-500 via-yellow-400 to-amber-300';
    return 'from-red-600 via-rose-500 to-red-400';
  };

  const timePercent = Math.max(0, (timeRemaining / maxTimeSeconds) * 100);

  return (
    <div
      className="relative flex flex-col items-center justify-center p-2 select-none touch-none"
      onMouseDown={() => setIsPressing(true)}
      onMouseUp={() => setIsPressing(false)}
      onTouchStart={() => setIsPressing(true)}
      onTouchEnd={() => setIsPressing(false)}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Mini-game Outer Pixel-Art Wood Frame */}
      <div className="relative pixel-box-wood p-3 rounded-none flex items-center gap-3">
        {/* Top Floating "PERFECT" Pixel Banner */}
        {isPerfect && (
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#f6bf7a] border-2 border-[#281608] px-2 py-0.5 rounded-none shadow-md z-30 animate-pulse">
            <span className="font-pixel text-[8px] text-[#281608] font-bold tracking-wider">
              ⭐ PERFEITO!
            </span>
          </div>
        )}

        {/* Corner Rivet Pixels */}
        <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-[#451a03] border border-[#f6bf7a]" />
        <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#451a03] border border-[#f6bf7a]" />
        <div className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-[#451a03] border border-[#f6bf7a]" />
        <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-[#451a03] border border-[#f6bf7a]" />

        {/* Main Fishing Water Well / Track */}
        <div
          className="relative w-12 bg-[#0a1e36] border-2 border-[#16120e] rounded-none overflow-hidden shadow-inner"
          style={{ height: `${TRACK_HEIGHT}px` }}
        >
          {/* Pixel water bubbles/depth grid */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)',
              backgroundSize: '10px 10px',
            }}
          />

          {/* Green Bobber Bar (Player Controlled) */}
          <div
            className={`absolute left-0.5 right-0.5 rounded-none transition-shadow duration-75 ${
              isFishInside
                ? 'shadow-[0_0_10px_#4ade80,inset_0_0_4px_#86efac] border-2 border-[#bbf7d0]'
                : 'border-2 border-[#15803d]'
            }`}
            style={{
              top: `${barY}px`,
              height: `${barHeight}px`,
              background: isFishInside
                ? 'linear-gradient(180deg, #4ade80 0%, #16a34a 50%, #15803d 100%)'
                : 'linear-gradient(180deg, #22c55e 0%, #15803d 50%, #166534 100%)',
            }}
          >
            {/* Pixel grip lines */}
            <div className="w-full h-full flex flex-col justify-between py-1 px-0.5 pointer-events-none opacity-40">
              <div className="h-0.5 bg-white/70" />
              <div className="h-0.5 bg-white/70" />
              <div className="h-0.5 bg-white/70" />
            </div>
          </div>

          {/* Pixel Art Fish */}
          <div
            className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
            style={{ top: `${fishY}px` }}
          >
            <PixelFish
              color={fish.color}
              isLegendary={fish.isLegendary}
              isInsideBar={isFishInside}
            />
          </div>
        </div>

        {/* Catch Progress Gauge (Right side vertical bar) */}
        <div
          className="relative w-4 bg-[#140f0c] border-2 border-[#3a1e05] rounded-none p-0.5 shadow-inner"
          style={{ height: `${TRACK_HEIGHT}px` }}
        >
          {/* Tick markers */}
          <div className="absolute inset-0 flex flex-col justify-between py-2 pointer-events-none opacity-25">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="h-0.5 bg-white w-full" />
            ))}
          </div>

          {/* Dynamic Fill Bar */}
          <div
            className={`w-full bg-gradient-to-t ${getProgressColor(
              catchProgress
            )} transition-[height] duration-75`}
            style={{
              height: `${catchProgress}%`,
              position: 'absolute',
              bottom: '2px',
              left: '2px',
              right: '2px',
              width: 'calc(100% - 4px)',
            }}
          />
        </div>
      </div>

      {/* Bottom Time Limit Bar */}
      <div className="w-full max-w-[200px] mt-3 pixel-box-parchment p-2 rounded-none border-2 border-[#3a1e05] flex flex-col gap-1">
        <div className="flex items-center justify-between font-pixel text-[8px] text-[#281608]">
          <span className="font-bold flex items-center gap-1">
            <span>⏱️</span> TEMPO
          </span>
          <span className="tabular-nums font-bold">
            {Math.ceil(timeRemaining)}s
          </span>
        </div>

        {/* Time bar gauge */}
        <div className="w-full h-3 bg-[#1e130a] border border-[#3a1e05] p-0.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-100 ${
              timePercent > 45
                ? 'bg-[#22c55e]'
                : timePercent > 20
                ? 'bg-[#eab308]'
                : 'bg-[#ef4444] animate-pulse'
            }`}
            style={{ width: `${timePercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
