const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  uploader: {
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
    maxlength: 1000
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'image', 'video', 'other'],
    required: true
  },
  fileSize: {
    type: Number // in bytes
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  studyGroup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudyGroup'
  },
  category: {
    type: String,
    enum: ['notes', 'slides', 'assignment', 'past_exam', 'textbook', 'video', 'other'],
    default: 'other'
  },
  tags: [{
    type: String,
    maxlength: 50
  }],
  downloads: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// Text index for search
resourceSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Resource', resourceSchema);
