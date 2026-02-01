const Notification = require('../../models/Notification');
const User = require('../../models/User');
const config = require('../../config');
const { emitToUser, getIO } = require('./socketService');
const EmailService = require('./emailService');
const PushService = require('./pushService');

/**
 * Notification Service
 * Handles creating and delivering notifications across all channels
 */
class NotificationService {
  /**
   * Create and deliver a notification
   */
  static async createNotification(options) {
    const {
      recipient,
      type,
      source = 'platform',
      priority = 'normal',
      title,
      message,
      data = {},
      actor = null,
      relatedEntity = null,
      actionUrl = null,
      groupKey = null
    } = options;

    try {
      // Get recipient's preferences
      const user = await User.findById(recipient);
      if (!user) {
        console.error('Notification recipient not found:', recipient);
        return null;
      }

      // Check if notification type is enabled
      if (!this.isNotificationEnabled(user, type, source)) {
        return null;
      }

      // Check quiet hours
      if (this.isInQuietHours(user) && priority !== 'urgent') {
        // Store for later delivery or skip non-urgent notifications
        // For now, we'll still create the notification but skip push
      }

      // Check Do Not Disturb
      if (user.notificationPreferences?.doNotDisturb && priority !== 'urgent') {
        // Only create in-app notification
      }

      // Handle notification grouping
      if (groupKey) {
        const existingGrouped = await Notification.findOne({
          recipient,
          groupKey,
          'channels.inApp.read': false,
          createdAt: { $gt: new Date(Date.now() - 60 * 60 * 1000) } // Last hour
        });

        if (existingGrouped) {
          existingGrouped.groupCount += 1;
          existingGrouped.message = this.getGroupedMessage(type, existingGrouped.groupCount);
          await existingGrouped.save();
          
          // Emit update
          emitToUser(recipient.toString(), 'notification_updated', existingGrouped);
          return existingGrouped;
        }
      }

      // Create notification
      const notification = new Notification({
        recipient,
        type,
        source,
        priority,
        title,
        message,
        data,
        actor,
        relatedEntity,
        actionUrl,
        groupKey,
        channels: {
          inApp: { sent: true, sentAt: new Date() },
          push: { sent: false },
          email: { sent: false },
          sms: { sent: false }
        }
      });

      await notification.save();

      // Deliver through enabled channels
      await this.deliverNotification(notification, user);

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Deliver notification through all enabled channels
   */
  static async deliverNotification(notification, user) {
    const prefs = user.notificationPreferences;
    const isQuietHours = this.isInQuietHours(user);
    const isUrgent = notification.priority === 'urgent';

    // 1. In-App (Socket.io) - Always deliver
    try {
      await notification.populate('actor', 'username firstName lastName avatar');
      emitToUser(user._id.toString(), 'notification', notification);
    } catch (error) {
      console.error('Socket delivery error:', error);
    }

    // 2. Push Notification
    if (prefs?.channels?.push && user.pushTokens?.length > 0) {
      if (!isQuietHours || isUrgent) {
        try {
          await PushService.sendPushNotification(user, notification);
          notification.channels.push.sent = true;
          notification.channels.push.sentAt = new Date();
        } catch (error) {
          console.error('Push notification error:', error);
        }
      }
    }

    // 3. Email Notification
    if (prefs?.channels?.email) {
      const shouldSendEmail = this.shouldSendEmail(user, notification);
      if (shouldSendEmail && (!isQuietHours || isUrgent)) {
        try {
          await EmailService.sendNotificationEmail(user, notification);
          notification.channels.email.sent = true;
          notification.channels.email.sentAt = new Date();
        } catch (error) {
          console.error('Email notification error:', error);
        }
      }
    }

    // 4. SMS Notification (only for urgent/high priority)
    if (prefs?.channels?.sms && ['urgent', 'high'].includes(notification.priority)) {
      if (!isQuietHours || isUrgent) {
        // SMS implementation would go here
        // notification.channels.sms.sent = true;
        // notification.channels.sms.sentAt = new Date();
      }
    }

    await notification.save();
  }

  /**
   * Check if notification type is enabled for user
   */
  static isNotificationEnabled(user, type, source) {
    const prefs = user.notificationPreferences;
    if (!prefs) return true;

    // Check by source
    if (source === 'moodle') {
      const moodlePrefs = prefs.moodleSync;
      if (!moodlePrefs) return true;

      if (type.includes('assignment') && !moodlePrefs.assignments) return false;
      if (type.includes('grade') && !moodlePrefs.grades) return false;
      if (type.includes('announcement') && !moodlePrefs.announcements) return false;
      if (type.includes('deadline') && !moodlePrefs.deadlines) return false;
      if (type.includes('resource') && !moodlePrefs.resources) return false;
    }

    // Check by type category
    const typePrefs = prefs.types;
    if (!typePrefs) return true;

    if (this.isSocialNotification(type) && !typePrefs.social) return false;
    if (this.isMessageNotification(type) && !typePrefs.messages) return false;
    if (this.isAcademicNotification(type) && !typePrefs.academic) return false;
    if (this.isSystemNotification(type) && !typePrefs.system) return false;

    return true;
  }

  /**
   * Check if currently in quiet hours
   */
  static isInQuietHours(user) {
    const quietHours = user.notificationPreferences?.quietHours;
    if (!quietHours?.enabled) return false;

    const now = new Date();
    const timezone = quietHours.timezone || 'UTC';
    
    // Simple time comparison (would need proper timezone handling in production)
    const currentTime = now.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: timezone 
    });

    const start = quietHours.start;
    const end = quietHours.end;

    // Handle overnight quiet hours (e.g., 22:00 to 08:00)
    if (start > end) {
      return currentTime >= start || currentTime < end;
    }
    
    return currentTime >= start && currentTime < end;
  }

  /**
   * Determine if email should be sent based on frequency preference
   */
  static shouldSendEmail(user, notification) {
    const frequency = user.notificationPreferences?.emailFrequency || 'instant';
    
    if (frequency === 'instant') return true;
    if (notification.priority === 'urgent') return true;
    
    // For digest modes, emails are sent via scheduled job
    return false;
  }

  /**
   * Get grouped message text
   */
  static getGroupedMessage(type, count) {
    const messages = {
      'new_reaction': `${count} people reacted to your post`,
      'new_comment': `${count} new comments on your post`,
      'new_follower': `${count} new followers`,
      'new_message': `${count} new messages`,
      'post_shared': `${count} people shared your post`
    };
    
    return messages[type] || `${count} new notifications`;
  }

  /**
   * Notification type categorization helpers
   */
  static isSocialNotification(type) {
    return ['new_comment', 'new_reaction', 'new_mention', 'new_reply', 
            'post_shared', 'new_follower', 'connection_request', 
            'connection_accepted'].includes(type);
  }

  static isMessageNotification(type) {
    return ['new_message', 'new_group_message', 'message_reaction'].includes(type);
  }

  static isAcademicNotification(type) {
    return type.startsWith('moodle_') || 
           ['group_post', 'group_announcement'].includes(type);
  }

  static isSystemNotification(type) {
    return ['system_announcement', 'system_alert'].includes(type);
  }

  /**
   * Send broadcast notification to multiple users
   */
  static async broadcastNotification(options) {
    const { recipients, ...notificationOptions } = options;
    
    const notifications = [];
    for (const recipientId of recipients) {
      try {
        const notification = await this.createNotification({
          ...notificationOptions,
          recipient: recipientId
        });
        if (notification) {
          notifications.push(notification);
        }
      } catch (error) {
        console.error(`Broadcast notification failed for ${recipientId}:`, error);
      }
    }
    
    return notifications;
  }

  /**
   * Send email digest
   */
  static async sendEmailDigest(userId, frequency) {
    try {
      const user = await User.findById(userId);
      if (!user || user.notificationPreferences?.emailFrequency !== frequency) {
        return;
      }

      // Get unread notifications since last digest
      const since = this.getDigestSince(frequency);
      const notifications = await Notification.find({
        recipient: userId,
        'channels.inApp.read': false,
        'channels.email.sent': false,
        createdAt: { $gt: since }
      }).sort({ createdAt: -1 }).limit(50);

      if (notifications.length === 0) return;

      // Send digest email
      await EmailService.sendDigestEmail(user, notifications, frequency);

      // Mark as email sent
      await Notification.updateMany(
        { _id: { $in: notifications.map(n => n._id) } },
        { 
          $set: { 
            'channels.email.sent': true,
            'channels.email.sentAt': new Date()
          }
        }
      );
    } catch (error) {
      console.error('Send email digest error:', error);
    }
  }

  /**
   * Get the start time for digest period
   */
  static getDigestSince(frequency) {
    const now = new Date();
    switch (frequency) {
      case 'hourly':
        return new Date(now - 60 * 60 * 1000);
      case 'daily':
        return new Date(now - 24 * 60 * 60 * 1000);
      case 'weekly':
        return new Date(now - 7 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now - 24 * 60 * 60 * 1000);
    }
  }
}

module.exports = NotificationService;
