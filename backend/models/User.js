const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Info
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
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function() {
      return !this.moodleUserId; // Required if not Moodle SSO
    }
  },
  
  // Moodle Integration
  moodleUserId: {
    type: Number,
    sparse: true,
    unique: true
  },
  moodleToken: String,
  lastMoodleSync: Date,
  
  // Profile
  firstName: String,
  lastName: String,
  avatar: String,
  bio: String,
  institution: String,
  department: String,
  
  // Academic Info
  role: {
    type: String,
    enum: ['student', 'instructor', 'admin', 'institution_admin'],
    default: 'student'
  },
  enrolledCourses: [{
    courseId: mongoose.Schema.Types.ObjectId,
    moodleCourseId: Number,
    enrolledAt: Date
  }],
  skills: [String],
  achievements: [{
    title: String,
    description: String,
    earnedAt: Date,
    moodleId: Number
  }],
  
  // Social
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
  
  // Settings
  syncSettings: {
    enabled: { type: Boolean, default: true },
    direction: { 
      type: String, 
      enum: ['moodle_only', 'platform_only', 'bidirectional'],
      default: 'bidirectional'
    },
    contentTypes: {
      courses: { type: Boolean, default: true },
      assignments: { type: Boolean, default: true },
      grades: { type: Boolean, default: true },
      calendar: { type: Boolean, default: true },
      resources: { type: Boolean, default: true }
    }
  },
  
  // Metadata
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    next();
  } else {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

// Compare password method
userSchema.methods.matchPassword = async function(enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
