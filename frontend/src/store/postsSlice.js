import { createSlice } from '@reduxjs/toolkit';
import api from '../services/api';

const initialState = {
  posts: [],
  loading: false,
  error: null,
  page: 1,
  hasMore: true
};

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setPosts: (state, action) => {
      state.posts = action.payload.posts;
      state.page = action.payload.page;
      state.hasMore = action.payload.hasMore;
      state.loading = false;
    },
    addPost: (state, action) => {
      state.posts.unshift(action.payload);
    },
    updatePost: (state, action) => {
      const index = state.posts.findIndex(p => p._id === action.payload._id);
      if (index !== -1) {
        state.posts[index] = action.payload;
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    }
  }
});

export const { setPosts, addPost, updatePost, setLoading, setError } = postsSlice.actions;

export const fetchFeed = (page = 1) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await api.get(`/posts/feed?page=${page}&limit=20`);
    dispatch(setPosts({
      posts: response.data.posts,
      page: response.data.page,
      hasMore: response.data.hasMore
    }));
  } catch (error) {
    dispatch(setError(error.response?.data?.error || 'Failed to fetch posts'));
  }
};

export const createPost = (postData) => async (dispatch) => {
  try {
    const response = await api.post('/posts', postData);
    dispatch(addPost(response.data.post));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Failed to create post' };
  }
};

export const likePost = (postId) => async (dispatch) => {
  try {
    const response = await api.post(`/posts/${postId}/like`);
    dispatch(updatePost(response.data.post));
  } catch (error) {
    console.error('Failed to like post:', error);
  }
};

export default postsSlice.reducer;
