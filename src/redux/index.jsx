import { configureStore } from "@reduxjs/toolkit";
import userSliceReducer from "./userSlice";
import queryReducer from './querySlice';
import responseReducer from './responseSlice'

export const store = configureStore({
    reducer: {
        user : userSliceReducer,
        query: queryReducer,
        response: responseReducer,
    },
});