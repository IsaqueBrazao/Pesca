'use client';

import React from 'react';

interface PixelTreasureProps {
  collected: boolean;
}

export const PixelTreasure: React.FC<PixelTreasureProps> = ({ collected }) => {
  return (
    <svg
      viewBox="0 0 14 12"
      className={`w-6 h-5 overflow-visible transition-opacity ${
        collected ? 'opacity-30' : 'animate-bounce'
      }`}
      style={{ shapeRendering: 'crispEdges', imageRendering: 'pixelated' }}
    >
      {/* Chest Lid */}
      <rect x="1" y="0" width="12" height="2" fill="#78350f" />
      <rect x="0" y="2" width="14" height="3" fill="#92400e" />
      {/* Iron bands on lid */}
      <rect x="2" y="0" width="2" height="5" fill="#52525b" />
      <rect x="10" y="0" width="2" height="5" fill="#52525b" />

      {/* Chest Base */}
      <rect x="0" y="5" width="14" height="7" fill="#b45309" />
      <rect x="1" y="6" width="12" height="5" fill="#d97706" />

      {/* Iron bands on base */}
      <rect x="2" y="5" width="2" height="7" fill="#3f3f46" />
      <rect x="10" y="5" width="2" height="7" fill="#3f3f46" />

      {/* Gold Keyhole / Lock */}
      <rect x="6" y="4" width="2" height="3" fill="#facc15" />
      <rect x="6" y="5" width="2" height="1" fill="#78350f" />
    </svg>
  );
};
