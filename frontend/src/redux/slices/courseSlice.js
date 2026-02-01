import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.token ? { Authorization: `Bearer ${user.token}` } : {};
};

const initialState = {
  courses: [],
  currentCourse: null,
  isLoading: false,
  isError: false,
  message: '',
};

// Get courses
export const getCourses = createAsyncThunk(
  'courses/getAll',
  async (enrolled = false, thunkAPI) => {
    try {
      const response = await axios.get(
        `${API_URL}/courses?enrolled=${enrolled}`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Sync from Moodle
export const syncFromMoodle = createAsyncThunk(
  'courses/syncFromMoodle',
  async (_, thunkAPI) => {
    try {
      const response = await axios.post(
        `${API_URL}/courses/sync-from-moodle`,
        {},
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const courseSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    reset: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCourses.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCourses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courses = action.payload.courses;
      })
      .addCase(getCourses.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(syncFromMoodle.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(syncFromMoodle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courses = action.payload.courses;
      })
      .addCase(syncFromMoodle.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = courseSlice.actions;
export default courseSlice.reducer;
