const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Socket.io Handler for Two-Way Data Synchronization
 * Enables real-time updates between server and clients
 */
class SocketHandler {
  constructor(io) {
    this.io = io;
    this.connectedUsers = new Map(); // userId -> socketId
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  /**
   * Setup Socket.io authentication middleware
   */
  setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.query.token;
        
        if (!token) {
          return next(new Error('Authentication required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user || !user.isActive) {
          return next(new Error('User not found or inactive'));
        }

        socket.user = user;
        next();
      } catch (error) {
        next(new Error('Invalid token'));
      }
    });
  }

  /**
   * Setup event handlers for real-time communication
   */
  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.user.email} (${socket.user.role})`);
      
      // Store connected user
      this.connectedUsers.set(socket.user._id.toString(), socket.id);
      
      // Join user-specific room
      socket.join(`user:${socket.user._id}`);
      
      // Join role-specific room
      socket.join(`role:${socket.user.role}`);

      // Handle course room joining
      socket.on('join:course', (courseId) => {
        socket.join(`course:${courseId}`);
        console.log(`${socket.user.email} joined course:${courseId}`);
      });

      // Handle course room leaving
      socket.on('leave:course', (courseId) => {
        socket.leave(`course:${courseId}`);
        console.log(`${socket.user.email} left course:${courseId}`);
      });

      // Handle data sync request
      socket.on('sync:request', async (data) => {
        await this.handleSyncRequest(socket, data);
      });

      // Handle data update
      socket.on('data:update', async (data) => {
        await this.handleDataUpdate(socket, data);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        this.connectedUsers.delete(socket.user._id.toString());
        console.log(`User disconnected: ${socket.user.email}`);
      });
    });
  }

  /**
   * Handle sync request from client
   */
  async handleSyncRequest(socket, { type, lastSyncVersion }) {
    try {
      let data;
      
      switch (type) {
        case 'courses':
          data = await this.getSyncData('Course', lastSyncVersion);
          break;
        case 'grades':
          data = await this.getSyncData('Grade', lastSyncVersion, {
            student: socket.user._id
          });
          break;
        case 'users':
          if (socket.user.role === 'admin') {
            data = await this.getSyncData('User', lastSyncVersion);
          }
          break;
        default:
          socket.emit('sync:error', { message: 'Unknown sync type' });
          return;
      }

      socket.emit('sync:response', { type, data });
    } catch (error) {
      socket.emit('sync:error', { message: error.message });
    }
  }

  /**
   * Get data that has been modified since last sync
   */
  async getSyncData(modelName, lastSyncVersion, additionalQuery = {}) {
    const Model = require(`../models/${modelName}`);
    const query = {
      'syncStatus.syncVersion': { $gt: lastSyncVersion || 0 },
      ...additionalQuery
    };
    return await Model.find(query);
  }

  /**
   * Handle data update and broadcast to relevant clients
   */
  async handleDataUpdate(socket, { type, action, data }) {
    console.log(`Data update from ${socket.user.email}: ${type} ${action}`);
    
    // Broadcast based on data type
    switch (type) {
      case 'course':
        this.io.to(`course:${data._id}`).emit('data:changed', { type, action, data });
        this.io.to('role:teacher').emit('data:changed', { type, action, data });
        this.io.to('role:admin').emit('data:changed', { type, action, data });
        break;
        
      case 'grade':
        // Notify the specific student
        this.io.to(`user:${data.student}`).emit('data:changed', { type, action, data });
        // Notify teachers and admins
        this.io.to('role:teacher').emit('data:changed', { type, action, data });
        this.io.to('role:admin').emit('data:changed', { type, action, data });
        break;
        
      case 'enrollment':
        this.io.to(`course:${data.courseId}`).emit('data:changed', { type, action, data });
        this.io.to(`user:${data.studentId}`).emit('data:changed', { type, action, data });
        break;
        
      case 'assignment':
        this.io.to(`course:${data.courseId}`).emit('data:changed', { type, action, data });
        break;
        
      default:
        // Broadcast to admins for unknown types
        this.io.to('role:admin').emit('data:changed', { type, action, data });
    }
  }

  /**
   * Emit event to specific user
   */
  emitToUser(userId, event, data) {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  /**
   * Emit event to all users with a specific role
   */
  emitToRole(role, event, data) {
    this.io.to(`role:${role}`).emit(event, data);
  }

  /**
   * Emit event to all users in a course
   */
  emitToCourse(courseId, event, data) {
    this.io.to(`course:${courseId}`).emit(event, data);
  }

  /**
   * Broadcast notification
   */
  broadcastNotification(notification) {
    const { recipients, ...notificationData } = notification;
    
    if (recipients === 'all') {
      this.io.emit('notification', notificationData);
    } else if (Array.isArray(recipients)) {
      recipients.forEach(userId => {
        this.emitToUser(userId, 'notification', notificationData);
      });
    } else if (typeof recipients === 'string' && recipients.startsWith('role:')) {
      const role = recipients.replace('role:', '');
      this.emitToRole(role, 'notification', notificationData);
    }
  }
}

module.exports = SocketHandler;
