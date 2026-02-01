/**
 * Socket.io Service for Real-time Notifications
 */

let io = null;
const userSockets = new Map(); // userId -> Set of socket ids

/**
 * Initialize Socket.io server
 */
const initializeSocketIO = (socketIO) => {
  io = socketIO;

  io.on('connection', (socket) => {
    console.log('New socket connection:', socket.id);

    // Handle user authentication/registration
    socket.on('register', (userId) => {
      if (!userId) return;

      // Add socket to user's socket set
      if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
      }
      userSockets.get(userId).add(socket.id);
      
      // Join user's private room
      socket.join(`user:${userId}`);
      
      console.log(`User ${userId} registered with socket ${socket.id}`);
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      const { conversationId, userId, username } = data;
      socket.to(`conversation:${conversationId}`).emit('user_typing', {
        conversationId,
        userId,
        username,
        isTyping: true
      });
    });

    socket.on('typing_stop', (data) => {
      const { conversationId, userId } = data;
      socket.to(`conversation:${conversationId}`).emit('user_typing', {
        conversationId,
        userId,
        isTyping: false
      });
    });

    // Join conversation room
    socket.on('join_conversation', (conversationId) => {
      socket.join(`conversation:${conversationId}`);
    });

    // Leave conversation room
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // Join group room
    socket.on('join_group', (groupId) => {
      socket.join(`group:${groupId}`);
    });

    // Leave group room
    socket.on('leave_group', (groupId) => {
      socket.leave(`group:${groupId}`);
    });

    // Handle presence
    socket.on('presence', (data) => {
      const { userId, status } = data;
      // Broadcast presence to connections
      socket.broadcast.emit('user_presence', { userId, status });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      // Remove socket from all user mappings
      for (const [userId, sockets] of userSockets.entries()) {
        if (sockets.has(socket.id)) {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            userSockets.delete(userId);
            // Broadcast offline status
            io.emit('user_presence', { userId, status: 'offline' });
          }
          break;
        }
      }
      console.log('Socket disconnected:', socket.id);
    });
  });

  return io;
};

/**
 * Get Socket.io instance
 */
const getIO = () => io;

/**
 * Emit event to a specific user (all their connected sockets)
 */
const emitToUser = (userId, event, data) => {
  if (!io) {
    console.warn('Socket.io not initialized');
    return false;
  }

  io.to(`user:${userId}`).emit(event, data);
  return true;
};

/**
 * Emit event to a conversation
 */
const emitToConversation = (conversationId, event, data) => {
  if (!io) return false;
  io.to(`conversation:${conversationId}`).emit(event, data);
  return true;
};

/**
 * Emit event to a group
 */
const emitToGroup = (groupId, event, data) => {
  if (!io) return false;
  io.to(`group:${groupId}`).emit(event, data);
  return true;
};

/**
 * Emit event to multiple users
 */
const emitToUsers = (userIds, event, data) => {
  if (!io) return false;
  userIds.forEach(userId => {
    io.to(`user:${userId}`).emit(event, data);
  });
  return true;
};

/**
 * Broadcast to all connected users
 */
const broadcastAll = (event, data) => {
  if (!io) return false;
  io.emit(event, data);
  return true;
};

/**
 * Check if user is online
 */
const isUserOnline = (userId) => {
  return userSockets.has(userId) && userSockets.get(userId).size > 0;
};

/**
 * Get online user count
 */
const getOnlineUserCount = () => {
  return userSockets.size;
};

/**
 * Get all online user IDs
 */
const getOnlineUsers = () => {
  return Array.from(userSockets.keys());
};

module.exports = {
  initializeSocketIO,
  getIO,
  emitToUser,
  emitToConversation,
  emitToGroup,
  emitToUsers,
  broadcastAll,
  isUserOnline,
  getOnlineUserCount,
  getOnlineUsers
};
