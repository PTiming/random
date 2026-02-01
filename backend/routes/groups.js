const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const { auth } = require('../middleware/auth');

// Get all groups
router.get('/', auth, async (req, res) => {
  try {
    const { type, course } = req.query;
    const query = { isActive: true };

    if (type) query.type = type;
    if (course) query.course = course;

    const groups = await Group.find(query)
      .populate('creator', 'firstName lastName username')
      .populate('course', 'name code')
      .limit(50);

    res.json({ groups });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create group
router.post('/', auth, async (req, res) => {
  try {
    const group = new Group({
      ...req.body,
      creator: req.user._id,
      admins: [req.user._id],
      members: [{
        user: req.user._id,
        role: 'admin'
      }]
    });

    await group.save();

    req.user.groups.push(group._id);
    await req.user.save();

    res.status(201).json({ group });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Join group
router.post('/:id/join', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const isMember = group.members.some(m => m.user.equals(req.user._id));
    if (isMember) {
      return res.status(400).json({ error: 'Already a member' });
    }

    if (group.joinPolicy === 'request') {
      group.pendingRequests.push({ user: req.user._id });
      await group.save();
      return res.json({ message: 'Join request sent' });
    }

    group.members.push({ user: req.user._id });
    await group.save();

    req.user.groups.push(group._id);
    await req.user.save();

    res.json({ message: 'Joined group successfully', group });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Leave group
router.delete('/:id/leave', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    group.members = group.members.filter(m => !m.user.equals(req.user._id));
    await group.save();

    req.user.groups = req.user.groups.filter(g => !g.equals(group._id));
    await req.user.save();

    res.json({ message: 'Left group successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
