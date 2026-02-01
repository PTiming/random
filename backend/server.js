require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');
const connectDB = require('./config/database');
const syncEngine = require('./services/syncEngine');

// Connect to Database
connectDB();

// Initialize Express App
const app = express();

// Middleware
app.use(cors({
  origin: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/courses', require('./routes/courses'));

// Health Check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date(),
    sync: syncEngine.getSyncStatus()
  });
});

// Webhook endpoint for Moodle
app.post('/api/webhooks/moodle', express.json(), async (req, res) => {
  try {
    const { event, data } = req.body;
    await syncEngine.handleWebhook(event, data);
    res.json({ message: 'Webhook received' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create HTTP Server
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketio(server, {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
  }
});

// Socket.IO Connection Handler
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join user's personal room
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  // Join conversation room
  socket.on('join_conversation', (conversationId) => {
    socket.join(`conversation_${conversationId}`);
    console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
  });

  // Send message
  socket.on('send_message', async (data) => {
    const { conversationId, message } = data;
    
    // Broadcast to conversation room
    io.to(`conversation_${conversationId}`).emit('new_message', message);
    
    // You would also save to database here
    console.log('Message sent:', message);
  });

  // Typing indicator
  socket.on('typing', (data) => {
    const { conversationId, userId, isTyping } = data;
    socket.to(`conversation_${conversationId}`).emit('user_typing', {
      userId,
      isTyping
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Initialize Sync Scheduler
if (process.env.SYNC_ENABLED === 'true') {
  syncEngine.initScheduler();
}

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

module.exports = { app, io };
