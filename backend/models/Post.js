const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Post content is required'],
    maxlength: [5000, 'Post content cannot exceed 5000 characters']
  },
  images: [{
    url: String,
    publicId: String
  }],
  video: {
    url: String,
    publicId: String
  },
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  shares: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Moodle Integration - Course/Assignment related posts
  moodleCourseId: {
    type: String,
    default: null
  },
  moodleCourseName: {
    type: String,
    default: null
  },
  moodleActivityId: {
    type: String,
    default: null
  },
  moodleActivityType: {
    type: String,
    enum: ['assignment', 'quiz', 'forum', 'resource', 'general', null],
    default: null
  },
  postType: {
    type: String,
    enum: ['general', 'moodle_course', 'moodle_achievement', 'moodle_discussion'],
    default: 'general'
  },
  visibility: {
    type: String,
    enum: ['public', 'friends', 'private'],
    default: 'public'
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  tags: [{
    type: String,
    trim: true
  }],
  location: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ visibility: 1, createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ moodleCourseId: 1 });

// Virtual for likes count
postSchema.virtual('likesCount').get(function() {
  return this.likes.length;
});

// Virtual for comments count
postSchema.virtual('commentsCount').get(function() {
  return this.comments.length;
});

// Virtual for shares count
postSchema.virtual('sharesCount').get(function() {
  return this.shares.length;
});

postSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Post', postSchema);
