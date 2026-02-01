const express = require('express');
const Group = require('../models/Group');
const Post = require('../models/Post');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { validate, validationRules } = require('../middleware/validation');
const NotificationService = require('../services/notification/notificationService');
const { createLimiter } = require('../middleware/rateLimit');

const router = express.Router();

/**
 * @route   GET /api/groups
 * @desc    Get groups (public or user's groups)
 * @access  Private
 */
router.get('/', auth, validationRules.pagination, validate, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, type, category, myGroups } = req.query;
    
    let query = { isActive: true, isArchived: false };
    
    if (myGroups === 'true') {
      query['members.user'] = req.userId;
    } else {
      // Show public groups or groups user is member of
      query.$or = [
        { type: 'public' },
        { 'members.user': req.userId }
      ];
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (type) {
      query.type = type;
    }
    
    if (category) {
      query.category = category;
    }
    
    const groups = await Group.find(query)
      .sort({ 'metrics.totalMembers': -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('creator', 'username firstName lastName avatar')
      .lean();
    
    // Add membership status
    const groupsWithStatus = groups.map(group => ({
      ...group,
      memberCount: group.members?.length || 0,
      isMember: group.members?.some(m => m.user.toString() === req.userId.toString()),
      userRole: group.members?.find(m => m.user.toString() === req.userId.toString())?.role
    }));
    
    const total = await Group.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        groups: groupsWithStatus,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get groups'
    });
  }
});

/**
 * @route   GET /api/groups/:id
 * @desc    Get group details
 * @access  Private
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('creator', 'username firstName lastName avatar')
      .populate('members.user', 'username firstName lastName avatar')
      .populate('pinnedPosts');
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    // Check access for private groups
    if (group.type === 'private' && !group.isMember(req.userId)) {
      return res.status(403).json({
        success: false,
        message: 'This is a private group'
      });
    }
    
    const groupData = group.toObject();
    groupData.isMember = group.isMember(req.userId);
    groupData.userRole = group.getUserRole(req.userId);
    groupData.isAdmin = group.isAdminOrOwner(req.userId);
    
    res.json({
      success: true,
      data: { group: groupData }
    });
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get group'
    });
  }
});

/**
 * @route   POST /api/groups
 * @desc    Create a new group
 * @access  Private
 */
router.post('/', auth, createLimiter, validationRules.createGroup, validate, async (req, res) => {
  try {
    const { name, description, type, category, tags, settings, course } = req.body;
    
    const group = new Group({
      name,
      description,
      type: type || 'public',
      category: category || 'general',
      tags: tags || [],
      settings,
      course,
      creator: req.userId,
      members: [{
        user: req.userId,
        role: 'owner',
        joinedAt: new Date()
      }]
    });
    
    group.metrics.totalMembers = 1;
    
    await group.save();
    await group.populate('creator', 'username firstName lastName avatar');
    await group.populate('members.user', 'username firstName lastName avatar');
    
    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      data: { group }
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create group'
    });
  }
});

/**
 * @route   PUT /api/groups/:id
 * @desc    Update group
 * @access  Private (Admin/Owner)
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    if (!group.isAdminOrOwner(req.userId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this group'
      });
    }
    
    const allowedUpdates = [
      'name', 'description', 'avatar', 'coverImage', 
      'tags', 'settings', 'category'
    ];
    
    for (const field of allowedUpdates) {
      if (req.body[field] !== undefined) {
        group[field] = req.body[field];
      }
    }
    
    await group.save();
    await group.populate('creator', 'username firstName lastName avatar');
    await group.populate('members.user', 'username firstName lastName avatar');
    
    res.json({
      success: true,
      message: 'Group updated successfully',
      data: { group }
    });
  } catch (error) {
    console.error('Update group error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update group'
    });
  }
});

/**
 * @route   POST /api/groups/:id/join
 * @desc    Join a group
 * @access  Private
 */
router.post('/:id/join', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    if (group.isMember(req.userId)) {
      return res.status(400).json({
        success: false,
        message: 'Already a member of this group'
      });
    }
    
    if (group.type === 'private') {
      // Check if already requested
      const existingRequest = group.membershipRequests.find(
        r => r.user.toString() === req.userId.toString() && r.status === 'pending'
      );
      
      if (existingRequest) {
        return res.status(400).json({
          success: false,
          message: 'Membership request already pending'
        });
      }
      
      // Add membership request
      group.membershipRequests.push({
        user: req.userId,
        message: req.body.message,
        requestedAt: new Date()
      });
      
      await group.save();
      
      // Notify admins
      const admins = group.members.filter(m => ['admin', 'owner'].includes(m.role));
      const requester = await User.findById(req.userId);
      
      for (const admin of admins) {
        await NotificationService.createNotification({
          recipient: admin.user,
          type: 'group_membership',
          title: 'New Membership Request',
          message: `${requester.firstName} ${requester.lastName} requested to join "${group.name}"`,
          actor: req.userId,
          relatedEntity: { entityType: 'group', entityId: group._id }
        });
      }
      
      return res.json({
        success: true,
        message: 'Membership request sent'
      });
    }
    
    // Public group - join directly
    group.addMember(req.userId);
    await group.save();
    
    res.json({
      success: true,
      message: 'Joined group successfully'
    });
  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join group'
    });
  }
});

/**
 * @route   POST /api/groups/:id/leave
 * @desc    Leave a group
 * @access  Private
 */
router.post('/:id/leave', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    if (!group.isMember(req.userId)) {
      return res.status(400).json({
        success: false,
        message: 'Not a member of this group'
      });
    }
    
    const userRole = group.getUserRole(req.userId);
    
    // Owner cannot leave (must transfer ownership first)
    if (userRole === 'owner') {
      return res.status(400).json({
        success: false,
        message: 'Owner cannot leave. Transfer ownership first.'
      });
    }
    
    group.removeMember(req.userId);
    await group.save();
    
    res.json({
      success: true,
      message: 'Left group successfully'
    });
  } catch (error) {
    console.error('Leave group error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to leave group'
    });
  }
});

/**
 * @route   POST /api/groups/:id/members/:userId/approve
 * @desc    Approve membership request
 * @access  Private (Admin/Owner)
 */
router.post('/:id/members/:userId/approve', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    if (!group.isAdminOrOwner(req.userId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }
    
    const requestIndex = group.membershipRequests.findIndex(
      r => r.user.toString() === req.params.userId && r.status === 'pending'
    );
    
    if (requestIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'No pending request from this user'
      });
    }
    
    // Update request status
    group.membershipRequests[requestIndex].status = 'approved';
    group.membershipRequests[requestIndex].processedBy = req.userId;
    group.membershipRequests[requestIndex].processedAt = new Date();
    
    // Add as member
    group.addMember(req.params.userId, 'member', req.userId);
    await group.save();
    
    // Notify user
    await NotificationService.createNotification({
      recipient: req.params.userId,
      type: 'group_membership',
      title: 'Membership Approved',
      message: `Your request to join "${group.name}" has been approved`,
      actor: req.userId,
      relatedEntity: { entityType: 'group', entityId: group._id }
    });
    
    res.json({
      success: true,
      message: 'Membership approved'
    });
  } catch (error) {
    console.error('Approve membership error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve membership'
    });
  }
});

/**
 * @route   POST /api/groups/:id/invite
 * @desc    Invite user to group
 * @access  Private
 */
router.post('/:id/invite', auth, async (req, res) => {
  try {
    const { userId } = req.body;
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    // Check if user can invite
    if (!group.isMember(req.userId)) {
      return res.status(403).json({
        success: false,
        message: 'Must be a member to invite others'
      });
    }
    
    if (!group.settings.allowMemberInvites && !group.isAdminOrOwner(req.userId)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can invite members'
      });
    }
    
    if (group.isMember(userId)) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member'
      });
    }
    
    // Check if already invited
    const existingInvite = group.invitations.find(
      i => i.user.toString() === userId && i.status === 'pending'
    );
    
    if (existingInvite) {
      return res.status(400).json({
        success: false,
        message: 'User has already been invited'
      });
    }
    
    // Add invitation
    group.invitations.push({
      user: userId,
      invitedBy: req.userId,
      invitedAt: new Date()
    });
    
    await group.save();
    
    // Send notification
    const inviter = await User.findById(req.userId);
    await NotificationService.createNotification({
      recipient: userId,
      type: 'group_invitation',
      title: 'Group Invitation',
      message: `${inviter.firstName} ${inviter.lastName} invited you to join "${group.name}"`,
      actor: req.userId,
      relatedEntity: { entityType: 'group', entityId: group._id }
    });
    
    res.json({
      success: true,
      message: 'Invitation sent'
    });
  } catch (error) {
    console.error('Invite to group error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send invitation'
    });
  }
});

/**
 * @route   GET /api/groups/:id/posts
 * @desc    Get group posts
 * @access  Private
 */
router.get('/:id/posts', auth, validationRules.pagination, validate, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    // Check access
    if (group.type === 'private' && !group.isMember(req.userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    const posts = await Post.find({ 
      group: req.params.id,
      isArchived: false
    })
      .sort({ isPinned: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('author', 'username firstName lastName avatar')
      .populate('comments.author', 'username firstName lastName avatar')
      .lean();
    
    const total = await Post.countDocuments({ 
      group: req.params.id,
      isArchived: false
    });
    
    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get group posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get group posts'
    });
  }
});

module.exports = router;
