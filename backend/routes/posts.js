const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/auth');
const { apiLimiter, createPostLimiter } = require('../middleware/rateLimiter');
const upload = require('../middleware/upload');
const {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  likePost,
  addComment,
  deleteComment,
  getUserPosts,
  getCoursePosts,
  searchPosts
} = require('../controllers/postController');

// Apply rate limiting to all routes
router.use(apiLimiter);

// Public routes
router.get('/search', searchPosts);
router.get('/', optionalAuth, getPosts);
router.get('/:id', getPost);
router.get('/user/:userId', optionalAuth, getUserPosts);

// Protected routes with stricter limits for creating content
router.post('/', protect, createPostLimiter, upload.array('images', 5), createPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, likePost);
router.post('/:id/comments', protect, addComment);
router.delete('/:id/comments/:commentId', protect, deleteComment);
router.get('/course/:courseId', protect, getCoursePosts);

module.exports = router;
