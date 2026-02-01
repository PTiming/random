const Post = require('../models/Post');
const moodleConnector = require('../services/moodleConnector');

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
  try {
    const { content, mediaUrls, tags, course, visibility } = req.body;

    const post = await Post.create({
      author: req.user._id,
      content,
      mediaUrls: mediaUrls || [],
      tags: tags || [],
      course,
      visibility: visibility || 'public'
    });

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'username firstName lastName avatar')
      .populate('course', 'name code');

    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get news feed
// @route   GET /api/posts/feed
// @access  Private
const getNewsFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Get posts from connections, enrolled courses, and public posts
    const posts = await Post.find({
      $or: [
        { visibility: 'public' },
        { author: { $in: req.user.following } },
        { course: { $in: req.user.enrolledCourses.map(c => c.courseId) } }
      ]
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username firstName lastName avatar')
      .populate('course', 'name code');

    const total = await Post.countDocuments({
      $or: [
        { visibility: 'public' },
        { author: { $in: req.user.following } },
        { course: { $in: req.user.enrolledCourses.map(c => c.courseId) } }
      ]
    });

    res.json({
      posts,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Like/unlike post
// @route   PUT /api/posts/:id/like
// @access  Private
const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const likeIndex = post.likes.findIndex(
      like => like.user.toString() === req.user._id.toString()
    );

    if (likeIndex > -1) {
      post.likes.splice(likeIndex, 1);
    } else {
      post.likes.push({ user: req.user._id });
    }

    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add comment to post
// @route   POST /api/posts/:id/comment
// @access  Private
const addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.comments.push({
      user: req.user._id,
      content: req.body.content
    });

    await post.save();
    
    const populatedPost = await Post.findById(post._id)
      .populate('author', 'username firstName lastName avatar')
      .populate('comments.user', 'username firstName lastName avatar');

    res.json(populatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Sync post to Moodle forum
// @route   POST /api/posts/:id/sync-to-moodle
// @access  Private
const syncToMoodle = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('course');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (!post.course || !post.course.moodleCourseId) {
      return res.status(400).json({ message: 'Post not linked to Moodle course' });
    }

    // Get course forums
    const forums = await moodleConnector.getCourseForums(post.course.moodleCourseId);
    
    if (forums.length === 0) {
      return res.status(400).json({ message: 'No forums found in Moodle course' });
    }

    // Post to first available forum
    const forumId = forums[0].id;
    const discussion = await moodleConnector.createForumDiscussion(
      forumId,
      'Post from Social Platform',
      post.content
    );

    post.moodleForumId = forumId;
    post.moodlePostId = discussion.discussionid;
    post.syncedToMoodle = true;
    post.syncedAt = new Date();
    await post.save();

    res.json({ message: 'Post synced to Moodle', post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPost,
  getNewsFeed,
  toggleLike,
  addComment,
  syncToMoodle
};
