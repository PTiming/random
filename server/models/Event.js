const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  description: {
    type: String,
    maxlength: 2000
  },
  eventType: {
    type: String,
    enum: ['study_session', 'exam', 'deadline', 'meeting', 'workshop', 'other'],
    default: 'other'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  location: {
    type: String,
    maxlength: 200
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  meetingLink: {
    type: String
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  studyGroup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudyGroup'
  },
  attendees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['going', 'maybe', 'not_going'],
      default: 'going'
    },
    respondedAt: {
      type: Date,
      default: Date.now
    }
  }],
  maxAttendees: {
    type: Number
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  reminders: [{
    type: String,
    enum: ['1h', '1d', '1w']
  }]
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
