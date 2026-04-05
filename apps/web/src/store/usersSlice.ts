import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { User } from '@claude-food/domain';
import { api } from '../api/client.js';

export const fetchUsers = createAsyncThunk('users/fetchAll', () => api.getUsers());
export const createUser = createAsyncThunk('users/create', (name: string) => api.createUser(name));

export interface UsersState {
  items: User[];
  status: 'idle' | 'loading' | 'error';
}

const initialState: UsersState = { items: [], status: 'idle' };

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchUsers.pending,   state => { state.status = 'loading'; })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = 'idle';
        state.items = action.payload;
      })
      .addCase(fetchUsers.rejected,  state => { state.status = 'error'; })
      .addCase(createUser.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.items.sort((a, b) => a.name.localeCompare(b.name));
      });
  },
});

export default usersSlice.reducer;
