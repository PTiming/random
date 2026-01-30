const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const postController = require('../controllers/postController');
const auth = require('../middleware/auth');

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post('/', auth, [
  body('content').trim().isLength({ min: 1, max: 500 }).withMessage('Content must be between 1 and 500 characters')
], postController.createPost);

// @route   GET /api/posts/feed
// @desc    Get posts from followed users (home feed)
// @access  Private
router.get('/feed', auth, postController.getFeed);

// @route   GET /api/posts/explore
// @desc    Get all posts (explore)
// @access  Public
router.get('/explore', postController.getExplorePosts);

// @route   GET /api/posts/:id
// @desc    Get single post
// @access  Public
router.get('/:id', postController.getPost);

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete('/:id', auth, postController.deletePost);

// @route   POST /api/posts/:id/like
// @desc    Like a post
// @access  Private
router.post('/:id/like', auth, postController.likePost);

// @route   POST /api/posts/:id/unlike
// @desc    Unlike a post
// @access  Private
router.post('/:id/unlike', auth, postController.unlikePost);

// @route   POST /api/posts/:id/comments
// @desc    Add comment to post
// @access  Private
router.post('/:id/comments', auth, [
  body('text').trim().isLength({ min: 1, max: 300 }).withMessage('Comment must be between 1 and 300 characters')
], postController.addComment);

// @route   DELETE /api/posts/:postId/comments/:commentId
// @desc    Delete comment from post
// @access  Private
router.delete('/:postId/comments/:commentId', auth, postController.deleteComment);

module.exports = router;
