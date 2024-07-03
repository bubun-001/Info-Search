import { createSlice } from '@reduxjs/toolkit';

export const querySlice = createSlice({
  name: 'query',
  initialState: {
    formData: {
      language: '',
      grade: '',
      bookType: '',
      book: '',
      topic: '',
      query: '',
      model: '',
    },
  },
  reducers: {
    updateFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    resetFormData: (state) => {
      state.formData = {
        language: '',
        grade: '',
        bookType: '',
        book: '',
        topic: '',
        query: '',
        model: '',
      };
    },
  },
});

export const { updateFormData, resetFormData } = querySlice.actions;

export const selectFormData = (state) => state.query.formData;

export default querySlice.reducer;
