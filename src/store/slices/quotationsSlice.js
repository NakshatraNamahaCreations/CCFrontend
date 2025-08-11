import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    quotations: []
};

const quotationsSlice = createSlice({
    name: 'quotations',
    initialState,
    reducers: {
        updateQuotation: (state, action) => {
            const index = state.quotations.findIndex(q => q.id === action.payload.id);
            if (index !== -1) {
                state.quotations[index] = action.payload;
            }
        }
    }
});

export const { updateQuotation } = quotationsSlice.actions;

export default quotationsSlice.reducer; 