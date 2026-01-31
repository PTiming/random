const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);
