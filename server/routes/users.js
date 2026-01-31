const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (for search/follow)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { search, role } = req.query;
    
    let query = { _id: { $ne: req.user._id } }; // Exclude current user

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('name email avatar role department isOnline lastSeen')
      .limit(50);

    res.json({
      success: true,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user profile
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'name avatar')
      .populate('following', 'name avatar');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's posts
    const posts = await Post.find({ author: req.params.id })
      .populate('author', 'name avatar role')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      user: user.toPublicProfile(),
      posts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user'
    });
  }
});

// @route   POST /api/users/:id/follow
// @desc    Follow/unfollow a user
// @access  Private
router.post('/:id/follow', protect, async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You can't follow yourself"
      });
    }

    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isFollowing = currentUser.following.includes(req.params.id);

    if (isFollowing) {
      // Unfollow
      currentUser.following.pull(req.params.id);
      userToFollow.followers.pull(req.user._id);
    } else {
      // Follow
      currentUser.following.push(req.params.id);
      userToFollow.followers.push(req.user._id);
    }

    await currentUser.save();
    await userToFollow.save();

    res.json({
      success: true,
      following: !isFollowing,
      followersCount: userToFollow.followers.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error following user'
    });
  }
});

// @route   GET /api/users/:id/followers
// @desc    Get user's followers
// @access  Private
router.get('/:id/followers', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'name avatar role department isOnline');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      followers: user.followers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching followers'
    });
  }
});

// @route   GET /api/users/:id/following
// @desc    Get users that user is following
// @access  Private
router.get('/:id/following', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('following', 'name avatar role department isOnline');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      following: user.following
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching following'
    });
  }
});

module.exports = router;
