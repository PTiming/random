const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Create a new post
exports.createPost = async (req, res) => {
  try {
    const { content, images, video, visibility, tags, location, postType, moodleCourseId, moodleCourseName, moodleActivityId, moodleActivityType } = req.body;

    const post = new Post({
      author: req.userId,
      content,
      images: images || [],
      video: video || null,
      visibility: visibility || 'public',
      tags: tags || [],
      location: location || '',
      postType: postType || 'general',
      moodleCourseId,
      moodleCourseName,
      moodleActivityId,
      moodleActivityType
    });

    await post.save();
    await post.populate('author', 'username firstName lastName avatar');

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.emit('newPost', post);
    }

    res.status(201).json({ message: 'Post created successfully', post });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Error creating post', error: error.message });
  }
};

// Get news feed (posts from friends and self)
exports.getFeed = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const currentUser = await User.findById(req.userId);
    const friendIds = currentUser.friends.map(id => id.toString());
    const followingIds = currentUser.following.map(id => id.toString());
    
    // Get posts from self, friends, and following
    const userIds = [...new Set([req.userId, ...friendIds, ...followingIds])];

    const posts = await Post.find({
      $and: [
        { isActive: true },
        {
          $or: [
            { author: { $in: userIds }, visibility: { $in: ['public', 'friends'] } },
            { visibility: 'public' }
          ]
        }
      ]
    })
      .populate('author', 'username firstName lastName avatar')
      .populate({
        path: 'comments',
        options: { limit: 3, sort: { createdAt: -1 } },
        populate: { path: 'author', select: 'username firstName lastName avatar' }
      })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Post.countDocuments({
      $and: [
        { isActive: true },
        {
          $or: [
            { author: { $in: userIds }, visibility: { $in: ['public', 'friends'] } },
            { visibility: 'public' }
          ]
        }
      ]
    });

    res.json({
      posts,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ message: 'Error fetching feed', error: error.message });
  }
};

// Get single post
exports.getPost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id)
      .populate('author', 'username firstName lastName avatar')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'username firstName lastName avatar' }
      });

    if (!post || !post.isActive) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Error fetching post', error: error.message });
  }
};

// Update post
exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, visibility, tags, location } = req.body;

    const post = await Post.findById(id);

    if (!post || !post.isActive) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    post.content = content || post.content;
    post.visibility = visibility || post.visibility;
    post.tags = tags || post.tags;
    post.location = location !== undefined ? location : post.location;
    post.isEdited = true;
    post.editedAt = new Date();

    await post.save();
    await post.populate('author', 'username firstName lastName avatar');

    res.json({ message: 'Post updated successfully', post });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Error updating post', error: error.message });
  }
};

// Delete post (soft delete)
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    post.isActive = false;
    await post.save();

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Error deleting post', error: error.message });
  }
};

// Like/Unlike post
exports.toggleLike = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);

    if (!post || !post.isActive) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const likeIndex = post.likes.findIndex(
      like => like.user.toString() === req.userId
    );

    const io = req.app.get('io');
    const currentUser = await User.findById(req.userId).select('username firstName lastName avatar');

    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
      
      // Emit real-time unlike to post viewers
      if (io) {
        io.to(`post:${id}`).emit('postLiked', {
          postId: id,
          userId: req.userId,
          user: currentUser,
          liked: false,
          likesCount: post.likes.length
        });
      }
    } else {
      // Like
      post.likes.push({ user: req.userId });

      // Emit real-time like to post viewers
      if (io) {
        io.to(`post:${id}`).emit('postLiked', {
          postId: id,
          userId: req.userId,
          user: currentUser,
          liked: true,
          likesCount: post.likes.length
        });
      }

      // Create notification for post author (if not self)
      if (post.author.toString() !== req.userId) {
        const notification = new Notification({
          recipient: post.author,
          sender: req.userId,
          type: 'post_like',
          message: 'liked your post',
          relatedPost: post._id,
          link: `/posts/${post._id}`
        });
        await notification.save();
        await notification.populate('sender', 'username firstName lastName avatar');

        // Emit socket notification
        if (io) {
          io.to(post.author.toString()).emit('notification', notification);
        }
      }
    }

    await post.save();

    res.json({ 
      message: likeIndex > -1 ? 'Post unliked' : 'Post liked',
      likesCount: post.likes.length,
      isLiked: likeIndex === -1
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ message: 'Error toggling like', error: error.message });
  }
};

// Add comment to post
exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const post = await Post.findById(id);

    if (!post || !post.isActive) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = new Comment({
      post: id,
      author: req.userId,
      content
    });

    await comment.save();

    post.comments.push(comment._id);
    await post.save();

    await comment.populate('author', 'username firstName lastName avatar');

    // Emit real-time comment to all users viewing the post
    const io = req.app.get('io');
    if (io) {
      io.to(`post:${id}`).emit('commentAdded', {
        postId: id,
        comment: comment
      });
    }

    // Create notification for post author (if not self)
    if (post.author.toString() !== req.userId) {
      const notification = new Notification({
        recipient: post.author,
        sender: req.userId,
        type: 'post_comment',
        message: 'commented on your post',
        relatedPost: post._id,
        relatedComment: comment._id,
        link: `/posts/${post._id}`
      });
      await notification.save();
      await notification.populate('sender', 'username firstName lastName avatar');

      // Emit socket notification
      if (io) {
        io.to(post.author.toString()).emit('notification', notification);
      }
    }

    res.status(201).json({ message: 'Comment added successfully', comment });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Error adding comment', error: error.message });
  }
};

// Delete comment
exports.deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;

    const comment = await Comment.findById(commentId);

    if (!comment || !comment.isActive) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    comment.isActive = false;
    await comment.save();

    // Remove from post's comments array
    await Post.findByIdAndUpdate(id, {
      $pull: { comments: commentId }
    });

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Error deleting comment', error: error.message });
  }
};

// Share post
exports.sharePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const originalPost = await Post.findById(id);

    if (!originalPost || !originalPost.isActive) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Add share to original post
    originalPost.shares.push({ user: req.userId });
    await originalPost.save();

    // Create a new post as share
    const sharePost = new Post({
      author: req.userId,
      content: content || '',
      sharedPost: originalPost._id,
      postType: 'general'
    });

    await sharePost.save();
    await sharePost.populate('author', 'username firstName lastName avatar');

    // Create notification for original post author
    if (originalPost.author.toString() !== req.userId) {
      const notification = new Notification({
        recipient: originalPost.author,
        sender: req.userId,
        type: 'post_share',
        message: 'shared your post',
        relatedPost: originalPost._id,
        link: `/posts/${sharePost._id}`
      });
      await notification.save();

      const io = req.app.get('io');
      if (io) {
        io.to(originalPost.author.toString()).emit('notification', notification);
      }
    }

    res.json({ message: 'Post shared successfully', post: sharePost });
  } catch (error) {
    console.error('Share post error:', error);
    res.status(500).json({ message: 'Error sharing post', error: error.message });
  }
};

// Get posts by tag
exports.getPostsByTag = async (req, res) => {
  try {
    const { tag } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const posts = await Post.find({
      tags: { $in: [tag] },
      isActive: true,
      visibility: 'public'
    })
      .populate('author', 'username firstName lastName avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Post.countDocuments({
      tags: { $in: [tag] },
      isActive: true,
      visibility: 'public'
    });

    res.json({
      posts,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Get posts by tag error:', error);
    res.status(500).json({ message: 'Error fetching posts', error: error.message });
  }
};

// Get Moodle-related posts
exports.getMoodlePosts = async (req, res) => {
  try {
    const { courseId, page = 1, limit = 10 } = req.query;

    const query = {
      isActive: true,
      visibility: 'public',
      postType: { $in: ['moodle_course', 'moodle_achievement', 'moodle_discussion'] }
    };

    if (courseId) {
      query.moodleCourseId = courseId;
    }

    const posts = await Post.find(query)
      .populate('author', 'username firstName lastName avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Get Moodle posts error:', error);
    res.status(500).json({ message: 'Error fetching Moodle posts', error: error.message });
  }
};
