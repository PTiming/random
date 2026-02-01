const admin = require('firebase-admin');
const config = require('../../config');

/**
 * Push Notification Service using Firebase Cloud Messaging
 */
class PushService {
  static firebaseInitialized = false;

  /**
   * Initialize Firebase Admin SDK
   */
  static initializeFirebase() {
    if (this.firebaseInitialized) return;

    if (config.firebase.projectId && config.firebase.privateKey && config.firebase.clientEmail) {
      try {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: config.firebase.projectId,
            privateKey: config.firebase.privateKey,
            clientEmail: config.firebase.clientEmail
          })
        });
        this.firebaseInitialized = true;
        console.log('Firebase Admin SDK initialized');
      } catch (error) {
        console.error('Firebase initialization error:', error);
      }
    } else {
      console.warn('Firebase credentials not configured - push notifications disabled');
    }
  }

  /**
   * Send push notification to a user
   */
  static async sendPushNotification(user, notification) {
    this.initializeFirebase();

    if (!this.firebaseInitialized) {
      return { success: false, error: 'Firebase not initialized' };
    }

    if (!user.pushTokens || user.pushTokens.length === 0) {
      return { success: false, error: 'No push tokens registered' };
    }

    const tokens = user.pushTokens.map(t => t.token);
    const payload = this.buildPayload(notification);

    try {
      const response = await admin.messaging().sendEachForMulticast({
        tokens,
        notification: payload.notification,
        data: payload.data,
        webpush: payload.webpush,
        android: payload.android,
        apns: payload.apns
      });

      // Handle failed tokens
      if (response.failureCount > 0) {
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx]);
            console.error('Push notification failed:', resp.error);
          }
        });

        // Remove invalid tokens
        if (failedTokens.length > 0) {
          await this.removeInvalidTokens(user._id, failedTokens);
        }
      }

      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount
      };
    } catch (error) {
      console.error('Push notification error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Build notification payload
   */
  static buildPayload(notification) {
    const iconMap = {
      'new_comment': 'comment',
      'new_reaction': 'heart',
      'new_mention': 'at-sign',
      'new_message': 'message-circle',
      'connection_request': 'user-plus',
      'moodle_assignment': 'file-text',
      'moodle_deadline': 'clock',
      'moodle_grade': 'bar-chart-2',
      'moodle_announcement': 'megaphone',
      'group_invitation': 'users'
    };

    const icon = iconMap[notification.type] || 'bell';
    const priorityMap = {
      low: 'normal',
      normal: 'normal',
      high: 'high',
      urgent: 'high'
    };

    return {
      notification: {
        title: notification.title,
        body: notification.message
      },
      data: {
        notificationId: notification._id.toString(),
        type: notification.type,
        source: notification.source,
        actionUrl: notification.actionUrl || '',
        priority: notification.priority,
        timestamp: notification.createdAt.toISOString(),
        ...this.stringifyData(notification.data)
      },
      webpush: {
        notification: {
          icon: `/icons/${icon}.png`,
          badge: '/icons/badge.png',
          vibrate: notification.priority === 'urgent' ? [200, 100, 200] : [100],
          requireInteraction: notification.priority === 'urgent',
          actions: this.getNotificationActions(notification)
        },
        fcmOptions: {
          link: notification.actionUrl || '/notifications'
        }
      },
      android: {
        priority: priorityMap[notification.priority],
        notification: {
          icon: 'notification_icon',
          color: '#667eea',
          channelId: this.getAndroidChannel(notification),
          sound: notification.priority === 'urgent' ? 'urgent' : 'default'
        }
      },
      apns: {
        headers: {
          'apns-priority': notification.priority === 'urgent' ? '10' : '5'
        },
        payload: {
          aps: {
            alert: {
              title: notification.title,
              body: notification.message
            },
            badge: 1,
            sound: notification.priority === 'urgent' ? 'urgent.caf' : 'default',
            'mutable-content': 1,
            category: notification.type
          }
        }
      }
    };
  }

  /**
   * Get notification actions based on type
   */
  static getNotificationActions(notification) {
    const actionsMap = {
      'new_message': [
        { action: 'reply', title: 'Reply' },
        { action: 'view', title: 'View' }
      ],
      'connection_request': [
        { action: 'accept', title: 'Accept' },
        { action: 'decline', title: 'Decline' }
      ],
      'group_invitation': [
        { action: 'join', title: 'Join' },
        { action: 'decline', title: 'Decline' }
      ],
      'moodle_assignment': [
        { action: 'view', title: 'View Assignment' }
      ],
      'moodle_deadline': [
        { action: 'view', title: 'View' },
        { action: 'snooze', title: 'Remind Later' }
      ]
    };

    return actionsMap[notification.type] || [
      { action: 'view', title: 'View' }
    ];
  }

  /**
   * Get Android notification channel
   */
  static getAndroidChannel(notification) {
    if (notification.priority === 'urgent') return 'urgent';
    if (notification.type.startsWith('moodle_')) return 'academic';
    if (notification.type.includes('message')) return 'messages';
    return 'default';
  }

  /**
   * Stringify notification data for FCM
   */
  static stringifyData(data) {
    if (!data) return {};
    
    const stringified = {};
    for (const [key, value] of Object.entries(data)) {
      stringified[key] = typeof value === 'string' ? value : JSON.stringify(value);
    }
    return stringified;
  }

  /**
   * Remove invalid push tokens
   */
  static async removeInvalidTokens(userId, invalidTokens) {
    const User = require('../../models/User');
    
    await User.findByIdAndUpdate(userId, {
      $pull: {
        pushTokens: {
          token: { $in: invalidTokens }
        }
      }
    });
  }

  /**
   * Send notification to topic subscribers
   */
  static async sendToTopic(topic, notification) {
    this.initializeFirebase();

    if (!this.firebaseInitialized) {
      return { success: false, error: 'Firebase not initialized' };
    }

    const payload = this.buildPayload(notification);

    try {
      const response = await admin.messaging().send({
        topic,
        notification: payload.notification,
        data: payload.data,
        webpush: payload.webpush,
        android: payload.android,
        apns: payload.apns
      });

      return { success: true, messageId: response };
    } catch (error) {
      console.error('Topic notification error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Subscribe user to topic
   */
  static async subscribeToTopic(tokens, topic) {
    this.initializeFirebase();

    if (!this.firebaseInitialized) return false;

    try {
      await admin.messaging().subscribeToTopic(tokens, topic);
      return true;
    } catch (error) {
      console.error('Subscribe to topic error:', error);
      return false;
    }
  }

  /**
   * Unsubscribe user from topic
   */
  static async unsubscribeFromTopic(tokens, topic) {
    this.initializeFirebase();

    if (!this.firebaseInitialized) return false;

    try {
      await admin.messaging().unsubscribeFromTopic(tokens, topic);
      return true;
    } catch (error) {
      console.error('Unsubscribe from topic error:', error);
      return false;
    }
  }
}

module.exports = PushService;
