const mongoose = require('mongoose');

const studyGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Group name is required'],
    trim: true,
    maxlength: [100, 'Group name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  course: {
    type: String,
    default: ''
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['admin', 'moderator', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  isPrivate: {
    type: Boolean,
    default: false
  },
  maxMembers: {
    type: Number,
    default: 50
  },
  avatar: {
    type: String,
    default: ''
  },
  nextMeeting: {
    title: String,
    date: Date,
    location: String,
    online: Boolean,
    link: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

studyGroupSchema.index({ name: 'text', description: 'text', tags: 'text' });
studyGroupSchema.index({ course: 1 });

module.exports = mongoose.model('StudyGroup', studyGroupSchema);
