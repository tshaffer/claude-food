import type { LogEntry } from './entities.js';

// ── View models (derived, never persisted) ───────────────────

export interface EnrichedLogEntry extends LogEntry {
  foodName: string;
  unitQuantity: number;
  unitType: string;
  calories: number;
  protein: number;
  fiber: number;
  saturatedFat: number;
  addedSugar: number;
}

export interface DailyTotals {
  date: string;
  calories: number;
  protein: number;
  fiber: number;
  saturatedFat: number;
  addedSugar: number;
}

export interface MealGroup {
  meal: string;
  calories: number;
  protein: number;
  fiber: number;
  saturatedFat: number;
  addedSugar: number;
  entries: EnrichedLogEntry[];
}

export interface TemplatePreviewRow {
  foodId: string;
  foodName: string;
  unitType: string;
  defaultAmount: number;
  finalAmount: number;
  calories: number;
  protein: number;
  fiber: number;
  saturatedFat: number;
  addedSugar: number;
}

// ── Nutrition calculation ────────────────────────────────────

export function calcNutrition(
  actualAmount: number,
  unitQuantity: number,
  caloriesPerUnit: number,
  proteinPerUnit: number,
  fiberPerUnit: number,
  saturatedFatPerUnit: number,
  addedSugarPerUnit: number,
): { calories: number; protein: number; fiber: number; saturatedFat: number; addedSugar: number } {
  const factor = actualAmount / unitQuantity;
  return {
    calories:     Math.round(factor * caloriesPerUnit     * 10) / 10,
    protein:      Math.round(factor * proteinPerUnit      * 10) / 10,
    fiber:        Math.round(factor * fiberPerUnit        * 10) / 10,
    saturatedFat: Math.round(factor * saturatedFatPerUnit * 10) / 10,
    addedSugar:   Math.round(factor * addedSugarPerUnit   * 10) / 10,
  };
}
