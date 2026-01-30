const mongoose = require('mongoose');

const MoodleDataSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: String,
    required: true
  },
  courseName: {
    type: String,
    required: true
  },
  enrollmentData: {
    type: Object
  },
  grades: [{
    activityName: String,
    grade: Number,
    maxGrade: Number,
    date: Date
  }],
  assignments: [{
    id: String,
    name: String,
    dueDate: Date,
    status: String
  }],
  lastSync: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MoodleData', MoodleDataSchema);
