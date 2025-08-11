import { configureStore } from '@reduxjs/toolkit';
import leadsReducer from './slices/leadsSlice';
import quotationsReducer from './slices/quotationsSlice';

export const store = configureStore({
    reducer: {
        leads: leadsReducer,
        quotations: quotationsReducer
    }
}); 