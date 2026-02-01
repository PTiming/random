const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  // Sender
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Recipient (for direct messages)
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Conversation reference
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },

  // Message content
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },

  // Message type
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text'
  },

  // Attachments
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'video', 'file', 'audio']
    },
    url: String,
    filename: String,
    mimeType: String,
    size: Number,
    thumbnail: String
  }],

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

  // Read status
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

  // Reply to
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },

  // Status
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date
}, {
  timestamps: true
});

// Indexes
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ recipient: 1 });

// Conversation Schema
const conversationSchema = new mongoose.Schema({
  // Conversation type
  type: {
    type: String,
    enum: ['direct', 'group'],
    required: true
  },

  // Participants
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['member', 'admin'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    lastRead: Date,
    muted: {
      type: Boolean,
      default: false
    },
    mutedUntil: Date
  }],

  // Group conversation details
  name: {
    type: String,
    maxlength: 100
  },
  avatar: String,
  description: {
    type: String,
    maxlength: 500
  },

  // Last message (for preview)
  lastMessage: {
    content: String,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: Date,
    type: String
  },

  // Settings
  settings: {
    allowFiles: { type: Boolean, default: true },
    allowImages: { type: Boolean, default: true },
    onlyAdminsCanPost: { type: Boolean, default: false }
  },

  // Status
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
conversationSchema.index({ 'participants.user': 1 });
conversationSchema.index({ 'lastMessage.timestamp': -1 });

// Method to check if user is participant
conversationSchema.methods.isParticipant = function(userId) {
  return this.participants.some(p => p.user.toString() === userId.toString());
};

// Method to check if user is admin
conversationSchema.methods.isAdmin = function(userId) {
  const participant = this.participants.find(p => p.user.toString() === userId.toString());
  return participant?.role === 'admin';
};

// Method to get unread count for user
conversationSchema.methods.getUnreadCount = async function(userId) {
  const participant = this.participants.find(p => p.user.toString() === userId.toString());
  if (!participant?.lastRead) return 0;
  
  const Message = mongoose.model('Message');
  return Message.countDocuments({
    conversation: this._id,
    createdAt: { $gt: participant.lastRead },
    sender: { $ne: userId }
  });
};

// Static method to find or create direct conversation
conversationSchema.statics.findOrCreateDirect = async function(user1Id, user2Id) {
  let conversation = await this.findOne({
    type: 'direct',
    'participants.user': { $all: [user1Id, user2Id] }
  });
  
  if (!conversation) {
    conversation = await this.create({
      type: 'direct',
      participants: [
        { user: user1Id },
        { user: user2Id }
      ]
    });
  }
  
  return conversation;
};

const Message = mongoose.model('Message', messageSchema);
const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = { Message, Conversation };
