'use client';

import React, { useState } from 'react';
import { Fish, CaughtRecord } from '@/types/game';
import { ALL_FISH } from '@/lib/fishData';
import { playClick } from '@/lib/soundEffects';

interface FishCollectionModalProps {
  caughtRecords: Record<string, CaughtRecord>;
  onClose: () => void;
}

export const FishCollectionModal: React.FC<FishCollectionModalProps> = ({
  caughtRecords,
  onClose,
}) => {
  const [selectedFish, setSelectedFish] = useState<Fish | null>(ALL_FISH[0]);
  const [filterLocation, setFilterLocation] = useState<'all' | 'lake' | 'river' | 'ocean' | 'legendary'>('all');

  const filteredFish = ALL_FISH.filter((f) => {
    if (filterLocation === 'legendary') return f.isLegendary;
    if (filterLocation === 'all') return true;
    return f.location === filterLocation;
  });

  const totalDiscovered = Object.keys(caughtRecords).length;
  const totalFishCount = ALL_FISH.length;
  const progressPercent = Math.round((totalDiscovered / totalFishCount) * 100);

  const selectedRecord = selectedFish ? caughtRecords[selectedFish.id] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
      <div className="relative pixel-box-parchment p-6 max-w-4xl w-full rounded-sm shadow-2xl border-4 border-[#4a2810] max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b-2 border-[#804c1e] pb-3 mb-4 gap-2">
          <div>
            <h2 className="font-pixel text-sm md:text-base text-[#281608] font-bold flex items-center gap-2">
              <span>🐟</span> Coleção de Peixes de Pelican Town
            </h2>
            <p className="font-pixel-retro text-base text-[#804c1e]">
              Registre todos os espécimes aquáticos do vale e torne-se um Mestre Pescador!
            </p>
          </div>

          {/* Progress Tracker */}
          <div className="bg-[#fed7aa] border-2 border-[#804c1e] px-3 py-1.5 rounded flex flex-col items-end shadow-sm">
            <span className="font-pixel text-[9px] text-[#281608] font-bold">
              Descobertos: {totalDiscovered} / {totalFishCount} ({progressPercent}%)
            </span>
            <div className="w-32 h-2 bg-black/30 rounded-full mt-1 overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Filter Navigation */}
        <div className="flex flex-wrap items-center gap-2 mb-3 border-b border-[#d8b275] pb-2">
          {(
            [
              { id: 'all', label: 'Todos os Peixes' },
              { id: 'lake', label: 'Lago da Montanha' },
              { id: 'river', label: 'Rio' },
              { id: 'ocean', label: 'Oceano' },
              { id: 'legendary', label: '👑 Lendários' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                playClick();
                setFilterLocation(tab.id);
              }}
              className={`px-3 py-1 rounded-xs font-pixel text-[9px] transition-colors cursor-pointer ${
                filterLocation === tab.id
                  ? 'bg-[#804c1e] text-[#f7e7c4]'
                  : 'bg-[#fed7aa]/60 text-[#4a2810] hover:bg-[#fed7aa]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Two-Column Layout: Grid on Left, Fish Inspector on Right */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-hidden">
          {/* Grid of Fish (2 cols on md) */}
          <div className="md:col-span-2 overflow-y-auto pr-1">
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {filteredFish.map((fish) => {
                const isCaught = Boolean(caughtRecords[fish.id]);
                const isSelected = selectedFish?.id === fish.id;

                return (
                  <button
                    key={fish.id}
                    onClick={() => {
                      playClick();
                      setSelectedFish(fish);
                    }}
                    className={`relative p-2 rounded-xs border-2 flex flex-col items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-600 bg-amber-200/90 shadow-md scale-105'
                        : isCaught
                        ? 'border-[#d8b275] bg-[#fff7de] hover:bg-[#fed7aa]/50'
                        : 'border-stone-400 bg-stone-300/40 opacity-70 hover:opacity-100'
                    }`}
                  >
                    {/* Crown if legendary */}
                    {fish.isLegendary && (
                      <span className="absolute -top-1.5 -right-1 text-xs">👑</span>
                    )}

                    {/* Fish Sprite or Silhouette */}
                    <div
                      className={`text-3xl transition-transform ${
                        isCaught ? '' : 'filter grayscale brightness-0 opacity-40'
                      }`}
                      style={{ color: isCaught ? fish.color : '#000' }}
                    >
                      🐟
                    </div>

                    <span className="font-pixel text-[7px] text-[#281608] mt-1 text-center truncate w-full">
                      {isCaught ? fish.name : '???'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Inspector Panel on Right */}
          <div className="bg-[#fff7de] border-2 border-[#804c1e] p-4 rounded-xs flex flex-col justify-between overflow-y-auto">
            {selectedFish ? (
              <div>
                {/* Big Fish Display */}
                <div className="flex flex-col items-center border-b border-[#d8b275] pb-3 mb-3">
                  <div
                    className={`w-20 h-20 rounded border-2 border-[#804c1e] bg-[#fed7aa]/50 flex items-center justify-center text-4xl shadow-inner ${
                      !selectedRecord ? 'filter grayscale brightness-0 opacity-40' : ''
                    }`}
                    style={{ color: selectedRecord ? selectedFish.color : '#000' }}
                  >
                    🐟
                  </div>
                  <h3 className="font-pixel text-xs text-[#281608] font-bold mt-2 text-center">
                    {selectedRecord ? selectedFish.name : 'Peixe Desconhecido'}
                  </h3>
                  <p className="font-pixel-retro text-base text-[#804c1e]">
                    {selectedRecord ? selectedFish.nameEn : '???'}
                  </p>
                </div>

                {/* Details / Stats */}
                {selectedRecord ? (
                  <div className="space-y-2 font-pixel text-[8px] text-[#4a2810]">
                    <div className="flex justify-between border-b border-[#ebd3aa] pb-1">
                      <span>Pescados:</span>
                      <span className="font-bold text-[#281608]">
                        {selectedRecord.count}x
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-[#ebd3aa] pb-1">
                      <span>Maior Tamanho:</span>
                      <span className="font-bold text-[#281608]">
                        {selectedRecord.maxSize.toFixed(1)} pol.
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-[#ebd3aa] pb-1">
                      <span>Melhor Qualidade:</span>
                      <span className="font-bold uppercase text-amber-700">
                        {selectedRecord.highestQuality}
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-[#ebd3aa] pb-1">
                      <span>Preço Base:</span>
                      <span className="font-bold text-[#b45309]">
                        {selectedFish.basePrice}g 🪙
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-[#ebd3aa] pb-1">
                      <span>Comportamento:</span>
                      <span className="font-bold capitalize text-emerald-800">
                        {selectedFish.behavior === 'mixed' && 'Misto (Padrão)'}
                        {selectedFish.behavior === 'smooth' && 'Suave (Lento)'}
                        {selectedFish.behavior === 'sinker' && 'Afundador (Fundo)'}
                        {selectedFish.behavior === 'floater' && 'Flutuador (Topo)'}
                        {selectedFish.behavior === 'dart' && 'Dardo (Rápido)'}
                        {selectedFish.behavior === 'legendary' && 'Lendário (Feroz)'}
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-[#ebd3aa] pb-1">
                      <span>Dificuldade:</span>
                      <span className="font-bold text-[#7f1d1d]">
                        {selectedFish.difficulty} / 110
                      </span>
                    </div>

                    <div className="mt-3 p-2 bg-[#fed7aa]/50 rounded text-[#3a1e05] font-pixel-retro text-base leading-snug">
                      &quot;{selectedFish.description}&quot;
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-stone-500">
                    <p className="font-pixel text-[9px] mb-2">Ainda não capturado!</p>
                    <p className="font-pixel-retro text-sm text-[#804c1e]">
                      Habita o{' '}
                      <strong>
                        {selectedFish.location === 'lake'
                          ? 'Lago da Montanha'
                          : selectedFish.location === 'river'
                          ? 'Rio de Pelican Town'
                          : 'Oceano'}
                      </strong>
                      . Continue pescando com varas e iscas adequadas!
                    </p>
                  </div>
                )}
              </div>
            ) : null}

            {/* Bottom Willy advice */}
            <div className="mt-4 pt-2 border-t border-[#d8b275] text-center">
              <span className="font-pixel text-[7px] text-[#804c1e]">
                🎣 Dica: Capturas Perfeitas garantem peixes de qualidade Irídio!
              </span>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-4 pt-3 border-t border-[#d8b275] flex justify-end">
          <button
            onClick={() => {
              playClick();
              onClose();
            }}
            className="pixel-box-wood px-6 py-2 rounded-xs font-pixel text-xs text-[#281608] font-bold hover:brightness-105 active:scale-95"
          >
            Voltar ao Píer
          </button>
        </div>
      </div>
    </div>
  );
};
