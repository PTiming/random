const express = require('express');
const Post = require('../models/Post');
const User = require('../models/User');
const { auth, optionalAuth } = require('../middleware/auth');
const { validate, validationRules } = require('../middleware/validation');
const NotificationService = require('../services/notification/notificationService');

const router = express.Router();

/**
 * @route   GET /api/posts
 * @desc    Get posts feed
 * @access  Private
 */
router.get('/', auth, validationRules.pagination, validate, async (req, res) => {
  try {
    const { page = 1, limit = 20, filter } = req.query;
    const user = await User.findById(req.userId);
    
    // Build query based on visibility and connections
    let query = {
      isArchived: false,
      $or: [
        { visibility: 'public' },
        { author: req.userId },
        { 
          visibility: 'connections',
          author: { $in: user.connections }
        }
      ]
    };
    
    // Optional filters
    if (filter === 'following') {
      query.author = { $in: user.following };
    } else if (filter === 'connections') {
      query.author = { $in: user.connections };
    } else if (filter === 'mine') {
      query.author = req.userId;
    }
    
    const posts = await Post.find(query)
      .sort({ isPinned: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('author', 'username firstName lastName avatar')
      .populate('group', 'name avatar')
      .populate('comments.author', 'username firstName lastName avatar')
      .lean();
    
    // Add user reaction status
    const postsWithStatus = posts.map(post => ({
      ...post,
      hasReacted: post.reactions?.some(r => r.user.toString() === req.userId.toString()),
      userReaction: post.reactions?.find(r => r.user.toString() === req.userId.toString())?.type,
      reactionsCount: post.reactions?.length || 0,
      commentsCount: post.comments?.length || 0,
      sharesCount: post.shares?.length || 0
    }));
    
    const total = await Post.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        posts: postsWithStatus,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get posts'
    });
  }
});

/**
 * @route   GET /api/posts/:id
 * @desc    Get single post
 * @access  Public/Private
 */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username firstName lastName avatar')
      .populate('group', 'name avatar')
      .populate('comments.author', 'username firstName lastName avatar')
      .populate('comments.replies.author', 'username firstName lastName avatar');
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Check visibility
    if (post.visibility !== 'public' && !req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Increment view count
    post.metrics.views += 1;
    await post.save();
    
    const postData = post.toObject();
    if (req.userId) {
      postData.hasReacted = post.hasUserReacted(req.userId);
      postData.userReaction = post.getUserReaction(req.userId)?.type;
    }
    
    res.json({
      success: true,
      data: { post: postData }
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get post'
    });
  }
});

/**
 * @route   POST /api/posts
 * @desc    Create a post
 * @access  Private
 */
router.post('/', auth, validationRules.createPost, validate, async (req, res) => {
  try {
    const { content, visibility, media, tags, mentions, postType, group, course } = req.body;
    
    const post = new Post({
      author: req.userId,
      content,
      visibility: visibility || 'public',
      media: media || [],
      tags: tags || [],
      mentions: mentions || [],
      postType: postType || 'regular',
      group,
      course
    });
    
    await post.save();
    await post.populate('author', 'username firstName lastName avatar');
    
    // Send notifications to mentioned users
    if (mentions && mentions.length > 0) {
      const author = await User.findById(req.userId);
      for (const mentionedUserId of mentions) {
        if (mentionedUserId !== req.userId.toString()) {
          await NotificationService.createNotification({
            recipient: mentionedUserId,
            type: 'new_mention',
            title: 'You were mentioned',
            message: `${author.firstName} ${author.lastName} mentioned you in a post`,
            actor: req.userId,
            relatedEntity: { entityType: 'post', entityId: post._id }
          });
        }
      }
    }
    
    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: { post }
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create post'
    });
  }
});

/**
 * @route   PUT /api/posts/:id
 * @desc    Update a post
 * @access  Private
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    if (post.author.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this post'
      });
    }
    
    const allowedUpdates = ['content', 'visibility', 'media', 'tags'];
    for (const field of allowedUpdates) {
      if (req.body[field] !== undefined) {
        post[field] = req.body[field];
      }
    }
    
    post.isEdited = true;
    await post.save();
    await post.populate('author', 'username firstName lastName avatar');
    
    res.json({
      success: true,
      message: 'Post updated successfully',
      data: { post }
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update post'
    });
  }
});

/**
 * @route   DELETE /api/posts/:id
 * @desc    Delete a post
 * @access  Private
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    if (post.author.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }
    
    await Post.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post'
    });
  }
});

/**
 * @route   POST /api/posts/:id/react
 * @desc    Add/update reaction to a post
 * @access  Private
 */
router.post('/:id/react', auth, async (req, res) => {
  try {
    const { type = 'like' } = req.body;
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    const wasAlreadyReacted = post.hasUserReacted(req.userId);
    post.addReaction(req.userId, type);
    await post.save();
    
    // Send notification to post author (only if new reaction)
    if (!wasAlreadyReacted && post.author.toString() !== req.userId.toString()) {
      const reactor = await User.findById(req.userId);
      await NotificationService.createNotification({
        recipient: post.author,
        type: 'new_reaction',
        title: 'New Reaction',
        message: `${reactor.firstName} ${reactor.lastName} reacted to your post`,
        actor: req.userId,
        relatedEntity: { entityType: 'post', entityId: post._id }
      });
    }
    
    res.json({
      success: true,
      message: 'Reaction added',
      data: { reactionsCount: post.reactions.length }
    });
  } catch (error) {
    console.error('React to post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add reaction'
    });
  }
});

/**
 * @route   DELETE /api/posts/:id/react
 * @desc    Remove reaction from a post
 * @access  Private
 */
router.delete('/:id/react', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    post.removeReaction(req.userId);
    await post.save();
    
    res.json({
      success: true,
      message: 'Reaction removed',
      data: { reactionsCount: post.reactions.length }
    });
  } catch (error) {
    console.error('Remove reaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove reaction'
    });
  }
});

/**
 * @route   POST /api/posts/:id/comments
 * @desc    Add comment to a post
 * @access  Private
 */
router.post('/:id/comments', auth, validationRules.createComment, validate, async (req, res) => {
  try {
    const { content, mentions } = req.body;
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    const comment = {
      author: req.userId,
      content,
      mentions: mentions || [],
      createdAt: new Date()
    };
    
    post.comments.push(comment);
    await post.save();
    
    await post.populate('comments.author', 'username firstName lastName avatar');
    const newComment = post.comments[post.comments.length - 1];
    
    // Send notification to post author
    if (post.author.toString() !== req.userId.toString()) {
      const commenter = await User.findById(req.userId);
      await NotificationService.createNotification({
        recipient: post.author,
        type: 'new_comment',
        title: 'New Comment',
        message: `${commenter.firstName} ${commenter.lastName} commented on your post`,
        actor: req.userId,
        relatedEntity: { entityType: 'comment', entityId: newComment._id }
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Comment added',
      data: { comment: newComment }
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment'
    });
  }
});

/**
 * @route   DELETE /api/posts/:postId/comments/:commentId
 * @desc    Delete a comment
 * @access  Private
 */
router.delete('/:postId/comments/:commentId', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    const commentIndex = post.comments.findIndex(
      c => c._id.toString() === req.params.commentId
    );
    
    if (commentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }
    
    const comment = post.comments[commentIndex];
    
    // Check authorization
    if (comment.author.toString() !== req.userId.toString() && 
        post.author.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }
    
    post.comments.splice(commentIndex, 1);
    await post.save();
    
    res.json({
      success: true,
      message: 'Comment deleted'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete comment'
    });
  }
});

/**
 * @route   POST /api/posts/:id/share
 * @desc    Share a post
 * @access  Private
 */
router.post('/:id/share', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const originalPost = await Post.findById(req.params.id);
    
    if (!originalPost) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Create shared post
    const sharedPost = new Post({
      author: req.userId,
      content: content || '',
      visibility: 'public',
      originalPost: originalPost._id,
      postType: 'regular'
    });
    
    await sharedPost.save();
    
    // Add to original post's shares
    originalPost.shares.push({ user: req.userId });
    await originalPost.save();
    
    // Send notification
    if (originalPost.author.toString() !== req.userId.toString()) {
      const sharer = await User.findById(req.userId);
      await NotificationService.createNotification({
        recipient: originalPost.author,
        type: 'post_shared',
        title: 'Post Shared',
        message: `${sharer.firstName} ${sharer.lastName} shared your post`,
        actor: req.userId,
        relatedEntity: { entityType: 'post', entityId: sharedPost._id }
      });
    }
    
    await sharedPost.populate('author', 'username firstName lastName avatar');
    await sharedPost.populate('originalPost');
    
    res.status(201).json({
      success: true,
      message: 'Post shared successfully',
      data: { post: sharedPost }
    });
  } catch (error) {
    console.error('Share post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to share post'
    });
  }
});

module.exports = router;
