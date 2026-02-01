const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/chats', require('./routes/chatRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'MERN Chat API is running' });
});

// Create HTTP server
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New socket connection:', socket.id);

  // User joins their personal room
  socket.on('setup', (userData) => {
    socket.join(userData._id);
    socket.emit('connected');
    console.log(`User ${userData.name} joined room: ${userData._id}`);
  });

  // User joins a chat room
  socket.on('join chat', (room) => {
    socket.join(room);
    console.log(`User joined chat room: ${room}`);
  });

  // User leaves a chat room
  socket.on('leave chat', (room) => {
    socket.leave(room);
    console.log(`User left chat room: ${room}`);
  });

  // Typing indicator
  socket.on('typing', (room) => {
    socket.in(room).emit('typing', room);
  });

  socket.on('stop typing', (room) => {
    socket.in(room).emit('stop typing', room);
  });

  // New message
  socket.on('new message', (newMessageReceived) => {
    const chat = newMessageReceived.chat;

    if (!chat.users) return console.log('chat.users not defined');

    chat.users.forEach((user) => {
      if (user._id === newMessageReceived.sender._id) return;

      // Send to user's personal room
      socket.in(user._id).emit('message received', newMessageReceived);
      
      // Send notification to user
      socket.in(user._id).emit('notification received', {
        message: newMessageReceived,
        chat: chat,
      });
    });
  });

  // Mark messages as read
  socket.on('messages read', ({ chatId, userId }) => {
    socket.in(chatId).emit('messages read', { chatId, userId });
  });

  // User online status
  socket.on('user online', (userId) => {
    socket.broadcast.emit('user status', { userId, isOnline: true });
  });

  socket.on('user offline', (userId) => {
    socket.broadcast.emit('user status', { userId, isOnline: false });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
