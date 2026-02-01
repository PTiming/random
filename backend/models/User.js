const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Moodle Integration Fields
  moodleId: {
    type: String,
    unique: true,
    sparse: true
  },
  moodleUsername: String,
  moodleEmail: String,
  lastMoodleSync: Date,
  
  // Basic User Information
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return !this.moodleId; // Password not required if using Moodle SSO
    }
  },
  
  // Profile Information
  firstName: String,
  lastName: String,
  profilePicture: String,
  bio: String,
  institution: String,
  department: String,
  
  // Academic Information
  role: {
    type: String,
    enum: ['student', 'instructor', 'admin', 'institution_admin'],
    default: 'student'
  },
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  achievements: [{
    title: String,
    description: String,
    dateEarned: Date,
    moodleAchievementId: String
  }],
  skills: [String],
  
  // Social Features
  connections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  groups: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  }],
  
  // Settings
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      assignments: { type: Boolean, default: true },
      messages: { type: Boolean, default: true }
    },
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'connections', 'private'],
        default: 'public'
      },
      showCourses: { type: Boolean, default: true },
      showAchievements: { type: Boolean, default: true }
    },
    syncSettings: {
      autoSyncFromMoodle: { type: Boolean, default: true },
      autoSyncToMoodle: { type: Boolean, default: false },
      syncFrequency: {
        type: String,
        enum: ['realtime', 'hourly', 'daily', 'manual'],
        default: 'hourly'
      }
    }
  },
  
  // Authentication
  tokens: [{
    token: String,
    createdAt: Date
  }],
  
  // Metadata
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ moodleId: 1 });
userSchema.index({ username: 1 });

module.exports = mongoose.model('User', userSchema);
