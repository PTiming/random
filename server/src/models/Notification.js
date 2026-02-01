const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Recipient
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Notification type
  type: {
    type: String,
    required: true,
    enum: [
      // Social interactions
      'new_comment', 'new_reaction', 'new_mention', 'new_reply',
      'post_shared', 'new_follower', 'connection_request', 'connection_accepted',
      // Messaging
      'new_message', 'new_group_message', 'message_reaction',
      // Groups
      'group_invitation', 'group_post', 'group_membership', 'group_announcement',
      // Moodle
      'moodle_assignment', 'moodle_deadline', 'moodle_grade', 'moodle_announcement',
      'moodle_resource', 'moodle_enrollment', 'moodle_quiz', 'moodle_feedback',
      // System
      'system_announcement', 'system_alert'
    ]
  },

  // Source
  source: {
    type: String,
    enum: ['platform', 'moodle'],
    default: 'platform'
  },

  // Priority
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },

  // Content
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },

  // Contextual data
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  // Related entity
  relatedEntity: {
    entityType: {
      type: String,
      enum: ['post', 'comment', 'message', 'user', 'group', 'course', 
             'assignment', 'grade', 'quiz', 'resource', 'announcement']
    },
    entityId: mongoose.Schema.Types.Mixed // ObjectId or Moodle ID
  },

  // Actor (who triggered the notification)
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Channel delivery status
  channels: {
    inApp: {
      sent: { type: Boolean, default: false },
      sentAt: Date,
      read: { type: Boolean, default: false },
      readAt: Date
    },
    push: {
      sent: { type: Boolean, default: false },
      sentAt: Date,
      clicked: { type: Boolean, default: false },
      clickedAt: Date
    },
    email: {
      sent: { type: Boolean, default: false },
      sentAt: Date,
      opened: { type: Boolean, default: false },
      openedAt: Date
    },
    sms: {
      sent: { type: Boolean, default: false },
      sentAt: Date
    }
  },

  // Grouping (for notification batching)
  groupKey: String,
  groupCount: {
    type: Number,
    default: 1
  },

  // Status
  archived: {
    type: Boolean,
    default: false
  },
  expiresAt: Date,

  // Action URL
  actionUrl: String
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, 'channels.inApp.read': 1 });
notificationSchema.index({ recipient: 1, type: 1 });
notificationSchema.index({ recipient: 1, source: 1 });
notificationSchema.index({ groupKey: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for is read
notificationSchema.virtual('isRead').get(function() {
  return this.channels.inApp.read;
});

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.channels.inApp.read = true;
  this.channels.inApp.readAt = new Date();
  return this.save();
};

// Method to mark push as clicked
notificationSchema.methods.markPushClicked = function() {
  this.channels.push.clicked = true;
  this.channels.push.clickedAt = new Date();
  return this.save();
};

// Method to mark email as opened
notificationSchema.methods.markEmailOpened = function() {
  this.channels.email.opened = true;
  this.channels.email.openedAt = new Date();
  return this.save();
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    recipient: userId,
    'channels.inApp.read': false,
    archived: false
  });
};

// Static method to mark all as read
notificationSchema.statics.markAllAsRead = function(userId) {
  return this.updateMany(
    { recipient: userId, 'channels.inApp.read': false },
    { 
      $set: { 
        'channels.inApp.read': true, 
        'channels.inApp.readAt': new Date() 
      } 
    }
  );
};

// Static method to get grouped notifications
notificationSchema.statics.getGroupedNotifications = async function(userId, options = {}) {
  const { page = 1, limit = 20, filter = {} } = options;
  
  const query = { recipient: userId, archived: false, ...filter };
  
  const notifications = await this.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('actor', 'username firstName lastName avatar')
    .lean();
  
  const total = await this.countDocuments(query);
  
  return {
    notifications,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

module.exports = mongoose.model('Notification', notificationSchema);
