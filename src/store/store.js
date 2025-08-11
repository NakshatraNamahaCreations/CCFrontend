import { configureStore } from '@reduxjs/toolkit';
import leadsReducer from './slices/leadsSlice.js';

export const store = configureStore({
  reducer: {
    leads: leadsReducer,
  },
});