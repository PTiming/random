const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true
  },
  shortName: {
    type: String,
    required: [true, 'Short name is required'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: 'General'
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  moodleId: {
    type: Number,
    default: null
  },
  moodleCategoryId: {
    type: Number,
    default: 1 // Default category in Moodle
  },
  syncedWithMoodle: {
    type: Boolean,
    default: false
  },
  lastMoodleSync: {
    type: Date,
    default: null
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    default: null
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  maxStudents: {
    type: Number,
    default: 0 // 0 means unlimited
  },
  enrollmentCount: {
    type: Number,
    default: 0
  },
  modules: [{
    title: String,
    description: String,
    order: Number,
    moodleSectionId: Number,
    activities: [{
      type: {
        type: String,
        enum: ['lesson', 'quiz', 'assignment', 'resource', 'forum']
      },
      title: String,
      description: String,
      moodleActivityId: Number,
      moodleActivityType: String,
      order: Number
    }]
  }],
  settings: {
    selfEnrollment: {
      type: Boolean,
      default: true
    },
    showGrades: {
      type: Boolean,
      default: true
    },
    completionTracking: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
courseSchema.index({ title: 'text', description: 'text' });
courseSchema.index({ moodleId: 1 });
courseSchema.index({ instructor: 1 });

module.exports = mongoose.model('Course', courseSchema);
