const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const postController = require('../controllers/postController');
const { auth, optionalAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

// Get feed
router.get('/feed', auth, postController.getFeed);

// Get Moodle posts
router.get('/moodle', auth, postController.getMoodlePosts);

// Get posts by tag
router.get('/tag/:tag', optionalAuth, postController.getPostsByTag);

// Create post
router.post('/', [
  auth,
  body('content')
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Post content must be between 1 and 5000 characters'),
  validate
], postController.createPost);

// Get single post
router.get('/:id', optionalAuth, postController.getPost);

// Update post
router.put('/:id', [
  auth,
  body('content')
    .optional()
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Post content must be between 1 and 5000 characters'),
  validate
], postController.updatePost);

// Delete post
router.delete('/:id', auth, postController.deletePost);

// Like/Unlike post
router.post('/:id/like', auth, postController.toggleLike);

// Add comment
router.post('/:id/comments', [
  auth,
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters'),
  validate
], postController.addComment);

// Delete comment
router.delete('/:id/comments/:commentId', auth, postController.deleteComment);

// Share post
router.post('/:id/share', auth, postController.sharePost);

module.exports = router;
