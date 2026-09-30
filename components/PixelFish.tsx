'use client';

import React from 'react';

interface PixelFishProps {
  color: string;
  isLegendary?: boolean;
  isInsideBar: boolean;
}

/**
 * Handcrafted 16x12 pixel art fish sprite rendered in crisp SVG grid blocks.
 * Authentic Stardew Valley 16-bit retro aesthetic.
 */
export const PixelFish: React.FC<PixelFishProps> = ({
  color,
  isLegendary,
  isInsideBar,
}) => {
  return (
    <div
      className={`relative select-none pointer-events-none transition-transform duration-100 ${
        isInsideBar ? 'scale-110 drop-shadow-[0_0_6px_#86efac]' : 'scale-100 drop-shadow-[0_0_4px_#ef4444]'
      }`}
    >
      {/* Golden Pixel Crown if Legendary */}
      {isLegendary && (
        <svg
          viewBox="0 0 10 5"
          className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-2.5 overflow-visible"
          style={{ imageRendering: 'pixelated' }}
        >
          {/* Pixel crown: gold (#f59e0b) with dark outline (#78350f) */}
          <rect x="0" y="0" width="2" height="2" fill="#fbbf24" />
          <rect x="4" y="0" width="2" height="2" fill="#fde047" />
          <rect x="8" y="0" width="2" height="2" fill="#fbbf24" />
          <rect x="0" y="2" width="10" height="3" fill="#f59e0b" />
          <rect x="2" y="3" width="2" height="1" fill="#ef4444" />
          <rect x="6" y="3" width="2" height="1" fill="#3b82f6" />
        </svg>
      )}

      {/* 16x10 Pixel Art Fish */}
      <svg
        viewBox="0 0 16 10"
        className="w-8 h-6 overflow-visible"
        style={{ shapeRendering: 'crispEdges', imageRendering: 'pixelated' }}
      >
        {/* Tail Fin */}
        <rect x="0" y="1" width="2" height="3" fill={color} />
        <rect x="1" y="2" width="2" height="3" fill={color} />
        <rect x="0" y="6" width="2" height="3" fill={color} />
        <rect x="1" y="5" width="2" height="3" fill={color} />
        <rect x="2" y="3" width="2" height="4" fill={color} />

        {/* Dorsal Fin (Top) */}
        <rect x="6" y="0" width="4" height="2" fill={color} opacity="0.85" />
        <rect x="7" y="1" width="3" height="1" fill="#ffffff" opacity="0.3" />

        {/* Main Body */}
        <rect x="3" y="2" width="9" height="6" fill={color} />
        <rect x="12" y="3" width="2" height="4" fill={color} />
        <rect x="14" y="4" width="1" height="2" fill={color} />

        {/* Belly Shading (Lighter) */}
        <rect x="4" y="6" width="7" height="2" fill="#ffffff" opacity="0.35" />
        <rect x="11" y="6" width="2" height="1" fill="#ffffff" opacity="0.35" />

        {/* Back Highlight */}
        <rect x="5" y="2" width="5" height="1" fill="#ffffff" opacity="0.4" />

        {/* Pixel Eye: White + Dark pupil */}
        <rect x="11" y="3" width="2" height="2" fill="#ffffff" />
        <rect x="12" y="3" width="1" height="2" fill="#18181b" />

        {/* Gill / Fin */}
        <rect x="7" y="4" width="1" height="3" fill="#18181b" opacity="0.4" />
        <rect x="8" y="5" width="2" height="2" fill={color} opacity="0.8" />
      </svg>
    </div>
  );
};
