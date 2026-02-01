const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  // Basic Info
  name: {
    type: String,
    required: true
  },
  code: String,
  description: String,
  category: String,
  
  // Moodle Integration
  moodleCourseId: {
    type: Number,
    unique: true,
    sparse: true
  },
  lastMoodleSync: Date,
  
  // Academic Info
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  instructorMoodleId: Number,
  startDate: Date,
  endDate: Date,
  semester: String,
  
  // Social Features
  enrolledStudents: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    enrolledAt: Date,
    moodleEnrollmentId: Number
  }],
  
  // Resources
  resources: [{
    name: String,
    type: String,
    url: String,
    moodleId: Number,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: Date
  }],
  
  // Settings
  visibility: {
    type: String,
    enum: ['public', 'private', 'enrolled_only'],
    default: 'enrolled_only'
  },
  allowDiscussions: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Course', courseSchema);
