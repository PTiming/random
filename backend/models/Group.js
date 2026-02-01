const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  // Basic Info
  name: {
    type: String,
    required: true
  },
  description: String,
  avatar: String,
  
  // Type & Purpose
  type: {
    type: String,
    enum: ['study', 'project', 'interest', 'course'],
    default: 'study'
  },
  privacy: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  
  // Course Association
  linkedCourse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  
  // Members
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['admin', 'moderator', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Resources
  resources: [{
    name: String,
    type: String,
    url: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: Date
  }],
  
  // Settings
  allowMemberPosts: {
    type: Boolean,
    default: true
  },
  requireApproval: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Group', groupSchema);
