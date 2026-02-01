require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const setupSocket = require('./socket/socketHandler');
const { apiLimiter, authLimiter, createLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const messageRoutes = require('./routes/messages');
const notificationRoutes = require('./routes/notifications');

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Setup socket handlers
setupSocket(io);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Apply rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Make io accessible in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Connect to MongoDB
connectDB();

// Routes with rate limiting for create operations
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
