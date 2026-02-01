const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  // Conversation Type
  conversationType: {
    type: String,
    enum: ['direct', 'group'],
    required: true
  },
  
  // Participants
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  groupRecipients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Content
  content: {
    type: String,
    required: true
  },
  messageType: {
    type: String,
    enum: ['text', 'file', 'image', 'video'],
    default: 'text'
  },
  fileUrl: String,
  fileName: String,
  
  // Status
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Reply Reference
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  
  // Reactions
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Metadata
  isEdited: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
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
messageSchema.index({ sender: 1, recipient: 1 });
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
