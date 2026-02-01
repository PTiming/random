const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  // Basic Info
  title: {
    type: String,
    required: true
  },
  description: String,
  
  // Course Association
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  
  // Moodle Integration
  moodleAssignmentId: {
    type: Number,
    unique: true,
    sparse: true
  },
  lastMoodleSync: Date,
  
  // Deadlines
  dueDate: Date,
  allowLateSubmission: {
    type: Boolean,
    default: false
  },
  cutoffDate: Date,
  
  // Submissions
  submissions: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    submittedAt: Date,
    files: [{
      name: String,
      url: String
    }],
    content: String,
    grade: Number,
    feedback: String,
    moodleSubmissionId: Number,
    syncedToMoodle: {
      type: Boolean,
      default: false
    }
  }],
  
  // Settings
  maxGrade: {
    type: Number,
    default: 100
  },
  allowOnlineText: {
    type: Boolean,
    default: true
  },
  allowFileSubmission: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Assignment', assignmentSchema);
