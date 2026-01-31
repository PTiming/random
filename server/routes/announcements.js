const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const { protect, restrictTo } = require('../middleware/auth');

// Get all announcements
router.get('/', protect, async (req, res) => {
  try {
    const { course, priority } = req.query;
    const query = {};
    
    if (course) query.course = course;
    if (priority) query.priority = priority;
    
    // Filter out expired announcements
    query.$or = [
      { expiresAt: { $exists: false } },
      { expiresAt: null },
      { expiresAt: { $gte: new Date() } }
    ];

    const announcements = await Announcement.find(query)
      .populate('author', 'firstName lastName avatar role')
      .sort({ isPinned: -1, createdAt: -1 });

    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create announcement (teachers and admins only)
router.post('/', protect, restrictTo('teacher', 'admin'), async (req, res) => {
  try {
    const { title, content, priority, course, isPinned, expiresAt } = req.body;

    const announcement = await Announcement.create({
      author: req.user._id,
      title,
      content,
      priority,
      course,
      isPinned,
      expiresAt
    });

    await announcement.populate('author', 'firstName lastName avatar role');

    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark announcement as read
router.put('/:id/read', protect, async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { readBy: req.user._id } },
      { new: true }
    );

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    res.json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update announcement
router.put('/:id', protect, restrictTo('teacher', 'admin'), async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Only author or admin can update
    if (announcement.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updated = await Announcement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('author', 'firstName lastName avatar role');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete announcement
router.delete('/:id', protect, restrictTo('teacher', 'admin'), async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    if (announcement.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await announcement.deleteOne();
    res.json({ message: 'Announcement deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
