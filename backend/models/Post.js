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
    required: true
  },
  mediaUrls: [String],
  tags: [String],
  
  // Course Association
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  
  // Moodle Integration
  moodleForumId: Number,
  moodlePostId: Number,
  syncedToMoodle: {
    type: Boolean,
    default: false
  },
  syncedAt: Date,
  
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
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
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
  
  // Visibility
  visibility: {
    type: String,
    enum: ['public', 'connections', 'course', 'private'],
    default: 'public'
  },
  
  // Metadata
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Post', postSchema);
