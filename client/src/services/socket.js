import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(userId) {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      withCredentials: true
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
      if (userId) {
        this.socket.emit('user:online', userId);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // User status
  onUserStatus(callback) {
    this.socket?.on('user:status', callback);
  }

  // Conversations
  joinConversation(conversationId) {
    this.socket?.emit('conversation:join', conversationId);
  }

  leaveConversation(conversationId) {
    this.socket?.emit('conversation:leave', conversationId);
  }

  // Messages
  sendMessage(conversationId, message) {
    this.socket?.emit('message:send', { conversationId, message });
  }

  onNewMessage(callback) {
    this.socket?.on('message:new', callback);
  }

  offNewMessage() {
    this.socket?.off('message:new');
  }

  // Typing indicators
  startTyping(conversationId, user) {
    this.socket?.emit('typing:start', { conversationId, user });
  }

  stopTyping(conversationId, user) {
    this.socket?.emit('typing:stop', { conversationId, user });
  }

  onTypingStart(callback) {
    this.socket?.on('typing:start', callback);
  }

  onTypingStop(callback) {
    this.socket?.on('typing:stop', callback);
  }

  offTyping() {
    this.socket?.off('typing:start');
    this.socket?.off('typing:stop');
  }
}

export const socketService = new SocketService();
export default socketService;
