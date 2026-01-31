const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['like', 'comment', 'follow', 'mention', 'event_reminder', 'announcement', 'message', 'group_invite', 'assignment_due'],
    required: true
  },
  content: {
    type: String,
    maxlength: 500
  },
  relatedPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  relatedEvent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
  relatedAnnouncement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Announcement'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  }
}, { timestamps: true });

// Index for faster queries
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
