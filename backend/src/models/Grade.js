const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  activityType: {
    type: String,
    enum: ['assignment', 'quiz', 'overall'],
    required: true
  },
  activityId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  moodleGradeItemId: {
    type: Number,
    default: null
  },
  moodleActivityId: {
    type: Number,
    default: null
  },
  grade: {
    type: Number,
    min: 0
  },
  maxGrade: {
    type: Number,
    default: 100
  },
  percentage: {
    type: Number,
    min: 0,
    max: 100
  },
  feedback: {
    type: String,
    default: ''
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  gradedAt: {
    type: Date
  },
  syncedWithMoodle: {
    type: Boolean,
    default: false
  },
  lastMoodleSync: {
    type: Date,
    default: null
  },
  moodleRawGrade: {
    type: Number,
    default: null
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
gradeSchema.index({ user: 1, course: 1 });
gradeSchema.index({ course: 1, activityType: 1 });

// Calculate percentage before saving
gradeSchema.pre('save', function(next) {
  if (this.grade !== undefined && this.maxGrade) {
    this.percentage = (this.grade / this.maxGrade) * 100;
  }
  next();
});

module.exports = mongoose.model('Grade', gradeSchema);
