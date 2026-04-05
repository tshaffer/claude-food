import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { todayISO } from '@claude-food/shared';

export type ModalState =
  | { type: 'none' }
  | { type: 'addLogEntry'; initialDate?: string; initialMeal?: string }
  | { type: 'editLogEntry'; entryId: string }
  | { type: 'addFromTemplate'; initialDate?: string; initialMeal?: string }
  | { type: 'addFood' }
  | { type: 'editFood'; foodId: string }
  | { type: 'confirmDelete'; label: string; onConfirm: string }; // onConfirm = thunk action name

export interface UIState {
  selectedUserId: string | null;
  todayDate: string;
  modal: ModalState;
}

const initialState: UIState = {
  selectedUserId: null,
  todayDate: todayISO(),
  modal: { type: 'none' },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSelectedUser(state, action: PayloadAction<string | null>) {
      state.selectedUserId = action.payload;
    },
    setTodayDate(state, action: PayloadAction<string>) {
      state.todayDate = action.payload;
    },
    openModal(state, action: PayloadAction<ModalState>) {
      state.modal = action.payload;
    },
    closeModal(state) {
      state.modal = { type: 'none' };
    },
  },
});

export const { setSelectedUser, setTodayDate, openModal, closeModal } = uiSlice.actions;
export default uiSlice.reducer;
