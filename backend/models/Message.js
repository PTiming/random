const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  // Conversation
  conversationId: {
    type: String,
    required: true,
    index: true
  },
  
  // Sender & Recipients
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Content
  content: {
    type: String,
    required: true
  },
  attachments: [{
    name: String,
    url: String,
    type: String
  }],
  
  // Status
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: Date
  }],
  
  // Type
  messageType: {
    type: String,
    enum: ['direct', 'group'],
    default: 'direct'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Message', messageSchema);
