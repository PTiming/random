import { create } from 'zustand';
import api from '../utils/api';

export const usePostStore = create((set, get) => ({
  posts: [],
  currentPage: 1,
  totalPages: 1,
  loading: false,

  fetchPosts: async (page = 1) => {
    set({ loading: true });
    try {
      const res = await api.get(`/posts?page=${page}&limit=10`);
      set({
        posts: page === 1 ? res.data.posts : [...get().posts, ...res.data.posts],
        currentPage: res.data.currentPage,
        totalPages: res.data.totalPages,
        loading: false
      });
    } catch (error) {
      console.error('Error fetching posts:', error);
      set({ loading: false });
    }
  },

  createPost: async (content, image) => {
    try {
      const res = await api.post('/posts', { content, image });
      set({ posts: [res.data, ...get().posts] });
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  },

  likePost: async (postId) => {
    try {
      const res = await api.post(`/posts/${postId}/like`);
      set({
        posts: get().posts.map(post =>
          post._id === postId
            ? { ...post, likes: res.data.liked 
                ? [...post.likes, 'temp'] 
                : post.likes.slice(0, -1) }
            : post
        )
      });
    } catch (error) {
      console.error('Error liking post:', error);
    }
  },

  deletePost: async (postId) => {
    try {
      await api.delete(`/posts/${postId}`);
      set({ posts: get().posts.filter(post => post._id !== postId) });
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  },

  addNewPost: (post) => {
    set({ posts: [post, ...get().posts] });
  },

  addComment: (postId, comment) => {
    set({
      posts: get().posts.map(post =>
        post._id === postId
          ? { ...post, comments: [...post.comments, comment] }
          : post
      )
    });
  }
}));
