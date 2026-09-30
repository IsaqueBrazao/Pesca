'use client';

import React, { useEffect } from 'react';
import { Fish } from '@/types/game';
import { playClick } from '@/lib/soundEffects';
import { PixelFish } from './PixelFish';

interface CaughtModalProps {
  fish: Fish;
  onClose: () => void;
}

export const CaughtModal: React.FC<CaughtModalProps> = ({
  fish,
  onClose,
}) => {
  // Only allow Enter or Escape to close/restart!
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'Escape' || e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        playClick();
        onClose();
      }
      if (e.code === 'Space') {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none"
      onClick={() => {
        playClick();
        onClose();
      }}
    >
      <div
        className="relative pixel-box-parchment p-5 max-w-[340px] w-full rounded-none shadow-2xl flex flex-col items-center border-4 border-[#3a1e05]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title: Peixe Fisgado */}
        <div className="absolute -top-5 bg-[#d18d48] border-2 border-[#281608] px-5 py-1 rounded-none shadow-md">
          <span className="font-pixel text-[11px] text-[#281608] font-bold tracking-wider">
            Peixe Fisgado
          </span>
        </div>

        {/* Foto do Peixe Maior */}
        <div className="relative mt-3 mb-4 w-36 h-32 bg-[#fed7aa]/60 border-2 border-[#804c1e] rounded-none flex items-center justify-center shadow-inner overflow-hidden">
          <div className="scale-[2.8] transition-transform">
            <PixelFish
              color={fish.color}
              isLegendary={fish.isLegendary}
              isInsideBar={true}
            />
          </div>
        </div>

        {/* Nome do Peixe (Somente em Português) */}
        <h3 className="font-pixel text-sm text-[#281608] text-center font-bold tracking-wide mb-5">
          {fish.name}
        </h3>

        {/* Botão com as informações: Pressione [ ENTER ] ou [ ESC ]. */}
        <button
          onClick={() => {
            playClick();
            onClose();
          }}
          className="pixel-box-wood w-full py-2.5 px-2 rounded-none font-pixel text-[7.5px] sm:text-[8px] text-[#281608] font-bold hover:brightness-105 active:scale-98 cursor-pointer shadow-md flex items-center justify-center text-center whitespace-nowrap overflow-hidden"
        >
          <span>Pressione [ ENTER ] ou [ ESC ].</span>
        </button>
      </div>
    </div>
  );
};
