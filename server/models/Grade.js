const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student is required']
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
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment'
  },
  score: {
    type: Number,
    required: [true, 'Score is required'],
    min: [0, 'Score cannot be negative']
  },
  maxScore: {
    type: Number,
    required: [true, 'Maximum score is required'],
    min: [0, 'Maximum score cannot be negative']
  },
  percentage: {
    type: Number,
    min: 0,
    max: 100
  },
  feedback: {
    type: String,
    maxlength: [1000, 'Feedback cannot exceed 1000 characters']
  },
  gradeType: {
    type: String,
    enum: ['assignment', 'quiz', 'exam', 'participation', 'final'],
    required: true
  },
  gradedAt: {
    type: Date,
    default: Date.now
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

// Calculate percentage before saving
gradeSchema.pre('save', function(next) {
  if (this.score !== undefined && this.maxScore !== undefined && this.maxScore > 0) {
    this.percentage = (this.score / this.maxScore) * 100;
  }
  next();
});

// Update sync version on modifications
gradeSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.syncStatus.syncVersion += 1;
    this.syncStatus.lastSynced = new Date();
  }
  next();
});

// Index for efficient queries
gradeSchema.index({ student: 1, course: 1 });
gradeSchema.index({ teacher: 1, course: 1 });

module.exports = mongoose.model('Grade', gradeSchema);
