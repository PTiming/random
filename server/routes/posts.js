const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Post = require('../models/Post');
const User = require('../models/User');

// @route   GET /api/posts
// @desc    Get all posts
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', ['name', 'avatar'])
      .populate('comments.user', ['name', 'avatar'])
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/posts
// @desc    Create a post
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const newPost = new Post({
      user: req.user.id,
      content: req.body.content,
      image: req.body.image || ''
    });

    const post = await newPost.save();
    const populatedPost = await Post.findById(post.id).populate('user', ['name', 'avatar']);
    res.json(populatedPost);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/posts/:id/like
// @desc    Like/Unlike a post
// @access  Private
router.put('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    const index = post.likes.indexOf(req.user.id);

    if (index > -1) {
      post.likes.splice(index, 1);
    } else {
      post.likes.push(req.user.id);
    }

    await post.save();
    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/posts/:id/comments
// @desc    Comment on a post
// @access  Private
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    const newComment = {
      user: req.user.id,
      text: req.body.text
    };

    post.comments.unshift(newComment);
    await post.save();

    const populatedPost = await Post.findById(post.id)
      .populate('user', ['name', 'avatar'])
      .populate('comments.user', ['name', 'avatar']);
    
    res.json(populatedPost);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
