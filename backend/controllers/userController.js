const User = require('../models/User');

// @desc    Join chat with username (create user if not exists)
// @route   POST /api/users/join
// @access  Public
const joinChat = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username || username.trim().length < 2) {
      return res.status(400).json({ message: 'Username must be at least 2 characters' });
    }

    const normalizedUsername = username.trim().toLowerCase();

    // Find or create user
    let user = await User.findOne({ username: normalizedUsername });
    
    if (!user) {
      user = await User.create({
        username: normalizedUsername,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(normalizedUsername)}&background=random`,
      });
    }

    res.json({
      _id: user._id,
      username: user.username,
      avatar: user.avatar,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search users
// @route   GET /api/users?search=
// @access  Private
const searchUsers = async (req, res) => {
  try {
    const keyword = req.query.search
      ? { username: { $regex: req.query.search, $options: 'i' } }
      : {};

    const users = await User.find(keyword)
      .find({ _id: { $ne: req.user._id } });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        _id: user._id,
        username: user.username,
        avatar: user.avatar,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { joinChat, searchUsers, getUserProfile };
