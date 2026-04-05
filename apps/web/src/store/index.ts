import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './uiSlice.js';
import usersReducer from './usersSlice.js';
import foodsReducer from './foodsSlice.js';
import templatesReducer from './templatesSlice.js';
import logEntriesReducer from './logEntriesSlice.js';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    users: usersReducer,
    foods: foodsReducer,
    templates: templatesReducer,
    logEntries: logEntriesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
