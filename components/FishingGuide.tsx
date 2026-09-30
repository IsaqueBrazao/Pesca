'use client';

import React, { useState } from 'react';
import { playClick } from '@/lib/soundEffects';

export const FishingGuide: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between bg-[#38200d] border border-[#5c3416] px-4 py-2 rounded-sm text-xs font-pixel text-[#fed7aa]">
        <div className="flex items-center gap-2">
          <span>📖</span>
          <span className="text-[9px]">Manual de Pesca do Vale: Mecânica idêntica ao Stardew Valley</span>
        </div>
        <button
          onClick={() => {
            playClick();
            setIsOpen(!isOpen);
          }}
          className="text-[#f6bf7a] hover:underline cursor-pointer text-[9px]"
        >
          {isOpen ? 'Ocultar Guia ▲' : 'Ver Dicas ▼'}
        </button>
      </div>

      {isOpen && (
        <div className="mt-2 pixel-box-parchment p-4 rounded-sm border-2 border-[#4a2810] text-[#281608] space-y-3 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-pixel text-[8px] leading-relaxed">
            <div className="bg-[#fff7de] p-2.5 rounded border border-[#d8b275]">
              <h4 className="font-bold text-[#804c1e] text-[9px] mb-1">
                🕹️ Controle da Barra Verde
              </h4>
              <p>
                • <strong>Segurar botão / [Espaço]:</strong> Impulsiona a barra verde para cima com aceleração contínua.
              </p>
              <p className="mt-1">
                • <strong>Soltar:</strong> A gravidade puxa a barra para baixo.
              </p>
              <p className="mt-1">
                • <strong>Toques rápidos:</strong> O segredo dos mestres! Pequenos cliques ritmados equilibram a barra no ar.
              </p>
            </div>

            <div className="bg-[#fff7de] p-2.5 rounded border border-[#d8b275]">
              <h4 className="font-bold text-[#804c1e] text-[9px] mb-1">
                ⚓ Rebote & Física Real
              </h4>
              <p>
                • <strong>Rebote no fundo:</strong> Se soltar a barra livremente, ela baterá no fundo e rebaterá com força elástica!
              </p>
              <p className="mt-1">
                • <strong>Boia Pesada (Lead Bobber):</strong> Remove o impacto elástico do chão para facilitar peixes de fundo.
              </p>
            </div>

            <div className="bg-[#fff7de] p-2.5 rounded border border-[#d8b275]">
              <h4 className="font-bold text-[#804c1e] text-[9px] mb-1">
                ⭐ Perfeito & Baús
              </h4>
              <p>
                • <strong>Captura Perfeita:</strong> Se o peixe nunca sair da barra durante a captura, você ganha 2.4x de XP e peixe com estrela Irídio!
              </p>
              <p className="mt-1">
                • <strong>Baú de Tesouro:</strong> Pare a barra verde sobre o baú até destravá-lo, mas não deixe o peixe escapar!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
