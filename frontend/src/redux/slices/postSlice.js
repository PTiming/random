import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.token ? { Authorization: `Bearer ${user.token}` } : {};
};

const initialState = {
  posts: [],
  isLoading: false,
  isError: false,
  message: '',
};

// Get news feed
export const getNewsFeed = createAsyncThunk(
  'posts/feed',
  async (page = 1, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/posts/feed?page=${page}`, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create post
export const createPost = createAsyncThunk(
  'posts/create',
  async (postData, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}/posts`, postData, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    reset: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getNewsFeed.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getNewsFeed.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts = action.payload.posts;
      })
      .addCase(getNewsFeed.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload);
      });
  },
});

export const { reset } = postSlice.actions;
export default postSlice.reducer;
