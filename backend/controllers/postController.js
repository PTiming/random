const Post = require('../models/Post');
const User = require('../models/User');

// @desc    Create a post
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res) => {
  try {
    const { content, postType, visibility, course, tags } = req.body;

    const postData = {
      user: req.user.id,
      content,
      postType: postType || 'general',
      visibility: visibility || 'public'
    };

    if (course) postData.course = course;
    if (tags) postData.tags = tags;

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      postData.images = req.files.map(file => `/uploads/${file.filename}`);
    }

    const post = await Post.create(postData);
    
    // Populate user info
    await post.populate('user', 'name avatar');

    res.status(201).json({
      success: true,
      post
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get all posts (feed)
// @route   GET /api/posts
// @access  Public
exports.getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Build query based on visibility
    let query = { visibility: 'public' };

    // If user is logged in, show more posts
    if (req.user) {
      const user = await User.findById(req.user.id);
      query = {
        $or: [
          { visibility: 'public' },
          { user: req.user.id },
          { visibility: 'followers', user: { $in: user.following } }
        ]
      };
    }

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .populate('user', 'name avatar')
      .populate('course', 'title shortName')
      .populate('comments.user', 'name avatar')
      .skip(startIndex)
      .limit(limit)
      .sort({ isPinned: -1, createdAt: -1 });

    res.json({
      success: true,
      count: posts.length,
      total,
      pagination: {
        page,
        pages: Math.ceil(total / limit)
      },
      posts
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'name avatar')
      .populate('course', 'title shortName')
      .populate('comments.user', 'name avatar')
      .populate('likes.user', 'name avatar');

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    res.json({
      success: true,
      post
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
exports.updatePost = async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Check ownership
    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this post'
      });
    }

    const { content, visibility, tags } = req.body;

    post.content = content || post.content;
    post.visibility = visibility || post.visibility;
    if (tags) post.tags = tags;
    post.isEdited = true;
    post.editedAt = new Date();

    await post.save();
    await post.populate('user', 'name avatar');

    res.json({
      success: true,
      post
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Check ownership or admin
    if (post.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this post'
      });
    }

    await post.deleteOne();

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Like/Unlike a post
// @route   POST /api/posts/:id/like
// @access  Private
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Check if already liked
    const likeIndex = post.likes.findIndex(
      like => like.user.toString() === req.user.id
    );

    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
    } else {
      // Like
      post.likes.push({ user: req.user.id });
    }

    await post.save();

    res.json({
      success: true,
      liked: likeIndex === -1,
      likeCount: post.likes.length
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Add comment to post
// @route   POST /api/posts/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Comment content is required'
      });
    }

    post.comments.push({
      user: req.user.id,
      content
    });

    await post.save();
    await post.populate('comments.user', 'name avatar');

    const newComment = post.comments[post.comments.length - 1];

    res.status(201).json({
      success: true,
      comment: newComment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Delete comment from post
// @route   DELETE /api/posts/:id/comments/:commentId
// @access  Private
exports.deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }

    // Check ownership
    if (comment.user.toString() !== req.user.id && 
        post.user.toString() !== req.user.id &&
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this comment'
      });
    }

    comment.deleteOne();
    await post.save();

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get user's posts
// @route   GET /api/posts/user/:userId
// @access  Public
exports.getUserPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    let query = { user: req.params.userId };

    // Filter by visibility if not the owner
    if (!req.user || req.user.id !== req.params.userId) {
      query.visibility = 'public';
    }

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .populate('user', 'name avatar')
      .populate('course', 'title shortName')
      .skip(startIndex)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: posts.length,
      total,
      pagination: {
        page,
        pages: Math.ceil(total / limit)
      },
      posts
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get posts for a course
// @route   GET /api/posts/course/:courseId
// @access  Private
exports.getCoursePosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const query = { course: req.params.courseId };

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .populate('user', 'name avatar')
      .populate('course', 'title shortName')
      .populate('comments.user', 'name avatar')
      .skip(startIndex)
      .limit(limit)
      .sort({ isPinned: -1, createdAt: -1 });

    res.json({
      success: true,
      count: posts.length,
      total,
      pagination: {
        page,
        pages: Math.ceil(total / limit)
      },
      posts
    });
  } catch (error) {
    console.error('Get course posts error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Search posts
// @route   GET /api/posts/search
// @access  Public
exports.searchPosts = async (req, res) => {
  try {
    const { q, tag } = req.query;
    
    let query = { visibility: 'public' };

    if (q) {
      query.content = { $regex: q, $options: 'i' };
    }

    if (tag) {
      query.tags = tag;
    }

    const posts = await Post.find(query)
      .populate('user', 'name avatar')
      .limit(20)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: posts.length,
      posts
    });
  } catch (error) {
    console.error('Search posts error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};
