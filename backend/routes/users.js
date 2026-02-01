const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth, checkRole } = require('../middleware/auth');

// Get user profile
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -tokens')
      .populate('courses', 'name code')
      .populate('connections', 'username firstName lastName profilePicture')
      .populate('groups', 'name type');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.patch('/me', auth, async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['firstName', 'lastName', 'bio', 'profilePicture', 'institution', 'department', 'skills'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ error: 'Invalid updates' });
    }

    updates.forEach(update => req.user[update] = req.body[update]);
    await req.user.save();

    res.json({ user: req.user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add connection (friend/follow)
router.post('/:id/connect', auth, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (req.user.connections.includes(targetUser._id)) {
      return res.status(400).json({ error: 'Already connected' });
    }

    req.user.connections.push(targetUser._id);
    req.user.following.push(targetUser._id);
    targetUser.followers.push(req.user._id);

    await req.user.save();
    await targetUser.save();

    res.json({ message: 'Connected successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove connection
router.delete('/:id/connect', auth, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    req.user.connections = req.user.connections.filter(c => !c.equals(targetUser._id));
    req.user.following = req.user.following.filter(f => !f.equals(targetUser._id));
    targetUser.followers = targetUser.followers.filter(f => !f.equals(req.user._id));

    await req.user.save();
    await targetUser.save();

    res.json({ message: 'Disconnected successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search users
router.get('/', auth, async (req, res) => {
  try {
    const { query, role, institution } = req.query;
    const searchQuery = {};

    if (query) {
      searchQuery.$or = [
        { username: { $regex: query, $options: 'i' } },
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ];
    }

    if (role) {
      searchQuery.role = role;
    }

    if (institution) {
      searchQuery.institution = { $regex: institution, $options: 'i' };
    }

    const users = await User.find(searchQuery)
      .select('-password -tokens')
      .limit(20);

    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
