import type { LogEntry } from './entities.js';

// ── View models (derived, never persisted) ───────────────────

export interface EnrichedLogEntry extends LogEntry {
  foodName: string;
  unitQuantity: number;
  unitType: string;
  calories: number;
  protein: number;
  fiber: number;
}

export interface DailyTotals {
  date: string;
  calories: number;
  protein: number;
  fiber: number;
}

export interface MealGroup {
  meal: string;
  calories: number;
  protein: number;
  fiber: number;
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
}

// ── Nutrition calculation ────────────────────────────────────

export function calcNutrition(
  actualAmount: number,
  unitQuantity: number,
  caloriesPerUnit: number,
  proteinPerUnit: number,
  fiberPerUnit: number
): { calories: number; protein: number; fiber: number } {
  const factor = actualAmount / unitQuantity;
  return {
    calories: Math.round(factor * caloriesPerUnit * 10) / 10,
    protein:  Math.round(factor * proteinPerUnit  * 10) / 10,
    fiber:    Math.round(factor * fiberPerUnit    * 10) / 10,
  };
}
