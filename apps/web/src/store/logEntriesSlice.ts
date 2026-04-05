import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { LogEntry, CreateLogEntryRequest, UpdateLogEntryRequest, AddFromTemplateRequest } from '@claude-food/domain';
import { api } from '../api/client.js';

export const fetchLogEntries = createAsyncThunk(
  'logEntries/fetch',
  (p: { userId: string; startDate?: string; endDate?: string }) =>
    api.getLogEntries(p.userId, p.startDate, p.endDate)
);
export const createLogEntry = createAsyncThunk(
  'logEntries/create',
  (p: { userId: string; body: CreateLogEntryRequest }) => api.createLogEntry(p.userId, p.body)
);
export const addFromTemplate = createAsyncThunk(
  'logEntries/addFromTemplate',
  (p: { userId: string; body: AddFromTemplateRequest }) => api.addFromTemplate(p.userId, p.body)
);
export const updateLogEntry = createAsyncThunk(
  'logEntries/update',
  (p: { id: string; body: UpdateLogEntryRequest }) => api.updateLogEntry(p.id, p.body)
);
export const deleteLogEntry = createAsyncThunk(
  'logEntries/delete',
  (id: string) => api.deleteLogEntry(id).then(() => id)
);

export interface LogEntriesState {
  items: LogEntry[];
  status: 'idle' | 'loading' | 'error';
}

const initialState: LogEntriesState = { items: [], status: 'idle' };

const logEntriesSlice = createSlice({
  name: 'logEntries',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchLogEntries.pending,   state => { state.status = 'loading'; })
      .addCase(fetchLogEntries.fulfilled, (state, action) => {
        state.status = 'idle';
        state.items = action.payload;
      })
      .addCase(fetchLogEntries.rejected,  state => { state.status = 'error'; })
      .addCase(createLogEntry.fulfilled,  (state, action) => { state.items.push(action.payload); })
      .addCase(addFromTemplate.fulfilled, (state, action) => { state.items.push(...action.payload); })
      .addCase(updateLogEntry.fulfilled,  (state, action) => {
        const idx = state.items.findIndex(e => e.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteLogEntry.fulfilled,  (state, action) => {
        state.items = state.items.filter(e => e.id !== action.payload);
      });
  },
});

export default logEntriesSlice.reducer;
