import type {
  User, Food, LogEntry,
  CreateFoodRequest, UpdateFoodRequest,
  CreateLogEntryRequest, UpdateLogEntryRequest, AddFromTemplateRequest,
  CreateTemplateItemRequest,
} from '@claude-food/domain';
import type { TemplateWithItems } from '../store/templatesSlice.js';

const BASE = '/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  // Users
  getUsers: () => request<User[]>('/users'),
  createUser: (name: string) =>
    request<User>('/users', { method: 'POST', body: JSON.stringify({ name }) }),

  // Foods
  getFoods: () => request<Food[]>('/foods'),
  createFood: (body: CreateFoodRequest) =>
    request<Food>('/foods', { method: 'POST', body: JSON.stringify(body) }),
  updateFood: (id: string, body: UpdateFoodRequest) =>
    request<Food>(`/foods/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteFood: (id: string) =>
    request<void>(`/foods/${id}`, { method: 'DELETE' }),

  // Templates
  getTemplates: (userId: string) =>
    request<TemplateWithItems[]>(`/users/${userId}/templates`),
  createTemplate: (userId: string, name: string) =>
    request<TemplateWithItems>(`/users/${userId}/templates`, {
      method: 'POST', body: JSON.stringify({ userId, name }),
    }),
  updateTemplate: (id: string, name: string, items: CreateTemplateItemRequest[]) =>
    request<TemplateWithItems>(`/templates/${id}`, {
      method: 'PUT', body: JSON.stringify({ name, items }),
    }),
  deleteTemplate: (id: string) =>
    request<void>(`/templates/${id}`, { method: 'DELETE' }),

  // Log entries
  getLogEntries: (userId: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate)   params.set('endDate', endDate);
    const qs = params.toString() ? `?${params}` : '';
    return request<LogEntry[]>(`/users/${userId}/log-entries${qs}`);
  },
  createLogEntry: (userId: string, body: CreateLogEntryRequest) =>
    request<LogEntry>(`/users/${userId}/log-entries`, {
      method: 'POST', body: JSON.stringify(body),
    }),
  addFromTemplate: (userId: string, body: AddFromTemplateRequest) =>
    request<LogEntry[]>(`/users/${userId}/log-entries/from-template`, {
      method: 'POST', body: JSON.stringify(body),
    }),
  updateLogEntry: (id: string, body: UpdateLogEntryRequest) =>
    request<LogEntry>(`/log-entries/${id}`, {
      method: 'PUT', body: JSON.stringify(body),
    }),
  deleteLogEntry: (id: string) =>
    request<void>(`/log-entries/${id}`, { method: 'DELETE' }),
};
