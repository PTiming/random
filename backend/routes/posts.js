const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Course = require('../models/Course');
const { auth } = require('../middleware/auth');
const moodleService = require('../services/moodleService');

// Get news feed
router.get('/feed', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Get posts from user's connections and courses
    const posts = await Post.find({
      $or: [
        { author: { $in: req.user.connections } },
        { course: { $in: req.user.courses } },
        { author: req.user._id },
        { visibility: 'public' }
      ]
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'firstName lastName username profilePicture')
      .populate('course', 'name code')
      .populate('comments.author', 'firstName lastName username profilePicture');

    res.json({ posts, page, hasMore: posts.length === limit });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create post
router.post('/', auth, async (req, res) => {
  try {
    const post = new Post({
      ...req.body,
      author: req.user._id
    });

    await post.save();

    // Add post to course if specified
    if (post.course) {
      const course = await Course.findById(post.course);
      if (course) {
        course.posts.push(post._id);
        await course.save();
      }
    }

    // Sync to Moodle if enabled
    if (req.body.syncToMoodle && post.course) {
      const course = await Course.findById(post.course);
      if (course && course.moodleId && req.user.moodleId) {
        try {
          const moodlePost = await moodleService.createForumDiscussion(
            course.moodleId,
            post.content.substring(0, 100),
            post.content,
            req.user.moodleId
          );
          
          post.moodlePostId = moodlePost.discussionid;
          post.syncedToMoodle = true;
          post.lastMoodleSync = new Date();
          await post.save();
        } catch (error) {
          console.error('Failed to sync post to Moodle:', error.message);
        }
      }
    }

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'firstName lastName username profilePicture')
      .populate('course', 'name code');

    res.status(201).json({ post: populatedPost });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single post
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'firstName lastName username profilePicture')
      .populate('course', 'name code')
      .populate('comments.author', 'firstName lastName username profilePicture');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({ post });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Like post
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const alreadyLiked = post.likes.some(like => like.user.equals(req.user._id));

    if (alreadyLiked) {
      post.likes = post.likes.filter(like => !like.user.equals(req.user._id));
    } else {
      post.likes.push({ user: req.user._id });
    }

    await post.save();
    res.json({ post, liked: !alreadyLiked });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add comment
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    post.comments.push({
      author: req.user._id,
      content: req.body.content
    });

    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate('comments.author', 'firstName lastName username profilePicture');

    res.status(201).json({ post: updatedPost });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add reaction
router.post('/:id/react', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const existingReaction = post.reactions.findIndex(
      r => r.user.equals(req.user._id)
    );

    if (existingReaction >= 0) {
      post.reactions[existingReaction].type = req.body.type;
    } else {
      post.reactions.push({
        user: req.user._id,
        type: req.body.type
      });
    }

    await post.save();
    res.json({ post });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
