const mongoose = require('mongoose');

// Moodle Course Cache
const moodleCourseSchema = new mongoose.Schema({
  moodleCourseId: {
    type: Number,
    required: true,
    unique: true
  },
  shortName: String,
  fullName: String,
  summary: String,
  categoryId: Number,
  categoryName: String,
  startDate: Date,
  endDate: Date,
  visible: Boolean,
  format: String,
  imageUrl: String,

  // Enrolled users
  enrolledUsers: [{
    moodleUserId: Number,
    platformUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: String, // student, teacher, editingteacher
    enrolledAt: Date
  }],

  // Assignments
  assignments: [{
    moodleAssignmentId: Number,
    name: String,
    description: String,
    dueDate: Date,
    allowLateSubmissions: Boolean,
    maxGrade: Number,
    lastSyncAt: Date
  }],

  // Quizzes
  quizzes: [{
    moodleQuizId: Number,
    name: String,
    description: String,
    timeLimit: Number,
    gradeToPass: Number,
    openDate: Date,
    closeDate: Date,
    lastSyncAt: Date
  }],

  // Resources
  resources: [{
    moodleResourceId: Number,
    name: String,
    type: String, // file, url, page, etc.
    url: String,
    description: String,
    section: Number,
    lastSyncAt: Date
  }],

  // Sync metadata
  lastFullSync: Date,
  syncStatus: {
    type: String,
    enum: ['idle', 'syncing', 'error'],
    default: 'idle'
  },
  syncError: String
}, {
  timestamps: true
});

moodleCourseSchema.index({ moodleCourseId: 1 });
moodleCourseSchema.index({ 'enrolledUsers.platformUserId': 1 });

// Moodle Sync Log
const moodleSyncLogSchema = new mongoose.Schema({
  syncType: {
    type: String,
    enum: ['full', 'incremental', 'course', 'user', 'grades', 'assignments', 'webhook'],
    required: true
  },
  direction: {
    type: String,
    enum: ['inbound', 'outbound', 'bidirectional'],
    required: true
  },
  status: {
    type: String,
    enum: ['started', 'completed', 'failed', 'partial'],
    required: true
  },
  
  // Entity being synced
  entityType: String,
  entityId: mongoose.Schema.Types.Mixed,
  
  // Details
  recordsProcessed: Number,
  recordsCreated: Number,
  recordsUpdated: Number,
  recordsDeleted: Number,
  
  // Errors
  errors: [{
    code: String,
    message: String,
    details: mongoose.Schema.Types.Mixed
  }],
  
  // Timing
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  duration: Number // milliseconds
}, {
  timestamps: true
});

moodleSyncLogSchema.index({ syncType: 1, createdAt: -1 });
moodleSyncLogSchema.index({ status: 1 });

// User Moodle Mapping
const userMoodleMappingSchema = new mongoose.Schema({
  platformUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  moodleUserId: {
    type: Number,
    required: true
  },
  moodleUsername: String,
  moodleEmail: String,
  
  // Grades cache
  grades: [{
    moodleCourseId: Number,
    courseName: String,
    items: [{
      itemId: Number,
      itemName: String,
      itemType: String, // assignment, quiz, etc.
      grade: Number,
      maxGrade: Number,
      percentage: Number,
      feedback: String,
      gradedAt: Date,
      lastSyncAt: Date
    }],
    courseTotal: Number,
    courseTotalMax: Number,
    lastSyncAt: Date
  }],
  
  // Calendar events
  calendarEvents: [{
    moodleEventId: Number,
    title: String,
    description: String,
    eventType: String,
    courseId: Number,
    startTime: Date,
    endTime: Date,
    lastSyncAt: Date
  }],
  
  lastProfileSync: Date,
  lastGradesSync: Date,
  lastCalendarSync: Date
}, {
  timestamps: true
});

userMoodleMappingSchema.index({ platformUserId: 1 });
userMoodleMappingSchema.index({ moodleUserId: 1 });

const MoodleCourse = mongoose.model('MoodleCourse', moodleCourseSchema);
const MoodleSyncLog = mongoose.model('MoodleSyncLog', moodleSyncLogSchema);
const UserMoodleMapping = mongoose.model('UserMoodleMapping', userMoodleMappingSchema);

module.exports = { MoodleCourse, MoodleSyncLog, UserMoodleMapping };
