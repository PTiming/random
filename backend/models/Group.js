const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: true
  },
  description: String,
  groupImage: String,
  
  // Group Type
  type: {
    type: String,
    enum: ['study', 'project', 'interest', 'course'],
    default: 'study'
  },
  
  // Course Association
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  
  // Membership
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
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
  pendingRequests: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    requestedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Content
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  resources: [{
    title: String,
    description: String,
    url: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: Date
  }],
  
  // Settings
  visibility: {
    type: String,
    enum: ['public', 'private', 'course-only'],
    default: 'public'
  },
  joinPolicy: {
    type: String,
    enum: ['open', 'request', 'invite-only'],
    default: 'request'
  },
  
  // Tags and Categories
  tags: [String],
  category: String,
  
  // Metadata
  isActive: {
    type: Boolean,
    default: true
  },
  memberCount: {
    type: Number,
    default: 0
  },
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

// Update member count before saving
groupSchema.pre('save', function(next) {
  this.memberCount = this.members.length;
  next();
});

// Indexes
groupSchema.index({ course: 1 });
groupSchema.index({ creator: 1 });
groupSchema.index({ 'members.user': 1 });

module.exports = mongoose.model('Group', groupSchema);
