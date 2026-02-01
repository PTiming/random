const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Post content is required'],
    maxlength: [5000, 'Post cannot be more than 5000 characters']
  },
  images: [{
    type: String
  }],
  // Optional: Link post to a course (for course-related discussions)
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    default: null
  },
  // Post type for different contexts
  postType: {
    type: String,
    enum: ['general', 'course', 'announcement', 'question'],
    default: 'general'
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
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: {
      type: String,
      required: true,
      maxlength: [1000, 'Comment cannot be more than 1000 characters']
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
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
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  visibility: {
    type: String,
    enum: ['public', 'followers', 'course', 'private'],
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
  isPinned: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
PostSchema.index({ user: 1, createdAt: -1 });
PostSchema.index({ course: 1, createdAt: -1 });
PostSchema.index({ tags: 1 });

// Virtual for like count
PostSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
PostSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Enable virtuals in JSON
PostSchema.set('toJSON', { virtuals: true });
PostSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Post', PostSchema);
