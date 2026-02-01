const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  // Moodle course ID
  moodleCourseId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true
  },
  shortName: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  // Instructor/Teacher
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  instructorName: {
    type: String,
    default: ''
  },
  // Students enrolled
  enrolledUsers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    moodleEnrollmentId: String,
    role: {
      type: String,
      enum: ['student', 'teacher', 'editingteacher', 'manager'],
      default: 'student'
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    grade: {
      type: Number,
      default: null
    }
  }],
  // Course content sections (synced from Moodle)
  sections: [{
    moodleSectionId: String,
    name: String,
    summary: String,
    sequence: Number,
    visible: {
      type: Boolean,
      default: true
    },
    modules: [{
      moodleModuleId: String,
      name: String,
      modname: String, // e.g., 'forum', 'assign', 'quiz', 'resource'
      url: String,
      visible: {
        type: Boolean,
        default: true
      }
    }]
  }],
  // Course settings
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  format: {
    type: String,
    default: 'topics'
  },
  // Social features
  discussionEnabled: {
    type: Boolean,
    default: true
  },
  // Last sync with Moodle
  lastSyncedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
CourseSchema.index({ moodleCourseId: 1 });
CourseSchema.index({ 'enrolledUsers.user': 1 });

// Virtual for enrolled count
CourseSchema.virtual('enrolledCount').get(function() {
  return this.enrolledUsers.length;
});

// Enable virtuals in JSON
CourseSchema.set('toJSON', { virtuals: true });
CourseSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Course', CourseSchema);
