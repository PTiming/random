const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  // Author
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Content
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  
  // Media attachments
  media: [{
    type: {
      type: String,
      enum: ['image', 'video', 'file', 'link']
    },
    url: String,
    thumbnail: String,
    filename: String,
    mimeType: String,
    size: Number
  }],

  // Post type
  postType: {
    type: String,
    enum: ['regular', 'announcement', 'resource', 'question', 'poll'],
    default: 'regular'
  },

  // Visibility
  visibility: {
    type: String,
    enum: ['public', 'connections', 'group', 'course', 'private'],
    default: 'public'
  },

  // Associated group/course
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  },
  course: {
    moodleCourseId: Number,
    courseName: String
  },

  // Tags and mentions
  tags: [{
    type: String,
    trim: true
  }],
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  // Reactions
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: ['like', 'love', 'insightful', 'celebrate', 'support'],
      default: 'like'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Comments
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 2000
    },
    mentions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    reactions: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      type: {
        type: String,
        enum: ['like', 'love', 'insightful'],
        default: 'like'
      }
    }],
    replies: [{
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      content: {
        type: String,
        required: true,
        maxlength: 1000
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: Date,
    isEdited: {
      type: Boolean,
      default: false
    }
  }],

  // Shares
  shares: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sharedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Original post if this is a share
  originalPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },

  // Poll data (if postType is 'poll')
  poll: {
    question: String,
    options: [{
      text: String,
      votes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }]
    }],
    endsAt: Date,
    allowMultiple: {
      type: Boolean,
      default: false
    }
  },

  // Moodle sync
  moodleSync: {
    synced: { type: Boolean, default: false },
    forumId: Number,
    discussionId: Number,
    postId: Number,
    lastSyncAt: Date
  },

  // Engagement metrics
  metrics: {
    views: { type: Number, default: 0 },
    uniqueViews: { type: Number, default: 0 },
    engagementScore: { type: Number, default: 0 }
  },

  // Status
  isEdited: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ group: 1, createdAt: -1 });
postSchema.index({ 'course.moodleCourseId': 1 });
postSchema.index({ visibility: 1, createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ content: 'text' });

// Virtual for reactions count
postSchema.virtual('reactionsCount').get(function() {
  return this.reactions?.length || 0;
});

// Virtual for comments count
postSchema.virtual('commentsCount').get(function() {
  return this.comments?.length || 0;
});

// Virtual for shares count
postSchema.virtual('sharesCount').get(function() {
  return this.shares?.length || 0;
});

// Method to check if user has reacted
postSchema.methods.hasUserReacted = function(userId) {
  return this.reactions.some(r => r.user.toString() === userId.toString());
};

// Method to get user's reaction
postSchema.methods.getUserReaction = function(userId) {
  return this.reactions.find(r => r.user.toString() === userId.toString());
};

// Method to add reaction
postSchema.methods.addReaction = function(userId, type = 'like') {
  const existingIndex = this.reactions.findIndex(
    r => r.user.toString() === userId.toString()
  );
  
  if (existingIndex > -1) {
    this.reactions[existingIndex].type = type;
  } else {
    this.reactions.push({ user: userId, type });
  }
  
  return this;
};

// Method to remove reaction
postSchema.methods.removeReaction = function(userId) {
  this.reactions = this.reactions.filter(
    r => r.user.toString() !== userId.toString()
  );
  return this;
};

module.exports = mongoose.model('Post', postSchema);
