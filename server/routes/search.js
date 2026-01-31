const express = require('express');
const Post = require('../models/Post');
const User = require('../models/User');
const StudyGroup = require('../models/StudyGroup');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/search
// @desc    Global search across posts, users, groups
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { q, type } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const searchRegex = new RegExp(q, 'i');
    const results = {};

    // Search based on type or all
    if (!type || type === 'all' || type === 'posts') {
      results.posts = await Post.find({
        content: searchRegex
      })
        .populate('author', 'name avatar role')
        .sort({ createdAt: -1 })
        .limit(10);
    }

    if (!type || type === 'all' || type === 'users') {
      results.users = await User.find({
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { department: searchRegex }
        ]
      })
        .select('name avatar role department isOnline')
        .limit(10);
    }

    if (!type || type === 'all' || type === 'groups') {
      results.groups = await StudyGroup.find({
        $or: [
          { name: searchRegex },
          { description: searchRegex },
          { course: searchRegex },
          { tags: searchRegex }
        ]
      })
        .populate('creator', 'name avatar')
        .limit(10);
    }

    res.json({
      success: true,
      query: q,
      results
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error performing search'
    });
  }
});

module.exports = router;
