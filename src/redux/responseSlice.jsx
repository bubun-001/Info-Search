import { createSlice } from '@reduxjs/toolkit';

export const responseSlice = createSlice({
  name: 'response',
  initialState: {
    chunksData: {},
  },
  reducers: {
    updateChunksData: (state, action) => {
      state.chunksData = action.payload;
    },
    resetChunksData: (state) => {
      state.chunksData = {};
    },
  },
});

export const { updateChunksData, resetChunksData } = responseSlice.actions;

export const selectChunksData = (state) => state.response.chunksData;

export default responseSlice.reducer;
