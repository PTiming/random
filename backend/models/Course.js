const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  // Moodle Integration
  moodleId: {
    type: String,
    unique: true,
    sparse: true
  },
  moodleShortName: String,
  lastMoodleSync: Date,
  
  // Course Information
  name: {
    type: String,
    required: true
  },
  code: String,
  description: String,
  category: String,
  department: String,
  
  // Course Details
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  additionalInstructors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  enrolledStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Course Schedule
  startDate: Date,
  endDate: Date,
  schedule: String,
  
  // Social Features
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  groups: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  }],
  resources: [{
    title: String,
    description: String,
    url: String,
    moodleResourceId: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: Date
  }],
  
  // Assignments synced from Moodle
  assignments: [{
    moodleAssignmentId: String,
    title: String,
    description: String,
    dueDate: Date,
    allowSubmission: Boolean,
    submissions: [{
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      submittedAt: Date,
      fileUrl: String,
      syncedToMoodle: Boolean,
      grade: Number,
      feedback: String
    }]
  }],
  
  // Calendar Events
  events: [{
    title: String,
    description: String,
    startTime: Date,
    endTime: Date,
    moodleEventId: String,
    syncedToMoodle: Boolean
  }],
  
  // Settings
  isActive: {
    type: Boolean,
    default: true
  },
  visibility: {
    type: String,
    enum: ['public', 'enrolled', 'private'],
    default: 'enrolled'
  },
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
courseSchema.index({ moodleId: 1 });
courseSchema.index({ instructor: 1 });
courseSchema.index({ 'enrolledStudents': 1 });

module.exports = mongoose.model('Course', courseSchema);
