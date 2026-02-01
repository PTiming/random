const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 1000,
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  coverImage: {
    type: String,
    default: ''
  },

  // Group Type
  type: {
    type: String,
    enum: ['public', 'private', 'course', 'study'],
    default: 'public'
  },

  // Category
  category: {
    type: String,
    enum: ['general', 'academic', 'project', 'study-group', 'club', 'department'],
    default: 'general'
  },

  // Creator/Owner
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Members
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['member', 'moderator', 'admin', 'owner'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],

  // Membership requests (for private groups)
  membershipRequests: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    requestedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    processedAt: Date
  }],

  // Invitations
  invitations: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    invitedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending'
    }
  }],

  // Associated Course (Moodle integration)
  course: {
    moodleCourseId: Number,
    courseName: String,
    courseCode: String,
    autoSync: {
      type: Boolean,
      default: false
    }
  },

  // Tags
  tags: [{
    type: String,
    trim: true
  }],

  // Settings
  settings: {
    allowMemberPosts: { type: Boolean, default: true },
    requirePostApproval: { type: Boolean, default: false },
    allowMemberInvites: { type: Boolean, default: true },
    showMemberList: { type: Boolean, default: true },
    enableDiscussion: { type: Boolean, default: true },
    enableResources: { type: Boolean, default: true }
  },

  // Resources/Files
  resources: [{
    title: String,
    description: String,
    fileUrl: String,
    fileType: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    downloads: {
      type: Number,
      default: 0
    }
  }],

  // Announcements
  pinnedPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],

  // Metrics
  metrics: {
    totalPosts: { type: Number, default: 0 },
    totalMembers: { type: Number, default: 0 },
    weeklyActive: { type: Number, default: 0 },
    engagementScore: { type: Number, default: 0 }
  },

  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
groupSchema.index({ name: 'text', description: 'text', tags: 'text' });
groupSchema.index({ type: 1 });
groupSchema.index({ 'members.user': 1 });
groupSchema.index({ creator: 1 });
groupSchema.index({ 'course.moodleCourseId': 1 });
groupSchema.index({ tags: 1 });

// Virtual for member count
groupSchema.virtual('memberCount').get(function() {
  return this.members?.length || 0;
});

// Method to check if user is member
groupSchema.methods.isMember = function(userId) {
  return this.members.some(m => m.user.toString() === userId.toString());
};

// Method to check if user has admin privileges
groupSchema.methods.isAdminOrOwner = function(userId) {
  const member = this.members.find(m => m.user.toString() === userId.toString());
  return member && ['admin', 'owner', 'moderator'].includes(member.role);
};

// Method to get user's role
groupSchema.methods.getUserRole = function(userId) {
  const member = this.members.find(m => m.user.toString() === userId.toString());
  return member?.role || null;
};

// Method to add member
groupSchema.methods.addMember = function(userId, role = 'member', addedBy = null) {
  if (!this.isMember(userId)) {
    this.members.push({
      user: userId,
      role,
      addedBy,
      joinedAt: new Date()
    });
    this.metrics.totalMembers = this.members.length;
  }
  return this;
};

// Method to remove member
groupSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(m => m.user.toString() !== userId.toString());
  this.metrics.totalMembers = this.members.length;
  return this;
};

// Method to update member role
groupSchema.methods.updateMemberRole = function(userId, newRole) {
  const member = this.members.find(m => m.user.toString() === userId.toString());
  if (member) {
    member.role = newRole;
  }
  return this;
};

module.exports = mongoose.model('Group', groupSchema);
