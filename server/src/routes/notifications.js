const express = require('express');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { validate, validationRules } = require('../middleware/validation');

const router = express.Router();

/**
 * @route   GET /api/notifications
 * @desc    Get user's notifications
 * @access  Private
 */
router.get('/', auth, validationRules.pagination, validate, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, source, unreadOnly } = req.query;
    
    const query = { 
      recipient: req.userId,
      archived: false
    };
    
    if (type) {
      query.type = type;
    }
    
    if (source) {
      query.source = source;
    }
    
    if (unreadOnly === 'true') {
      query['channels.inApp.read'] = false;
    }
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('actor', 'username firstName lastName avatar')
      .lean();
    
    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.getUnreadCount(req.userId);
    
    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notifications'
    });
  }
});

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Private
 */
router.get('/unread-count', auth, async (req, res) => {
  try {
    const count = await Notification.getUnreadCount(req.userId);
    
    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count'
    });
  }
});

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.userId
    });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    await notification.markAsRead();
    
    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
});

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put('/read-all', auth, async (req, res) => {
  try {
    await Notification.markAllAsRead(req.userId);
    
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read'
    });
  }
});

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Archive/delete a notification
 * @access  Private
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.userId },
      { archived: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification'
    });
  }
});

/**
 * @route   GET /api/notifications/preferences
 * @desc    Get notification preferences
 * @access  Private
 */
router.get('/preferences', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('notificationPreferences');
    
    res.json({
      success: true,
      data: { preferences: user.notificationPreferences }
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notification preferences'
    });
  }
});

/**
 * @route   PUT /api/notifications/preferences
 * @desc    Update notification preferences
 * @access  Private
 */
router.put('/preferences', auth, validationRules.updateNotificationPreferences, validate, async (req, res) => {
  try {
    const updates = {};
    const allowedFields = [
      'channels', 'types', 'moodleSync', 'emailFrequency', 
      'quietHours', 'doNotDisturb'
    ];
    
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[`notificationPreferences.${field}`] = req.body[field];
      }
    }
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true }
    ).select('notificationPreferences');
    
    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: { preferences: user.notificationPreferences }
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification preferences'
    });
  }
});

/**
 * @route   POST /api/notifications/push-token
 * @desc    Register push notification token
 * @access  Private
 */
router.post('/push-token', auth, async (req, res) => {
  try {
    const { token, device, platform } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Push token is required'
      });
    }
    
    const user = await User.findById(req.userId);
    
    // Check if token already exists
    const existingIndex = user.pushTokens.findIndex(t => t.token === token);
    
    if (existingIndex > -1) {
      // Update existing token
      user.pushTokens[existingIndex].device = device;
      user.pushTokens[existingIndex].platform = platform;
      user.pushTokens[existingIndex].addedAt = new Date();
    } else {
      // Add new token
      user.pushTokens.push({ token, device, platform });
    }
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Push token registered'
    });
  } catch (error) {
    console.error('Register push token error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register push token'
    });
  }
});

/**
 * @route   DELETE /api/notifications/push-token
 * @desc    Remove push notification token
 * @access  Private
 */
router.delete('/push-token', auth, async (req, res) => {
  try {
    const { token } = req.body;
    
    await User.findByIdAndUpdate(req.userId, {
      $pull: { pushTokens: { token } }
    });
    
    res.json({
      success: true,
      message: 'Push token removed'
    });
  } catch (error) {
    console.error('Remove push token error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove push token'
    });
  }
});

module.exports = router;
