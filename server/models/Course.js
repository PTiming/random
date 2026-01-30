const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [300, 'Short description cannot exceed 300 characters']
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['programming', 'design', 'business', 'science', 'language', 'other']
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  thumbnail: {
    type: String,
    default: null
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  enrollmentLimit: {
    type: Number,
    default: null // null means unlimited
  },
  enrolledStudents: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    }
  }],
  modules: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    order: Number,
    content: [{
      type: {
        type: String,
        enum: ['video', 'document', 'quiz', 'assignment'],
        required: true
      },
      title: String,
      url: String,
      duration: Number, // in minutes
      order: Number
    }]
  }],
  assignments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment'
  }],
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  tags: [String],
  // For two-way sync tracking
  syncStatus: {
    lastSynced: Date,
    syncVersion: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for enrolled count
courseSchema.virtual('enrolledCount').get(function() {
  return this.enrolledStudents ? this.enrolledStudents.length : 0;
});

// Update sync version on modifications
courseSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.syncStatus.syncVersion += 1;
    this.syncStatus.lastSynced = new Date();
  }
  next();
});

// Index for efficient queries
courseSchema.index({ teacher: 1, isPublished: 1 });
courseSchema.index({ category: 1, level: 1 });
courseSchema.index({ 'enrolledStudents.student': 1 });

module.exports = mongoose.model('Course', courseSchema);
