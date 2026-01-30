const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Assignment title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Assignment description is required']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required']
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher is required']
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  maxScore: {
    type: Number,
    required: [true, 'Maximum score is required'],
    min: [0, 'Score cannot be negative']
  },
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  submissions: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String
    },
    attachments: [{
      filename: String,
      url: String
    }],
    submittedAt: {
      type: Date,
      default: Date.now
    },
    grade: {
      score: Number,
      feedback: String,
      gradedAt: Date,
      gradedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    },
    status: {
      type: String,
      enum: ['pending', 'submitted', 'graded', 'returned'],
      default: 'pending'
    }
  }],
  isPublished: {
    type: Boolean,
    default: false
  },
  // For two-way sync tracking
  syncStatus: {
    lastSynced: Date,
    syncVersion: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Update sync version on modifications
assignmentSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.syncStatus.syncVersion += 1;
    this.syncStatus.lastSynced = new Date();
  }
  next();
});

// Index for efficient queries
assignmentSchema.index({ course: 1, teacher: 1 });
assignmentSchema.index({ 'submissions.student': 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);
