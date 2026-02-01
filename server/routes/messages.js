const express = require('express');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

const router = express.Router();

// Send message
router.post('/', auth, async (req, res) => {
  try {
    const { receiver, content } = req.body;

    const message = new Message({
      sender: req.user._id,
      receiver,
      content
    });

    await message.save();
    await message.populate('sender', 'username avatar');
    await message.populate('receiver', 'username avatar');

    // Create notification
    const notification = new Notification({
      recipient: receiver,
      sender: req.user._id,
      type: 'message'
    });
    await notification.save();
    await notification.populate('sender', 'username avatar');

    // Emit real-time message
    req.io.to(receiver).emit('newMessage', message);
    req.io.to(receiver).emit('notification', notification);

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get conversation with a user
router.get('/conversation/:userId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id }
      ]
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'username avatar')
      .populate('receiver', 'username avatar');

    // Mark messages as read
    await Message.updateMany(
      { sender: req.params.userId, receiver: req.user._id, read: false },
      { read: true }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all conversations (latest message from each user)
router.get('/conversations', auth, async (req, res) => {
  try {
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: req.user._id },
            { receiver: req.user._id }
          ]
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', req.user._id] },
              '$receiver',
              '$sender'
            ]
          },
          lastMessage: { $first: '$$ROOT' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          lastMessage: 1,
          'user.username': 1,
          'user.avatar': 1
        }
      }
    ]);

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get unread message count
router.get('/unread', auth, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user._id,
      read: false
    });

    res.json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
