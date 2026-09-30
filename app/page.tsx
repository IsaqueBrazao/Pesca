'use client';

import React, { useState, useEffect } from 'react';
import { PlayerStats } from '@/types/game';
import { PixelFishingScene } from '@/components/PixelFishingScene';

const STORAGE_KEY = 'stardew_fishing_save_v2';

const INITIAL_STATS: PlayerStats = {
  gold: 0,
  xp: 0,
  level: 1,
  currentRodId: 'bamboo_pole',
  equippedTackleId: null,
  equippedBaitId: null,
  baitCount: 0,
  tackleDurability: 100,
  totalCasts: 0,
  totalCaught: 0,
  perfectCatches: 0,
  treasuresCaught: 0,
  caughtRecords: {},
};

export default function FishingGamePage() {
  const [stats, setStats] = useState<PlayerStats>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          return { ...INITIAL_STATS, ...parsed };
        }
      } catch {
        // ignore
      }
    }
    return INITIAL_STATS;
  });

  // Save state on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch {
      // ignore
    }
  }, [stats]);

  return (
    <main className="w-screen h-screen overflow-hidden bg-[#0c131a] select-none">
      <PixelFishingScene
        stats={stats}
        onUpdateStats={setStats}
      />
    </main>
  );
}
