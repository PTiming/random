const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const friendRoutes = require('./routes/friends');
const moodleRoutes = require('./routes/moodle');
const messageRoutes = require('./routes/messages');
const notificationRoutes = require('./routes/notifications');
const searchRoutes = require('./routes/search');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io accessible to routes
app.set('io', io);

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/social_moodle');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/moodle', moodleRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Track online users
const onlineUsers = new Map();

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // User joins their personal room
  socket.on('join', (userId) => {
    socket.join(userId);
    socket.userId = userId;
    onlineUsers.set(userId, socket.id);
    
    // Broadcast online status to friends
    io.emit('userOnline', { userId, isOnline: true });
    console.log(`User ${userId} joined their room`);
  });

  // Join a post room for real-time comments
  socket.on('joinPost', (postId) => {
    socket.join(`post:${postId}`);
    console.log(`Socket ${socket.id} joined post room: ${postId}`);
  });

  // Leave a post room
  socket.on('leavePost', (postId) => {
    socket.leave(`post:${postId}`);
    console.log(`Socket ${socket.id} left post room: ${postId}`);
  });

  // Real-time direct message
  socket.on('sendMessage', (data) => {
    io.to(data.receiverId).emit('receiveMessage', data);
  });

  // Typing indicator
  socket.on('typing', (data) => {
    socket.to(data.receiverId).emit('userTyping', data);
  });

  // Stop typing indicator
  socket.on('stopTyping', (data) => {
    socket.to(data.receiverId).emit('userStopTyping', data);
  });

  // Real-time comment on post
  socket.on('newComment', (data) => {
    // Broadcast to everyone viewing the post
    socket.to(`post:${data.postId}`).emit('commentAdded', data);
  });

  // Real-time like on post
  socket.on('likePost', (data) => {
    socket.to(`post:${data.postId}`).emit('postLiked', data);
  });

  // Friend request events
  socket.on('friendRequest', (data) => {
    io.to(data.toUserId).emit('friendRequestReceived', data);
  });

  socket.on('friendRequestAccepted', (data) => {
    io.to(data.toUserId).emit('friendRequestWasAccepted', data);
  });

  // Follow events
  socket.on('follow', (data) => {
    io.to(data.followedUserId).emit('newFollower', data);
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      io.emit('userOnline', { userId: socket.userId, isOnline: false });
    }
    console.log('Client disconnected:', socket.id);
  });
});

// Make onlineUsers accessible
app.set('onlineUsers', onlineUsers);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
}

module.exports = { app, server, connectDB };
