require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const messageRoutes = require('./routes/messages');
const groupRoutes = require('./routes/groups');
const userRoutes = require('./routes/users');
const searchRoutes = require('./routes/search');
const moodleRoutes = require('./routes/moodle');

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL 
      : ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/users', userRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/moodle', moodleRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Socket.io connection handling
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User joins with their userId
  socket.on('user:online', (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.userId = userId;
    io.emit('user:status', { userId, isOnline: true });
    console.log(`User ${userId} is online`);
  });

  // Join conversation room
  socket.on('conversation:join', (conversationId) => {
    socket.join(`conversation:${conversationId}`);
    console.log(`User joined conversation: ${conversationId}`);
  });

  // Leave conversation room
  socket.on('conversation:leave', (conversationId) => {
    socket.leave(`conversation:${conversationId}`);
  });

  // Send message
  socket.on('message:send', (data) => {
    const { conversationId, message } = data;
    // Broadcast to all users in the conversation
    socket.to(`conversation:${conversationId}`).emit('message:new', message);
  });

  // Typing indicator
  socket.on('typing:start', (data) => {
    const { conversationId, user } = data;
    socket.to(`conversation:${conversationId}`).emit('typing:start', { user });
  });

  socket.on('typing:stop', (data) => {
    const { conversationId, user } = data;
    socket.to(`conversation:${conversationId}`).emit('typing:stop', { user });
  });

  // Disconnect
  socket.on('disconnect', () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      io.emit('user:status', { userId: socket.userId, isOnline: false });
      console.log(`User ${socket.userId} disconnected`);
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Try to connect to MongoDB
  const dbConnection = await connectDB();
  
  if (!dbConnection) {
    console.log('⚠️  MongoDB not connected. Server running without database.');
    console.log('   Some features will be limited. Install MongoDB or use MongoDB Atlas.');
  }

  server.listen(PORT, () => {
    console.log(`
🚀 Server running on port ${PORT}
📝 Environment: ${process.env.NODE_ENV || 'development'}
🔗 API: http://localhost:${PORT}/api
${dbConnection ? '✅ MongoDB connected' : '❌ MongoDB not connected'}
    `);
  });
};

startServer();
