const express = require('express');
const { body, validationResult } = require('express-validator');
const { Message, Conversation } = require('../models/Message');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/messages/conversations
// @desc    Get all conversations for current user
// @access  Private
router.get('/conversations', protect, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    })
      .populate('participants', 'name avatar isOnline lastSeen')
      .populate('lastMessage.sender', 'name')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      conversations
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversations'
    });
  }
});

// @route   POST /api/messages/conversations
// @desc    Create or get existing conversation
// @access  Private
router.post('/conversations', protect, [
  body('participantId').notEmpty().withMessage('Participant ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { participantId } = req.body;

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      isGroup: false,
      participants: { $all: [req.user._id, participantId], $size: 2 }
    }).populate('participants', 'name avatar isOnline lastSeen');

    if (!conversation) {
      // Create new conversation
      conversation = await Conversation.create({
        participants: [req.user._id, participantId],
        isGroup: false
      });
      await conversation.populate('participants', 'name avatar isOnline lastSeen');
    }

    res.json({
      success: true,
      conversation
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating conversation'
    });
  }
});

// @route   POST /api/messages/conversations/group
// @desc    Create group conversation
// @access  Private
router.post('/conversations/group', protect, [
  body('name').trim().notEmpty().withMessage('Group name is required'),
  body('participants').isArray({ min: 1 }).withMessage('At least one participant required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, participants, avatar } = req.body;

    // Add current user to participants
    const allParticipants = [...new Set([req.user._id.toString(), ...participants])];

    const conversation = await Conversation.create({
      participants: allParticipants,
      isGroup: true,
      groupName: name,
      groupAvatar: avatar || '',
      groupAdmin: req.user._id
    });

    await conversation.populate('participants', 'name avatar isOnline lastSeen');

    res.status(201).json({
      success: true,
      conversation
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating group'
    });
  }
});

// @route   GET /api/messages/:conversationId
// @desc    Get messages for a conversation
// @access  Private
router.get('/:conversationId', protect, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Verify user is participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this conversation'
      });
    }

    const messages = await Message.find({ conversationId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Message.countDocuments({ conversationId });

    // Mark messages as read
    await Message.updateMany(
      { 
        conversationId, 
        sender: { $ne: req.user._id },
        readBy: { $ne: req.user._id }
      },
      { $addToSet: { readBy: req.user._id } }
    );

    res.json({
      success: true,
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages'
    });
  }
});

// @route   POST /api/messages/:conversationId
// @desc    Send a message
// @access  Private
router.post('/:conversationId', protect, [
  body('content').trim().notEmpty().withMessage('Message content is required')
    .isLength({ max: 2000 }).withMessage('Message cannot exceed 2000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { conversationId } = req.params;
    const { content, messageType, fileUrl } = req.body;

    // Verify user is participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send to this conversation'
      });
    }

    // Create message
    const message = await Message.create({
      conversationId,
      sender: req.user._id,
      content,
      messageType: messageType || 'text',
      fileUrl: fileUrl || '',
      readBy: [req.user._id]
    });

    await message.populate('sender', 'name avatar');

    // Update conversation's last message
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: {
        content,
        sender: req.user._id,
        createdAt: message.createdAt
      },
      updatedAt: Date.now()
    });

    res.status(201).json({
      success: true,
      message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message'
    });
  }
});

// @route   PUT /api/messages/conversations/:id/members
// @desc    Add/remove members from group
// @access  Private (group admin only)
router.put('/conversations/:id/members', protect, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation || !conversation.isGroup) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if user is admin
    if (conversation.groupAdmin.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only group admin can manage members'
      });
    }

    const { action, userId } = req.body;

    if (action === 'add') {
      if (!conversation.participants.includes(userId)) {
        conversation.participants.push(userId);
      }
    } else if (action === 'remove') {
      if (userId !== conversation.groupAdmin.toString()) {
        conversation.participants = conversation.participants.filter(
          p => p.toString() !== userId
        );
      }
    }

    await conversation.save();
    await conversation.populate('participants', 'name avatar isOnline lastSeen');

    res.json({
      success: true,
      conversation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating group members'
    });
  }
});

module.exports = router;
