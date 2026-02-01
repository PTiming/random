import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import postReducer from './slices/postSlice';
import courseReducer from './slices/courseSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postReducer,
    courses: courseReducer,
  },
});
