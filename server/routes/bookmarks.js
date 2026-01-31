const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const { protect } = require('../middleware/auth');

// Get bookmarked posts
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'bookmarks',
      populate: {
        path: 'author',
        select: 'firstName lastName avatar role'
      }
    });

    res.json(user.bookmarks || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add bookmark
router.post('/:postId', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { bookmarks: req.params.postId } },
      { new: true }
    );

    res.json({ message: 'Post bookmarked', bookmarks: user.bookmarks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove bookmark
router.delete('/:postId', protect, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { bookmarks: req.params.postId } },
      { new: true }
    );

    res.json({ message: 'Bookmark removed', bookmarks: user.bookmarks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check if post is bookmarked
router.get('/check/:postId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const isBookmarked = user.bookmarks && user.bookmarks.includes(req.params.postId);

    res.json({ isBookmarked });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
