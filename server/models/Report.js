const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportType: {
    type: String,
    enum: ['post', 'comment', 'user', 'message', 'resource'],
    required: true
  },
  reportedPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  reportedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reportedResource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource'
  },
  reason: {
    type: String,
    enum: ['spam', 'harassment', 'inappropriate', 'misinformation', 'copyright', 'other'],
    required: true
  },
  description: {
    type: String,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'resolved', 'dismissed'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  resolution: {
    type: String,
    maxlength: 500
  },
  actionTaken: {
    type: String,
    enum: ['none', 'warning', 'content_removed', 'user_suspended', 'user_banned']
  }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
