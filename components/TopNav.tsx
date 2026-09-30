'use client';

import React from 'react';
import { LocationType } from '@/types/game';
import { playClick } from '@/lib/soundEffects';

interface TopNavProps {
  currentLocation: LocationType;
  onSelectLocation: (loc: LocationType) => void;
  onOpenShop: () => void;
  onOpenCollection: () => void;
  gold: number;
  level: number;
  xp: number;
  nextLevelXp: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentLocation,
  onSelectLocation,
  onOpenShop,
  onOpenCollection,
  gold,
  level,
}) => {
  return (
    <header className="w-full bg-[#281608] border-b-4 border-[#3a1e05] px-4 md:px-8 py-3 flex items-center justify-between shadow-lg z-30">
      {/* Zone 1: Single text element wordmark */}
      <h1 className="font-pixel text-sm md:text-base text-[#f6bf7a] tracking-tight font-bold shrink-0">
        Stardew Fishing
      </h1>

      {/* Zone 2: Navigation Links / Controls */}
      <nav className="flex items-center gap-2 sm:gap-4 font-pixel text-[9px] sm:text-[10px] text-[#fed7aa]">
        <button
          onClick={() => {
            playClick();
            onSelectLocation('lake');
          }}
          className={`hover:text-[#f6bf7a] transition-colors whitespace-nowrap pb-0.5 cursor-pointer ${
            currentLocation === 'lake' ? 'text-[#f6bf7a] border-b-2 border-[#f6bf7a]' : ''
          }`}
        >
          Lago
        </button>

        <button
          onClick={() => {
            playClick();
            onSelectLocation('river');
          }}
          className={`hover:text-[#f6bf7a] transition-colors whitespace-nowrap pb-0.5 cursor-pointer ${
            currentLocation === 'river' ? 'text-[#f6bf7a] border-b-2 border-[#f6bf7a]' : ''
          }`}
        >
          Rio
        </button>

        <button
          onClick={() => {
            playClick();
            onSelectLocation('ocean');
          }}
          className={`hover:text-[#f6bf7a] transition-colors whitespace-nowrap pb-0.5 cursor-pointer ${
            currentLocation === 'ocean' ? 'text-[#f6bf7a] border-b-2 border-[#f6bf7a]' : ''
          }`}
        >
          Oceano
        </button>

        <button
          onClick={() => {
            playClick();
            onOpenCollection();
          }}
          className="hover:text-[#f6bf7a] transition-colors whitespace-nowrap cursor-pointer"
        >
          Coleção
        </button>

        <button
          onClick={() => {
            playClick();
            onOpenShop();
          }}
          className="hover:text-[#f6bf7a] transition-colors whitespace-nowrap cursor-pointer"
        >
          Loja do Willy
        </button>
      </nav>

      {/* Zone 3: Primary Stats & Actions */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Level Badge */}
        <div className="hidden sm:flex items-center gap-1.5 bg-[#4a2810] border border-[#804c1e] px-2.5 py-1 rounded-xs">
          <span className="font-pixel text-[9px] text-[#fcd34d]">
            Nível {level}
          </span>
        </div>

        {/* Gold Counter */}
        <div className="flex items-center gap-1 bg-[#4a2810] border-2 border-[#f59e0b] px-3 py-1 rounded-xs shadow-sm">
          <span className="font-pixel text-[10px] md:text-xs text-[#fbbf24] font-bold">
            {gold}g 🪙
          </span>
        </div>
      </div>
    </header>
  );
};
