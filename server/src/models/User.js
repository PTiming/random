const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Information
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
    },
    minlength: 6
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },

  // Profile Information
  avatar: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  skills: [{
    type: String,
    trim: true
  }],
  interests: [{
    type: String,
    trim: true
  }],

  // Academic Information
  institution: {
    type: String,
    default: ''
  },
  department: {
    type: String,
    default: ''
  },
  academicYear: {
    type: String,
    default: ''
  },

  // Role and Permissions
  role: {
    type: String,
    enum: ['student', 'instructor', 'admin', 'institution_admin'],
    default: 'student'
  },

  // Moodle Integration
  moodleId: {
    type: Number,
    sparse: true,
    unique: true
  },
  moodleToken: {
    type: String,
    select: false
  },
  moodleTokenExpiry: {
    type: Date
  },
  lastMoodleSync: {
    type: Date
  },

  // Social Connections
  connections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  connectionRequests: {
    sent: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      sentAt: { type: Date, default: Date.now }
    }],
    received: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      sentAt: { type: Date, default: Date.now }
    }]
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  // Notification Preferences
  notificationPreferences: {
    // Channel preferences
    channels: {
      inApp: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    // Type preferences
    types: {
      social: { type: Boolean, default: true },
      messages: { type: Boolean, default: true },
      academic: { type: Boolean, default: true },
      system: { type: Boolean, default: true }
    },
    // Moodle sync preferences
    moodleSync: {
      assignments: { type: Boolean, default: true },
      grades: { type: Boolean, default: true },
      announcements: { type: Boolean, default: true },
      deadlines: { type: Boolean, default: true },
      resources: { type: Boolean, default: true }
    },
    // Frequency preferences
    emailFrequency: {
      type: String,
      enum: ['instant', 'hourly', 'daily', 'weekly'],
      default: 'instant'
    },
    // Quiet hours
    quietHours: {
      enabled: { type: Boolean, default: false },
      start: { type: String, default: '22:00' },
      end: { type: String, default: '08:00' },
      timezone: { type: String, default: 'UTC' }
    },
    // Do not disturb
    doNotDisturb: { type: Boolean, default: false }
  },

  // Push notification tokens
  pushTokens: [{
    token: String,
    device: String,
    platform: { type: String, enum: ['web', 'ios', 'android'] },
    addedAt: { type: Date, default: Date.now }
  }],

  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpiry: Date,

  // Activity Tracking
  lastActive: {
    type: Date,
    default: Date.now
  },
  loginHistory: [{
    timestamp: Date,
    ip: String,
    userAgent: String
  }]
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ moodleId: 1 });
userSchema.index({ 'connections': 1 });
userSchema.index({ firstName: 'text', lastName: 'text', username: 'text', bio: 'text' });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save hook for password hashing
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile
userSchema.methods.toPublicProfile = function() {
  return {
    _id: this._id,
    username: this.username,
    firstName: this.firstName,
    lastName: this.lastName,
    fullName: this.fullName,
    avatar: this.avatar,
    bio: this.bio,
    role: this.role,
    institution: this.institution,
    skills: this.skills,
    interests: this.interests,
    connectionsCount: this.connections?.length || 0,
    followersCount: this.followers?.length || 0,
    followingCount: this.following?.length || 0
  };
};

// Method to check if connected with another user
userSchema.methods.isConnectedWith = function(userId) {
  return this.connections.some(id => id.toString() === userId.toString());
};

module.exports = mongoose.model('User', userSchema);
