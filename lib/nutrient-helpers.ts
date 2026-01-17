// nutrient-helpers.ts

import type { OffNutriments } from './off.types';

export interface NormalizedNutrients100g {
  energyKj?: number;
  energyKcal?: number;
  fat?: number;
  saturatedFat?: number;
  carbs?: number;
  sugars?: number;
  fiber?: number;
  protein?: number;
  salt?: number;
  sodium?: number;
}

export function normalizeNutrients100g(
  n: OffNutriments | undefined,
): NormalizedNutrients100g {
  if (!n) return {};
  return {
    energyKj: typeof n.energy_100g === 'number' ? n.energy_100g : undefined,
    energyKcal: typeof n['energy-kcal_100g'] === 'number' ? n['energy-kcal_100g'] : undefined,
    fat: typeof n.fat_100g === 'number' ? n.fat_100g : undefined,
    saturatedFat:
      typeof n['saturated-fat_100g'] === 'number' ? n['saturated-fat_100g'] : undefined,
    carbs:
      typeof n.carbohydrates_100g === 'number' ? n.carbohydrates_100g : undefined,
    sugars: typeof n.sugars_100g === 'number' ? n.sugars_100g : undefined,
    fiber: typeof n.fiber_100g === 'number' ? n.fiber_100g : undefined,
    protein: typeof n.proteins_100g === 'number' ? n.proteins_100g : undefined,
    salt: typeof n.salt_100g === 'number' ? n.salt_100g : undefined,
    sodium: typeof n.sodium_100g === 'number' ? n.sodium_100g : undefined,
  };
}
