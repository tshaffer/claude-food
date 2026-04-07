import type { RootState } from './index.js';
import type { EnrichedLogEntry, MealGroup, DailyTotals } from '@claude-food/domain';
import { calcNutrition } from '@claude-food/domain';

// ── Base selectors ───────────────────────────────────────────

export const selectSelectedUserId = (s: RootState) => s.ui.selectedUserId;
export const selectTodayDate      = (s: RootState) => s.ui.todayDate;
export const selectModal          = (s: RootState) => s.ui.modal;
export const selectLastMeal       = (s: RootState) => s.ui.lastMeal;
export const selectUsers          = (s: RootState) => s.users.items;
export const selectFoods          = (s: RootState) => s.foods.items;
export const selectFoodsById      = (s: RootState) =>
  Object.fromEntries(s.foods.items.map(f => [f.id, f]));
export const selectAllLogEntries  = (s: RootState) => s.logEntries.items;
export const selectTemplates      = (s: RootState) => s.templates.items;

// ── Enriched entries ─────────────────────────────────────────

export function selectEnrichedEntries(s: RootState): EnrichedLogEntry[] {
  const foodsById = selectFoodsById(s);
  return s.logEntries.items
    .map(entry => {
      const food = foodsById[entry.foodId];
      if (!food) return null;
      const { calories, protein, fiber } = calcNutrition(
        entry.actualAmount, food.unitQuantity,
        food.caloriesPerUnit, food.proteinPerUnit, food.fiberPerUnit
      );
      return {
        ...entry,
        foodName: food.name,
        unitQuantity: food.unitQuantity,
        unitType: food.unitType,
        calories, protein, fiber,
      };
    })
    .filter((e): e is EnrichedLogEntry => e !== null);
}

// ── Entries for a specific date ──────────────────────────────

export function selectEntriesForDate(s: RootState, date: string): EnrichedLogEntry[] {
  return selectEnrichedEntries(s).filter(e => e.date === date);
}

// ── Meal groups for a date ───────────────────────────────────

export function selectMealGroupsForDate(s: RootState, date: string): MealGroup[] {
  const entries = selectEntriesForDate(s, date);
  const mealOrder: string[] = [];
  const groups: Record<string, EnrichedLogEntry[]> = {};

  for (const entry of entries) {
    if (!groups[entry.meal]) {
      groups[entry.meal] = [];
      mealOrder.push(entry.meal);
    }
    groups[entry.meal].push(entry);
  }

  return mealOrder.map(meal => {
    const mealEntries = groups[meal];
    return {
      meal,
      calories: mealEntries.reduce((s, e) => s + e.calories, 0),
      protein:  mealEntries.reduce((s, e) => s + e.protein,  0),
      fiber:    mealEntries.reduce((s, e) => s + e.fiber,    0),
      entries:  mealEntries,
    };
  });
}

// ── Daily totals ─────────────────────────────────────────────

export function selectDailyTotals(s: RootState): DailyTotals[] {
  const enriched = selectEnrichedEntries(s);
  const map: Record<string, DailyTotals> = {};

  for (const e of enriched) {
    if (!map[e.date]) map[e.date] = { date: e.date, calories: 0, protein: 0, fiber: 0 };
    map[e.date].calories += e.calories;
    map[e.date].protein  += e.protein;
    map[e.date].fiber    += e.fiber;
  }

  return Object.values(map).sort((a, b) => b.date.localeCompare(a.date));
}

// ── Totals for a specific date ───────────────────────────────

export function selectTotalsForDate(s: RootState, date: string): DailyTotals {
  const entries = selectEntriesForDate(s, date);
  return {
    date,
    calories: entries.reduce((s, e) => s + e.calories, 0),
    protein:  entries.reduce((s, e) => s + e.protein,  0),
    fiber:    entries.reduce((s, e) => s + e.fiber,    0),
  };
}
