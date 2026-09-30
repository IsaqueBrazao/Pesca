export type FishBehavior = 'mixed' | 'smooth' | 'sinker' | 'floater' | 'dart' | 'legendary';

export type FishQuality = 'normal' | 'silver' | 'gold' | 'iridium';

export type LocationType = 'lake' | 'river' | 'ocean';

export interface Fish {
  id: string;
  name: string;
  nameEn: string;
  behavior: FishBehavior;
  difficulty: number; // 15 to 110
  minSize: number; // in inches
  maxSize: number; // in inches
  basePrice: number;
  location: LocationType;
  color: string;
  description: string;
  isLegendary?: boolean;
  flavorText: string;
}

export interface CaughtRecord {
  fishId: string;
  count: number;
  maxSize: number;
  highestQuality: FishQuality;
  firstCaughtTimestamp: number;
}

export interface Rod {
  id: string;
  name: string;
  nameEn: string;
  price: number;
  levelRequired: number;
  allowsBait: boolean;
  allowsTackle: boolean;
  barSizeBonus: number;
  description: string;
}

export interface Tackle {
  id: string;
  name: string;
  nameEn: string;
  price: number;
  description: string;
  icon: string;
}

export interface Bait {
  id: string;
  name: string;
  nameEn: string;
  price: number;
  description: string;
  icon: string;
}

export interface TreasureItem {
  id: string;
  name: string;
  value: number;
  icon: string;
  rarity: 'common' | 'rare' | 'ultra-rare';
}

export interface PlayerStats {
  gold: number;
  xp: number;
  level: number;
  currentRodId: string;
  equippedTackleId: string | null;
  equippedBaitId: string | null;
  baitCount: number;
  tackleDurability: number; // 0 to 100
  totalCasts: number;
  totalCaught: number;
  perfectCatches: number;
  treasuresCaught: number;
  caughtRecords: Record<string, CaughtRecord>;
}
