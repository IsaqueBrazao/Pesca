'use client';

import React, { useState } from 'react';
import { Rod, Tackle, Bait, PlayerStats } from '@/types/game';
import { RODS, TACKLES, BAITS } from '@/lib/fishData';
import { playClick } from '@/lib/soundEffects';

interface WillyShopModalProps {
  stats: PlayerStats;
  onBuyRod: (rod: Rod) => void;
  onBuyTackle: (tackle: Tackle) => void;
  onBuyBait: (bait: Bait, amount: number) => void;
  onEquipTackle: (tackleId: string | null) => void;
  onEquipBait: (baitId: string | null) => void;
  onClose: () => void;
}

export const WillyShopModal: React.FC<WillyShopModalProps> = ({
  stats,
  onBuyRod,
  onBuyTackle,
  onBuyBait,
  onEquipTackle,
  onEquipBait,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'rods' | 'tackles' | 'baits'>('rods');

  const currentRod = RODS.find((r) => r.id === stats.currentRodId) || RODS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
      <div className="relative pixel-box-parchment p-6 max-w-2xl w-full rounded-sm shadow-2xl border-4 border-[#4a2810] max-h-[90vh] flex flex-col">
        {/* Willy Header & Greeting */}
        <div className="flex items-center justify-between border-b-2 border-[#804c1e] pb-3 mb-4">
          <div className="flex items-center gap-3">
            {/* Willy Avatar Frame */}
            <div className="w-12 h-12 bg-[#fed7aa] border-2 border-[#804c1e] rounded flex items-center justify-center text-2xl shadow-inner">
              🧔🏻‍♂️
            </div>
            <div>
              <h2 className="font-pixel text-sm text-[#281608] font-bold">
                Loja de Pesca do Willy
              </h2>
              <p className="font-pixel-retro text-base text-[#804c1e]">
                &quot;Ah, olá jovem pescador! Procurando equipamentos melhores para o lago?&quot;
              </p>
            </div>
          </div>

          {/* Player Gold */}
          <div className="bg-[#fcd34d] border-2 border-[#b45309] px-3 py-1.5 rounded flex items-center gap-1.5 shadow-sm">
            <span className="font-pixel text-xs text-[#78350f] font-bold">
              {stats.gold}g 🪙
            </span>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 mb-4 border-b border-[#d8b275] pb-2">
          <button
            onClick={() => {
              playClick();
              setActiveTab('rods');
            }}
            className={`px-3 py-1.5 rounded-xs font-pixel text-[10px] transition-colors cursor-pointer ${
              activeTab === 'rods'
                ? 'bg-[#804c1e] text-[#f7e7c4]'
                : 'bg-[#fed7aa]/60 text-[#4a2810] hover:bg-[#fed7aa]'
            }`}
          >
            🎣 Varas de Pesca
          </button>
          <button
            onClick={() => {
              playClick();
              setActiveTab('tackles');
            }}
            className={`px-3 py-1.5 rounded-xs font-pixel text-[10px] transition-colors cursor-pointer ${
              activeTab === 'tackles'
                ? 'bg-[#804c1e] text-[#f7e7c4]'
                : 'bg-[#fed7aa]/60 text-[#4a2810] hover:bg-[#fed7aa]'
            }`}
          >
            🪝 Boias & Anzóis
          </button>
          <button
            onClick={() => {
              playClick();
              setActiveTab('baits');
            }}
            className={`px-3 py-1.5 rounded-xs font-pixel text-[10px] transition-colors cursor-pointer ${
              activeTab === 'baits'
                ? 'bg-[#804c1e] text-[#f7e7c4]'
                : 'bg-[#fed7aa]/60 text-[#4a2810] hover:bg-[#fed7aa]'
            }`}
          >
            🐛 Iscas
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          {/* RODS TAB */}
          {activeTab === 'rods' && (
            <div className="space-y-3">
              {RODS.map((rod) => {
                const isOwned =
                  rod.id === stats.currentRodId ||
                  (rod.id === 'bamboo_pole' && stats.currentRodId !== 'bamboo_pole') ||
                  (rod.id === 'fiberglass_rod' && stats.currentRodId === 'iridium_rod');
                const isCurrent = rod.id === stats.currentRodId;
                const canAfford = stats.gold >= rod.price;
                const levelOk = stats.level >= rod.levelRequired;

                return (
                  <div
                    key={rod.id}
                    className={`p-3 rounded-xs border-2 flex items-center justify-between gap-4 ${
                      isCurrent
                        ? 'bg-amber-100/80 border-amber-600'
                        : 'bg-[#fff7de] border-[#d8b275]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">🎣</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-pixel text-xs text-[#281608] font-bold">
                            {rod.name}
                          </h4>
                          {isCurrent && (
                            <span className="bg-emerald-700 text-white font-pixel text-[8px] px-1.5 py-0.5 rounded">
                              Equipada
                            </span>
                          )}
                        </div>
                        <p className="font-pixel-retro text-sm text-[#4a2810]">
                          {rod.description}
                        </p>
                        <div className="flex items-center gap-3 mt-1 font-pixel text-[8px] text-[#804c1e]">
                          <span>Nível Requerido: {rod.levelRequired}</span>
                          <span>Bônus da Barra: +{rod.barSizeBonus}px</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      {isCurrent ? (
                        <span className="font-pixel text-[10px] text-emerald-800 font-bold">
                          Em Uso
                        </span>
                      ) : isOwned ? (
                        <button
                          onClick={() => {
                            playClick();
                            onBuyRod(rod);
                          }}
                          className="pixel-box-wood px-3 py-1.5 rounded-xs font-pixel text-[9px] text-[#281608] hover:brightness-105 active:scale-95"
                        >
                          Equipar
                        </button>
                      ) : (
                        <button
                          disabled={!canAfford || !levelOk}
                          onClick={() => {
                            playClick();
                            onBuyRod(rod);
                          }}
                          className={`pixel-box-wood px-4 py-2 rounded-xs font-pixel text-[9px] ${
                            canAfford && levelOk
                              ? 'text-[#281608] hover:brightness-105 active:scale-95 cursor-pointer'
                              : 'opacity-50 cursor-not-allowed text-stone-500'
                          }`}
                        >
                          Comprar ({rod.price}g)
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TACKLES TAB */}
          {activeTab === 'tackles' && (
            <div className="space-y-3">
              {!currentRod.allowsTackle && (
                <div className="bg-amber-100 border border-amber-400 p-2.5 rounded font-pixel text-[9px] text-amber-900 mb-2">
                  ⚠️ Sua vara atual ({currentRod.name}) não suporta boias! Adquira a{' '}
                  <strong>Vara de Irídio</strong> para utilizar estes itens especiais.
                </div>
              )}

              {TACKLES.map((tackle) => {
                const isEquipped = stats.equippedTackleId === tackle.id;
                const canAfford = stats.gold >= tackle.price;

                return (
                  <div
                    key={tackle.id}
                    className="p-3 bg-[#fff7de] border-2 border-[#d8b275] rounded-xs flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{tackle.icon}</span>
                      <div>
                        <h4 className="font-pixel text-xs text-[#281608] font-bold">
                          {tackle.name}
                        </h4>
                        <p className="font-pixel-retro text-sm text-[#4a2810]">
                          {tackle.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isEquipped ? (
                        <button
                          onClick={() => {
                            playClick();
                            onEquipTackle(null);
                          }}
                          className="bg-rose-700 text-white font-pixel text-[9px] px-3 py-1.5 rounded-xs hover:bg-rose-800"
                        >
                          Remover
                        </button>
                      ) : (
                        <button
                          disabled={!canAfford || !currentRod.allowsTackle}
                          onClick={() => {
                            playClick();
                            onBuyTackle(tackle);
                          }}
                          className={`pixel-box-wood px-4 py-2 rounded-xs font-pixel text-[9px] ${
                            canAfford && currentRod.allowsTackle
                              ? 'text-[#281608] hover:brightness-105 active:scale-95 cursor-pointer'
                              : 'opacity-50 cursor-not-allowed text-stone-500'
                          }`}
                        >
                          Comprar ({tackle.price}g)
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* BAITS TAB */}
          {activeTab === 'baits' && (
            <div className="space-y-3">
              {!currentRod.allowsBait && (
                <div className="bg-amber-100 border border-amber-400 p-2.5 rounded font-pixel text-[9px] text-amber-900 mb-2">
                  ⚠️ Sua vara de bambu não suporta iscas! Adquira pelo menos a{' '}
                  <strong>Vara de Fibra de Vidro</strong> para usar iscas.
                </div>
              )}

              {BAITS.map((bait) => {
                const isEquipped = stats.equippedBaitId === bait.id;
                const canAfford5 = stats.gold >= bait.price * 5;

                return (
                  <div
                    key={bait.id}
                    className="p-3 bg-[#fff7de] border-2 border-[#d8b275] rounded-xs flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{bait.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-pixel text-xs text-[#281608] font-bold">
                            {bait.name}
                          </h4>
                          {isEquipped && (
                            <span className="bg-emerald-700 text-white font-pixel text-[8px] px-1.5 py-0.5 rounded">
                              Equipada ({stats.baitCount} restantes)
                            </span>
                          )}
                        </div>
                        <p className="font-pixel-retro text-sm text-[#4a2810]">
                          {bait.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        disabled={!canAfford5 || !currentRod.allowsBait}
                        onClick={() => {
                          playClick();
                          onBuyBait(bait, 5);
                        }}
                        className={`pixel-box-wood px-3 py-1.5 rounded-xs font-pixel text-[9px] ${
                          canAfford5 && currentRod.allowsBait
                            ? 'text-[#281608] hover:brightness-105 active:scale-95 cursor-pointer'
                            : 'opacity-50 cursor-not-allowed text-stone-500'
                        }`}
                      >
                        Comprar x5 ({bait.price * 5}g)
                      </button>

                      {isEquipped && (
                        <button
                          onClick={() => {
                            playClick();
                            onEquipBait(null);
                          }}
                          className="bg-stone-600 text-white font-pixel text-[8px] px-2 py-1 rounded"
                        >
                          Desequipar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
            Fechar Loja
          </button>
        </div>
      </div>
    </div>
  );
};
