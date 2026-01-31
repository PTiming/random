const express = require('express');
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const { protect, teacherOnly } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/posts
// @desc    Get all posts (with pagination)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .populate('author', 'name avatar role')
      .populate('comments.user', 'name avatar')
      .sort({ pinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments();

    res.json({
      success: true,
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching posts'
    });
  }
});

// @route   GET /api/posts/:id
// @desc    Get single post
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name avatar role')
      .populate('comments.user', 'name avatar');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.json({
      success: true,
      post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching post'
    });
  }
});

// @route   POST /api/posts
// @desc    Create new post
// @access  Private
router.post('/', protect, [
  body('content').trim().notEmpty().withMessage('Post content is required')
    .isLength({ max: 2000 }).withMessage('Post cannot exceed 2000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { content, mediaUrl, mediaType, course, isAnnouncement } = req.body;

    // Only teachers can create announcements
    const announcement = isAnnouncement && ['teacher', 'admin'].includes(req.user.role);

    const post = await Post.create({
      author: req.user._id,
      content,
      mediaUrl: mediaUrl || '',
      mediaType: mediaType || 'none',
      course: course || '',
      isAnnouncement: announcement
    });

    await post.populate('author', 'name avatar role');

    res.status(201).json({
      success: true,
      post
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating post'
    });
  }
});

// @route   PUT /api/posts/:id
// @desc    Update post
// @access  Private (owner only)
router.put('/:id', protect, async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check ownership
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this post'
      });
    }

    const { content, mediaUrl, mediaType, course } = req.body;

    post = await Post.findByIdAndUpdate(
      req.params.id,
      { content, mediaUrl, mediaType, course, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('author', 'name avatar role');

    res.json({
      success: true,
      post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating post'
    });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete post
// @access  Private (owner or admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check ownership or admin
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Post deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting post'
    });
  }
});

// @route   POST /api/posts/:id/like
// @desc    Like/unlike a post
// @access  Private
router.post('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const likeIndex = post.likes.indexOf(req.user._id);

    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
    } else {
      // Like
      post.likes.push(req.user._id);
    }

    await post.save();

    res.json({
      success: true,
      liked: likeIndex === -1,
      likesCount: post.likes.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error liking post'
    });
  }
});

// @route   POST /api/posts/:id/comment
// @desc    Add comment to post
// @access  Private
router.post('/:id/comment', protect, [
  body('text').trim().notEmpty().withMessage('Comment text is required')
    .isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const comment = {
      user: req.user._id,
      text: req.body.text
    };

    post.comments.push(comment);
    await post.save();

    await post.populate('comments.user', 'name avatar');

    res.status(201).json({
      success: true,
      comments: post.comments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding comment'
    });
  }
});

// @route   DELETE /api/posts/:id/comment/:commentId
// @desc    Delete comment
// @access  Private (comment owner or post owner or admin)
router.delete('/:id/comment/:commentId', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check authorization
    const isCommentOwner = comment.user.toString() === req.user._id.toString();
    const isPostOwner = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCommentOwner && !isPostOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }

    post.comments.pull(req.params.commentId);
    await post.save();

    res.json({
      success: true,
      message: 'Comment deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting comment'
    });
  }
});

// @route   PUT /api/posts/:id/pin
// @desc    Pin/unpin a post (teachers only)
// @access  Private (teacher/admin)
router.put('/:id/pin', protect, teacherOnly, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    post.pinned = !post.pinned;
    await post.save();

    res.json({
      success: true,
      pinned: post.pinned
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error pinning post'
    });
  }
});

module.exports = router;
