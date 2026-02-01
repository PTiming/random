// Store online users
const onlineUsers = new Map();

const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // User joins (authentication)
    socket.on('join', (userId) => {
      socket.join(userId);
      onlineUsers.set(userId, socket.id);
      console.log(`User ${userId} joined`);
      
      // Broadcast online status
      io.emit('userOnline', { userId, online: true });
    });

    // Join conversation room
    socket.on('joinConversation', (conversationId) => {
      socket.join(conversationId);
      console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
    });

    // Leave conversation room
    socket.on('leaveConversation', (conversationId) => {
      socket.leave(conversationId);
      console.log(`Socket ${socket.id} left conversation ${conversationId}`);
    });

    // Send message in real-time
    socket.on('sendMessage', (data) => {
      const { receiverId, message } = data;
      io.to(receiverId).emit('newMessage', message);
    });

    // Typing indicator
    socket.on('typing', (data) => {
      const { receiverId, userId, username } = data;
      io.to(receiverId).emit('userTyping', { userId, username });
    });

    // Stop typing indicator
    socket.on('stopTyping', (data) => {
      const { receiverId, userId } = data;
      io.to(receiverId).emit('userStopTyping', { userId });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      
      // Find and remove user from online users
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          io.emit('userOnline', { userId, online: false });
          break;
        }
      }
    });
  });
};

module.exports = setupSocket;
