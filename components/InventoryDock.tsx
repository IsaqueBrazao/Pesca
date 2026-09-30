'use client';

import React from 'react';
import { Rod, Tackle, Bait } from '@/types/game';
import { playClick } from '@/lib/soundEffects';

interface InventoryDockProps {
  currentRod: Rod;
  equippedTackle: Tackle | null;
  equippedBait: Bait | null;
  baitCount: number;
  onOpenShop: () => void;
}

export const InventoryDock: React.FC<InventoryDockProps> = ({
  currentRod,
  equippedTackle,
  equippedBait,
  baitCount,
  onOpenShop,
}) => {
  return (
    <div className="w-full pixel-box-parchment p-3 rounded-sm border-2 border-[#4a2810] flex flex-col md:flex-row items-center justify-between gap-3 shadow-md">
      {/* Equipped Gear Slots */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-pixel text-[9px] text-[#281608] font-bold">
          Equipamento:
        </span>

        {/* Rod Slot */}
        <div className="flex items-center gap-1.5 bg-[#fff7de] border border-[#d8b275] px-2.5 py-1 rounded-xs">
          <span className="text-base">🎣</span>
          <div className="flex flex-col">
            <span className="font-pixel text-[8px] text-[#281608] font-bold">
              {currentRod.name}
            </span>
            <span className="font-pixel text-[7px] text-[#804c1e]">
              +{currentRod.barSizeBonus}px Barra
            </span>
          </div>
        </div>

        {/* Tackle Slot */}
        <div className="flex items-center gap-1.5 bg-[#fff7de] border border-[#d8b275] px-2.5 py-1 rounded-xs">
          <span className="text-base">{equippedTackle ? equippedTackle.icon : '🪝'}</span>
          <div className="flex flex-col">
            <span className="font-pixel text-[8px] text-[#281608] font-bold">
              {equippedTackle ? equippedTackle.name : 'Sem Boia'}
            </span>
            <span className="font-pixel text-[7px] text-[#804c1e]">
              {equippedTackle ? equippedTackle.description : (currentRod.allowsTackle ? 'Slot Vazio' : 'Requer Vara de Irídio')}
            </span>
          </div>
        </div>

        {/* Bait Slot */}
        <div className="flex items-center gap-1.5 bg-[#fff7de] border border-[#d8b275] px-2.5 py-1 rounded-xs">
          <span className="text-base">{equippedBait ? equippedBait.icon : '🐛'}</span>
          <div className="flex flex-col">
            <span className="font-pixel text-[8px] text-[#281608] font-bold">
              {equippedBait ? `${equippedBait.name} (${baitCount})` : 'Sem Isca'}
            </span>
            <span className="font-pixel text-[7px] text-[#804c1e]">
              {equippedBait ? equippedBait.description : (currentRod.allowsBait ? 'Slot Vazio' : 'Requer Fibra de Vidro')}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action button to shop */}
      <button
        onClick={() => {
          playClick();
          onOpenShop();
        }}
        className="pixel-box-wood px-4 py-1.5 rounded-xs font-pixel text-[9px] text-[#281608] hover:brightness-105 active:scale-95 cursor-pointer whitespace-nowrap"
      >
        Visitar Willy 🏪
      </button>
    </div>
  );
};
