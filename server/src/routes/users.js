const express = require('express');
const User = require('../models/User');
const { auth, optionalAuth } = require('../middleware/auth');
const { validate, validationRules } = require('../middleware/validation');
const NotificationService = require('../services/notification/notificationService');

const router = express.Router();

/**
 * @route   GET /api/users
 * @desc    Search/list users
 * @access  Private
 */
router.get('/', auth, validationRules.pagination, validate, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, institution } = req.query;
    
    const query = { isActive: true, _id: { $ne: req.userId } };
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (role) {
      query.role = role;
    }
    
    if (institution) {
      query.institution = institution;
    }
    
    const users = await User.find(query)
      .select('username firstName lastName avatar bio role institution skills')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();
    
    const total = await User.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users'
    });
  }
});

/**
 * @route   GET /api/users/:id
 * @desc    Get user profile
 * @access  Public/Private
 */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -moodleToken -loginHistory -verificationToken -resetPasswordToken');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Add connection status if authenticated
    let connectionStatus = null;
    if (req.userId) {
      const currentUser = await User.findById(req.userId);
      if (currentUser.isConnectedWith(user._id)) {
        connectionStatus = 'connected';
      } else if (currentUser.connectionRequests.sent.some(r => r.user.toString() === user._id.toString())) {
        connectionStatus = 'pending_sent';
      } else if (currentUser.connectionRequests.received.some(r => r.user.toString() === user._id.toString())) {
        connectionStatus = 'pending_received';
      }
    }
    
    res.json({
      success: true,
      data: {
        user: {
          ...user.toPublicProfile(),
          connectionStatus
        }
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user'
    });
  }
});

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', auth, async (req, res) => {
  try {
    const allowedUpdates = [
      'firstName', 'lastName', 'bio', 'avatar', 
      'skills', 'interests', 'institution', 'department', 'academicYear'
    ];
    
    const updates = {};
    for (const field of allowedUpdates) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -moodleToken');
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: user.toPublicProfile() }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

/**
 * @route   POST /api/users/:id/connect
 * @desc    Send connection request
 * @access  Private
 */
router.post('/:id/connect', auth, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    
    if (targetUserId === req.userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot connect with yourself'
      });
    }
    
    const [currentUser, targetUser] = await Promise.all([
      User.findById(req.userId),
      User.findById(targetUserId)
    ]);
    
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if already connected
    if (currentUser.isConnectedWith(targetUserId)) {
      return res.status(400).json({
        success: false,
        message: 'Already connected'
      });
    }
    
    // Check if request already sent
    const existingRequest = currentUser.connectionRequests.sent.find(
      r => r.user.toString() === targetUserId
    );
    
    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'Connection request already sent'
      });
    }
    
    // Check if target has already sent a request (auto-accept)
    const incomingRequest = currentUser.connectionRequests.received.find(
      r => r.user.toString() === targetUserId
    );
    
    if (incomingRequest) {
      // Auto-accept: both become connected
      currentUser.connections.push(targetUserId);
      targetUser.connections.push(req.userId);
      
      // Remove from pending requests
      currentUser.connectionRequests.received = currentUser.connectionRequests.received.filter(
        r => r.user.toString() !== targetUserId
      );
      targetUser.connectionRequests.sent = targetUser.connectionRequests.sent.filter(
        r => r.user.toString() !== req.userId.toString()
      );
      
      await Promise.all([currentUser.save(), targetUser.save()]);
      
      // Send notification to target user
      await NotificationService.createNotification({
        recipient: targetUserId,
        type: 'connection_accepted',
        title: 'Connection Accepted',
        message: `${currentUser.firstName} ${currentUser.lastName} accepted your connection request`,
        actor: req.userId,
        relatedEntity: { entityType: 'user', entityId: req.userId }
      });
      
      return res.json({
        success: true,
        message: 'Connection established',
        data: { status: 'connected' }
      });
    }
    
    // Add to pending requests
    currentUser.connectionRequests.sent.push({ user: targetUserId });
    targetUser.connectionRequests.received.push({ user: req.userId });
    
    await Promise.all([currentUser.save(), targetUser.save()]);
    
    // Send notification
    await NotificationService.createNotification({
      recipient: targetUserId,
      type: 'connection_request',
      title: 'New Connection Request',
      message: `${currentUser.firstName} ${currentUser.lastName} wants to connect with you`,
      actor: req.userId,
      relatedEntity: { entityType: 'user', entityId: req.userId }
    });
    
    res.json({
      success: true,
      message: 'Connection request sent',
      data: { status: 'pending_sent' }
    });
  } catch (error) {
    console.error('Connect error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send connection request'
    });
  }
});

/**
 * @route   POST /api/users/:id/accept
 * @desc    Accept connection request
 * @access  Private
 */
router.post('/:id/accept', auth, async (req, res) => {
  try {
    const requesterId = req.params.id;
    
    const [currentUser, requester] = await Promise.all([
      User.findById(req.userId),
      User.findById(requesterId)
    ]);
    
    if (!requester) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if request exists
    const requestIndex = currentUser.connectionRequests.received.findIndex(
      r => r.user.toString() === requesterId
    );
    
    if (requestIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'No connection request from this user'
      });
    }
    
    // Accept connection
    currentUser.connections.push(requesterId);
    requester.connections.push(req.userId);
    
    // Remove from pending
    currentUser.connectionRequests.received.splice(requestIndex, 1);
    requester.connectionRequests.sent = requester.connectionRequests.sent.filter(
      r => r.user.toString() !== req.userId.toString()
    );
    
    await Promise.all([currentUser.save(), requester.save()]);
    
    // Send notification
    await NotificationService.createNotification({
      recipient: requesterId,
      type: 'connection_accepted',
      title: 'Connection Accepted',
      message: `${currentUser.firstName} ${currentUser.lastName} accepted your connection request`,
      actor: req.userId,
      relatedEntity: { entityType: 'user', entityId: req.userId }
    });
    
    res.json({
      success: true,
      message: 'Connection accepted'
    });
  } catch (error) {
    console.error('Accept connection error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept connection'
    });
  }
});

/**
 * @route   DELETE /api/users/:id/connect
 * @desc    Remove connection or cancel request
 * @access  Private
 */
router.delete('/:id/connect', auth, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    
    const [currentUser, targetUser] = await Promise.all([
      User.findById(req.userId),
      User.findById(targetUserId)
    ]);
    
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Remove from connections if connected
    currentUser.connections = currentUser.connections.filter(
      id => id.toString() !== targetUserId
    );
    targetUser.connections = targetUser.connections.filter(
      id => id.toString() !== req.userId.toString()
    );
    
    // Remove from pending requests
    currentUser.connectionRequests.sent = currentUser.connectionRequests.sent.filter(
      r => r.user.toString() !== targetUserId
    );
    currentUser.connectionRequests.received = currentUser.connectionRequests.received.filter(
      r => r.user.toString() !== targetUserId
    );
    targetUser.connectionRequests.sent = targetUser.connectionRequests.sent.filter(
      r => r.user.toString() !== req.userId.toString()
    );
    targetUser.connectionRequests.received = targetUser.connectionRequests.received.filter(
      r => r.user.toString() !== req.userId.toString()
    );
    
    await Promise.all([currentUser.save(), targetUser.save()]);
    
    res.json({
      success: true,
      message: 'Connection removed'
    });
  } catch (error) {
    console.error('Remove connection error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove connection'
    });
  }
});

/**
 * @route   POST /api/users/:id/follow
 * @desc    Follow a user
 * @access  Private
 */
router.post('/:id/follow', auth, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    
    if (targetUserId === req.userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot follow yourself'
      });
    }
    
    const [currentUser, targetUser] = await Promise.all([
      User.findById(req.userId),
      User.findById(targetUserId)
    ]);
    
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if already following
    if (currentUser.following.includes(targetUserId)) {
      return res.status(400).json({
        success: false,
        message: 'Already following this user'
      });
    }
    
    currentUser.following.push(targetUserId);
    targetUser.followers.push(req.userId);
    
    await Promise.all([currentUser.save(), targetUser.save()]);
    
    // Send notification
    await NotificationService.createNotification({
      recipient: targetUserId,
      type: 'new_follower',
      title: 'New Follower',
      message: `${currentUser.firstName} ${currentUser.lastName} is now following you`,
      actor: req.userId,
      relatedEntity: { entityType: 'user', entityId: req.userId }
    });
    
    res.json({
      success: true,
      message: 'Now following user'
    });
  } catch (error) {
    console.error('Follow error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to follow user'
    });
  }
});

/**
 * @route   DELETE /api/users/:id/follow
 * @desc    Unfollow a user
 * @access  Private
 */
router.delete('/:id/follow', auth, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    
    const [currentUser, targetUser] = await Promise.all([
      User.findById(req.userId),
      User.findById(targetUserId)
    ]);
    
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    currentUser.following = currentUser.following.filter(
      id => id.toString() !== targetUserId
    );
    targetUser.followers = targetUser.followers.filter(
      id => id.toString() !== req.userId.toString()
    );
    
    await Promise.all([currentUser.save(), targetUser.save()]);
    
    res.json({
      success: true,
      message: 'Unfollowed user'
    });
  } catch (error) {
    console.error('Unfollow error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unfollow user'
    });
  }
});

/**
 * @route   GET /api/users/:id/connections
 * @desc    Get user's connections
 * @access  Private
 */
router.get('/:id/connections', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('connections', 'username firstName lastName avatar bio');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: { connections: user.connections }
    });
  } catch (error) {
    console.error('Get connections error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get connections'
    });
  }
});

module.exports = router;
