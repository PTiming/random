require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const SocketHandler = require('./utils/socketHandler');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const courseRoutes = require('./routes/courses');
const gradeRoutes = require('./routes/grades');

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Socket Handler for two-way sync
const socketHandler = new SocketHandler(io);

// Make socket handler available to routes
app.use((req, res, next) => {
  req.io = io;
  req.socketHandler = socketHandler;
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/grades', gradeRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'LMS API is running',
    timestamp: new Date().toISOString()
  });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'LMS API with RBAC',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
        updateProfile: 'PUT /api/auth/profile',
        changePassword: 'PUT /api/auth/password'
      },
      users: {
        getAll: 'GET /api/users (Admin)',
        getById: 'GET /api/users/:id',
        create: 'POST /api/users (Admin)',
        update: 'PUT /api/users/:id (Admin)',
        delete: 'DELETE /api/users/:id (Admin)',
        changeRole: 'PUT /api/users/:id/role (Admin)',
        getByRole: 'GET /api/users/role/:role (Teacher/Admin)'
      },
      courses: {
        getAll: 'GET /api/courses',
        getById: 'GET /api/courses/:id',
        create: 'POST /api/courses (Teacher/Admin)',
        update: 'PUT /api/courses/:id (Teacher/Admin)',
        delete: 'DELETE /api/courses/:id (Teacher/Admin)',
        enroll: 'POST /api/courses/:id/enroll (Student)',
        unenroll: 'DELETE /api/courses/:id/enroll (Student)',
        teacherCourses: 'GET /api/courses/teacher/my-courses (Teacher)',
        enrolledCourses: 'GET /api/courses/student/enrolled (Student)'
      },
      grades: {
        myGrades: 'GET /api/grades/my-grades (Student)',
        studentGrades: 'GET /api/grades/student/:id (Teacher/Admin)',
        courseGrades: 'GET /api/grades/course/:id (Teacher/Admin)',
        create: 'POST /api/grades (Teacher/Admin)',
        update: 'PUT /api/grades/:id (Teacher/Admin)',
        delete: 'DELETE /api/grades/:id (Admin)'
      }
    },
    roles: ['admin', 'teacher', 'student'],
    realtime: {
      events: [
        'join:course',
        'leave:course',
        'sync:request',
        'sync:response',
        'data:update',
        'data:changed',
        'notification'
      ]
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🎓 LMS Server with RBAC is running                      ║
║                                                           ║
║   📍 API:      http://localhost:${PORT}/api                  ║
║   📍 Health:   http://localhost:${PORT}/api/health           ║
║   🔌 Socket:   ws://localhost:${PORT}                        ║
║                                                           ║
║   Roles: Admin | Teacher | Student                        ║
║   Two-way sync: Enabled via Socket.io                     ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

module.exports = { app, io, socketHandler };
