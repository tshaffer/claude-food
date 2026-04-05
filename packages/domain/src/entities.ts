// ── Core domain entities ─────────────────────────────────────

export interface User {
  id: string;
  name: string; // unique
}

export interface Food {
  id: string;
  name: string;
  unitQuantity: number;
  unitType: string;
  caloriesPerUnit: number;
  proteinPerUnit: number;
  fiberPerUnit: number;
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateItem {
  id: string;
  templateId: string;
  lineNumber: number;
  foodId: string;
  defaultAmount: number;
}

export interface LogEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  meal: string; // free-text, e.g. "Breakfast", "Morning Snack"
  templateId?: string | null;
  templateNameSnapshot?: string | null;
  foodId: string;
  actualAmount: number;
  createdAt: string;
  updatedAt: string;
}
