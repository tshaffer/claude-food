// ── Request / response shapes shared by api and web ─────────

export interface CreateUserRequest {
  name: string;
}

export interface CreateFoodRequest {
  name: string;
  unitQuantity: number;
  unitType: string;
  caloriesPerUnit: number;
  proteinPerUnit: number;
  fiberPerUnit: number;
}

export type UpdateFoodRequest = Partial<CreateFoodRequest>;

export interface CreateLogEntryRequest {
  userId: string;
  date: string;
  meal: string;
  foodId: string;
  actualAmount: number;
  templateId?: string | null;
  templateNameSnapshot?: string | null;
}

export type UpdateLogEntryRequest = Partial<
  Pick<CreateLogEntryRequest, 'date' | 'meal' | 'foodId' | 'actualAmount'>
>;

export interface CreateTemplateRequest {
  userId: string;
  name: string;
}

export interface CreateTemplateItemRequest {
  foodId: string;
  lineNumber: number;
  defaultAmount: number;
}

export interface AddFromTemplateRequest {
  date: string;
  meal: string;
  templateId: string;
  multiplier: number;
}
