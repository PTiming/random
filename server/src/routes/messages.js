const express = require('express');
const { Message, Conversation } = require('../models/Message');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { validate, validationRules } = require('../middleware/validation');
const NotificationService = require('../services/notification/notificationService');
const { getIO, emitToUser } = require('../services/notification/socketService');
const { createLimiter } = require('../middleware/rateLimit');

const router = express.Router();

/**
 * @route   GET /api/messages/conversations
 * @desc    Get user's conversations
 * @access  Private
 */
router.get('/conversations', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const conversations = await Conversation.find({
      'participants.user': req.userId,
      isArchived: false
    })
      .sort({ 'lastMessage.timestamp': -1, updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('participants.user', 'username firstName lastName avatar')
      .lean();
    
    // Add unread counts
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const participant = conv.participants.find(
          p => p.user._id.toString() === req.userId.toString()
        );
        
        let unreadCount = 0;
        if (participant?.lastRead) {
          unreadCount = await Message.countDocuments({
            conversation: conv._id,
            createdAt: { $gt: participant.lastRead },
            sender: { $ne: req.userId }
          });
        } else {
          unreadCount = await Message.countDocuments({
            conversation: conv._id,
            sender: { $ne: req.userId }
          });
        }
        
        return { ...conv, unreadCount };
      })
    );
    
    const total = await Conversation.countDocuments({
      'participants.user': req.userId,
      isArchived: false
    });
    
    res.json({
      success: true,
      data: {
        conversations: conversationsWithUnread,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversations'
    });
  }
});

/**
 * @route   GET /api/messages/conversations/:id
 * @desc    Get messages in a conversation
 * @access  Private
 */
router.get('/conversations/:id', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    const conversation = await Conversation.findById(req.params.id)
      .populate('participants.user', 'username firstName lastName avatar');
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    if (!conversation.isParticipant(req.userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    const messages = await Message.find({ 
      conversation: req.params.id,
      isDeleted: false
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('sender', 'username firstName lastName avatar')
      .populate('replyTo', 'content sender')
      .lean();
    
    // Mark messages as read
    const participantIndex = conversation.participants.findIndex(
      p => p.user._id.toString() === req.userId.toString()
    );
    
    if (participantIndex > -1) {
      conversation.participants[participantIndex].lastRead = new Date();
      await conversation.save();
    }
    
    const total = await Message.countDocuments({ 
      conversation: req.params.id,
      isDeleted: false
    });
    
    res.json({
      success: true,
      data: {
        conversation,
        messages: messages.reverse(),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get messages'
    });
  }
});

/**
 * @route   POST /api/messages/conversations
 * @desc    Create a new conversation (group)
 * @access  Private
 */
router.post('/conversations', auth, async (req, res) => {
  try {
    const { name, participants, description } = req.body;
    
    if (!participants || participants.length < 1) {
      return res.status(400).json({
        success: false,
        message: 'At least one participant is required'
      });
    }
    
    // Include current user
    const allParticipants = [
      { user: req.userId, role: 'admin' },
      ...participants.map(p => ({ user: p, role: 'member' }))
    ];
    
    const conversation = new Conversation({
      type: 'group',
      name,
      description,
      participants: allParticipants
    });
    
    await conversation.save();
    await conversation.populate('participants.user', 'username firstName lastName avatar');
    
    // Send notifications to invited participants
    const creator = await User.findById(req.userId);
    for (const participant of participants) {
      await NotificationService.createNotification({
        recipient: participant,
        type: 'new_group_message',
        title: 'Added to Conversation',
        message: `${creator.firstName} ${creator.lastName} added you to "${name}"`,
        actor: req.userId,
        relatedEntity: { entityType: 'conversation', entityId: conversation._id }
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Conversation created',
      data: { conversation }
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create conversation'
    });
  }
});

/**
 * @route   POST /api/messages/direct/:userId
 * @desc    Start or get direct conversation with a user
 * @access  Private
 */
router.post('/direct/:userId', auth, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    
    if (targetUserId === req.userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot message yourself'
      });
    }
    
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const conversation = await Conversation.findOrCreateDirect(req.userId, targetUserId);
    await conversation.populate('participants.user', 'username firstName lastName avatar');
    
    res.json({
      success: true,
      data: { conversation }
    });
  } catch (error) {
    console.error('Get direct conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversation'
    });
  }
});

/**
 * @route   POST /api/messages/conversations/:id/messages
 * @desc    Send a message
 * @access  Private
 */
router.post('/conversations/:id/messages', auth, createLimiter, validationRules.sendMessage, validate, async (req, res) => {
  try {
    const { content, attachments, replyTo } = req.body;
    
    const conversation = await Conversation.findById(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    if (!conversation.isParticipant(req.userId)) {
      return res.status(403).json({
        success: false,
        message: 'Not a participant of this conversation'
      });
    }
    
    const message = new Message({
      sender: req.userId,
      conversation: conversation._id,
      content,
      attachments: attachments || [],
      replyTo
    });
    
    await message.save();
    await message.populate('sender', 'username firstName lastName avatar');
    
    // Update conversation last message
    conversation.lastMessage = {
      content: content.substring(0, 100),
      sender: req.userId,
      timestamp: new Date(),
      type: 'text'
    };
    await conversation.save();
    
    // Send real-time notification via Socket.io
    const io = getIO();
    if (io) {
      conversation.participants.forEach(participant => {
        if (participant.user.toString() !== req.userId.toString()) {
          emitToUser(participant.user.toString(), 'new_message', {
            conversationId: conversation._id,
            message
          });
        }
      });
    }
    
    // Send push notifications to other participants
    const sender = await User.findById(req.userId);
    for (const participant of conversation.participants) {
      if (participant.user.toString() !== req.userId.toString() && !participant.muted) {
        await NotificationService.createNotification({
          recipient: participant.user,
          type: conversation.type === 'direct' ? 'new_message' : 'new_group_message',
          title: conversation.type === 'direct' 
            ? `${sender.firstName} ${sender.lastName}`
            : conversation.name,
          message: content.substring(0, 100),
          actor: req.userId,
          relatedEntity: { entityType: 'message', entityId: message._id }
        });
      }
    }
    
    res.status(201).json({
      success: true,
      data: { message }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
});

/**
 * @route   DELETE /api/messages/:id
 * @desc    Delete a message
 * @access  Private
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    if (message.sender.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this message'
      });
    }
    
    message.isDeleted = true;
    message.deletedAt = new Date();
    message.content = 'This message has been deleted';
    await message.save();
    
    // Emit deletion event
    const io = getIO();
    if (io) {
      const conversation = await Conversation.findById(message.conversation);
      conversation.participants.forEach(participant => {
        emitToUser(participant.user.toString(), 'message_deleted', {
          conversationId: conversation._id,
          messageId: message._id
        });
      });
    }
    
    res.json({
      success: true,
      message: 'Message deleted'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message'
    });
  }
});

/**
 * @route   POST /api/messages/:id/react
 * @desc    Add reaction to a message
 * @access  Private
 */
router.post('/:id/react', auth, async (req, res) => {
  try {
    const { emoji } = req.body;
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    // Verify user is participant
    const conversation = await Conversation.findById(message.conversation);
    if (!conversation.isParticipant(req.userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Add or update reaction
    const existingIndex = message.reactions.findIndex(
      r => r.user.toString() === req.userId.toString()
    );
    
    if (existingIndex > -1) {
      message.reactions[existingIndex].emoji = emoji;
    } else {
      message.reactions.push({ user: req.userId, emoji });
    }
    
    await message.save();
    
    // Emit reaction event
    const io = getIO();
    if (io) {
      conversation.participants.forEach(participant => {
        emitToUser(participant.user.toString(), 'message_reaction', {
          conversationId: conversation._id,
          messageId: message._id,
          reactions: message.reactions
        });
      });
    }
    
    res.json({
      success: true,
      data: { reactions: message.reactions }
    });
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add reaction'
    });
  }
});

module.exports = router;
