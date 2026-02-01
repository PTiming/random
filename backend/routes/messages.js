const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { auth } = require('../middleware/auth');

// Get conversations
router.get('/conversations', auth, async (req, res) => {
  try {
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: req.user._id },
            { recipient: req.user._id },
            { groupRecipients: req.user._id }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$conversationType', 'direct'] },
              {
                $cond: [
                  { $eq: ['$sender', req.user._id] },
                  '$recipient',
                  '$sender'
                ]
              },
              '$_id'
            ]
          },
          lastMessage: { $first: '$$ROOT' }
        }
      }
    ]);

    await Message.populate(conversations, [
      { path: 'lastMessage.sender', select: 'firstName lastName username profilePicture' },
      { path: 'lastMessage.recipient', select: 'firstName lastName username profilePicture' }
    ]);

    res.json({ conversations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get messages with a user
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      conversationType: 'direct',
      $or: [
        { sender: req.user._id, recipient: req.params.userId },
        { sender: req.params.userId, recipient: req.user._id }
      ]
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'firstName lastName username profilePicture')
      .populate('recipient', 'firstName lastName username profilePicture');

    res.json({ messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send message
router.post('/', auth, async (req, res) => {
  try {
    const message = new Message({
      ...req.body,
      sender: req.user._id
    });

    await message.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'firstName lastName username profilePicture')
      .populate('recipient', 'firstName lastName username profilePicture');

    // Emit socket event for real-time delivery
    const io = req.app.get('io');
    if (message.conversationType === 'direct' && message.recipient) {
      io.to(message.recipient.toString()).emit('new-message', populatedMessage);
    }

    res.status(201).json({ message: populatedMessage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark message as read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const alreadyRead = message.readBy.some(r => r.user.equals(req.user._id));

    if (!alreadyRead) {
      message.readBy.push({ user: req.user._id });
      await message.save();
    }

    res.json({ message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
