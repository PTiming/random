import { create } from 'zustand';
import api from '../utils/api';

export const useMessageStore = create((set, get) => ({
  conversations: [],
  currentConversation: [],
  activeChat: null,
  unreadCount: 0,
  loading: false,

  fetchConversations: async () => {
    try {
      const res = await api.get('/messages/conversations');
      set({ conversations: res.data });
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  },

  fetchConversation: async (userId) => {
    set({ loading: true, activeChat: userId });
    try {
      const res = await api.get(`/messages/conversation/${userId}`);
      set({ currentConversation: res.data, loading: false });
    } catch (error) {
      console.error('Error fetching conversation:', error);
      set({ loading: false });
    }
  },

  sendMessage: async (receiverId, content) => {
    try {
      const res = await api.post('/messages', { receiver: receiverId, content });
      set({ currentConversation: [...get().currentConversation, res.data] });
      return { success: true, message: res.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  },

  addMessage: (message) => {
    set({ currentConversation: [...get().currentConversation, message] });
  },

  fetchUnreadCount: async () => {
    try {
      const res = await api.get('/messages/unread');
      set({ unreadCount: res.data.unreadCount });
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  },

  clearActiveChat: () => {
    set({ activeChat: null, currentConversation: [] });
  }
}));
