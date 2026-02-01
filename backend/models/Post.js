const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  // Author Information
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Content
  content: {
    type: String,
    required: true
  },
  mediaUrls: [String],
  mediaType: {
    type: String,
    enum: ['text', 'image', 'video', 'document', 'mixed']
  },
  
  // Context
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  },
  
  // Moodle Integration
  moodleForumId: String,
  moodlePostId: String,
  syncedToMoodle: {
    type: Boolean,
    default: false
  },
  lastMoodleSync: Date,
  
  // Interactions
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: ['like', 'love', 'helpful', 'insightful', 'confused']
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
      ref: 'User'
    },
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }],
  
  // Sharing
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
  
  // Tags
  tags: [String],
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Visibility
  visibility: {
    type: String,
    enum: ['public', 'connections', 'course', 'group', 'private'],
    default: 'public'
  },
  
  // Post Type
  type: {
    type: String,
    enum: ['post', 'question', 'announcement', 'resource'],
    default: 'post'
  },
  
  // Question-specific fields
  isAnswered: Boolean,
  acceptedAnswer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  },
  
  // Metadata
  isPinned: {
    type: Boolean,
    default: false
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editHistory: [{
    content: String,
    editedAt: Date
  }],
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

// Indexes
postSchema.index({ author: 1 });
postSchema.index({ course: 1 });
postSchema.index({ group: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ moodlePostId: 1 });

module.exports = mongoose.model('Post', postSchema);
