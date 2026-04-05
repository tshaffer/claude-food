import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Food, CreateFoodRequest, UpdateFoodRequest } from '@claude-food/domain';
import { api } from '../api/client.js';

export const fetchFoods    = createAsyncThunk('foods/fetchAll', () => api.getFoods());
export const createFood    = createAsyncThunk('foods/create',   (body: CreateFoodRequest) => api.createFood(body));
export const updateFood    = createAsyncThunk('foods/update',   (p: { id: string; body: UpdateFoodRequest }) => api.updateFood(p.id, p.body));
export const deleteFood    = createAsyncThunk('foods/delete',   (id: string) => api.deleteFood(id).then(() => id));

export interface FoodsState {
  items: Food[];
  status: 'idle' | 'loading' | 'error';
}

const initialState: FoodsState = { items: [], status: 'idle' };

const foodsSlice = createSlice({
  name: 'foods',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchFoods.pending,   state => { state.status = 'loading'; })
      .addCase(fetchFoods.fulfilled, (state, action) => { state.status = 'idle'; state.items = action.payload; })
      .addCase(fetchFoods.rejected,  state => { state.status = 'error'; })
      .addCase(createFood.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.items.sort((a, b) => a.name.localeCompare(b.name));
      })
      .addCase(updateFood.fulfilled, (state, action) => {
        const idx = state.items.findIndex(f => f.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteFood.fulfilled, (state, action) => {
        state.items = state.items.filter(f => f.id !== action.payload);
      });
  },
});

export default foodsSlice.reducer;
