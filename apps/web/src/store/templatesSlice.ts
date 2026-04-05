import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Template, TemplateItem, CreateTemplateItemRequest } from '@claude-food/domain';
import { api } from '../api/client.js';

export interface TemplateWithItems extends Template {
  items: TemplateItem[];
}

export const fetchTemplates = createAsyncThunk(
  'templates/fetchAll',
  (userId: string) => api.getTemplates(userId)
);
export const createTemplate = createAsyncThunk(
  'templates/create',
  (p: { userId: string; name: string }) => api.createTemplate(p.userId, p.name)
);
export const updateTemplate = createAsyncThunk(
  'templates/update',
  (p: { id: string; name: string; items: CreateTemplateItemRequest[] }) =>
    api.updateTemplate(p.id, p.name, p.items)
);
export const deleteTemplate = createAsyncThunk(
  'templates/delete',
  (id: string) => api.deleteTemplate(id).then(() => id)
);

export interface TemplatesState {
  items: TemplateWithItems[];
  status: 'idle' | 'loading' | 'error';
}

const initialState: TemplatesState = { items: [], status: 'idle' };

const templatesSlice = createSlice({
  name: 'templates',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchTemplates.pending,   state => { state.status = 'loading'; })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.status = 'idle';
        state.items = action.payload;
      })
      .addCase(fetchTemplates.rejected,  state => { state.status = 'error'; })
      .addCase(createTemplate.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.items.sort((a, b) => a.name.localeCompare(b.name));
      })
      .addCase(updateTemplate.fulfilled, (state, action) => {
        const idx = state.items.findIndex(t => t.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteTemplate.fulfilled, (state, action) => {
        state.items = state.items.filter(t => t.id !== action.payload);
      });
  },
});

export default templatesSlice.reducer;
